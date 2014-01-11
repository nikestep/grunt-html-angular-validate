/*
 * grunt-htmlint
 * https://github.com/nikestep/grunt-htmlint
 *
 * Copyright (c) 2014 Nik Estep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var w3cjs = require('w3cjs');
    var colors = require('colors');

    colors.setTheme({
        silly: 'rainbow',
        input: 'grey',
        verbose: 'cyan',
        prompt: 'grey',
        info: 'green',
        data: 'grey',
        help: 'cyan',
        warn: 'yellow',
        debug: 'blue',
        error: 'red',
        blue: 'blue'
    });

    grunt.registerMultiTask('htmlint', 'An HTML5 linter aimed at AngularJS projects.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            angular: true,
            customtags: [],
            customattrs: [],
            relaxerror: [],
            doctype: 'HTML5',
            charset: 'utf-8',
            reportpath: 'htmlint-report.json'
        });

        // Add a regex to customattrs for ng-* attributes
        if (options.angular) {
            options.customattrs.push('ng-(.*)');
        }

        // Delete an exist report if present
        if (options.reportpath !== null && grunt.file.exists(options.reportpath)) {
            grunt.file.delete(options.reportpath);
        }

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        // Set up the linked list for processing
        var fileCount = 0,
            list = {
                head: null,
                tail: null
            },
            succeedCount = 0,
            reportTime = new Date();

        // Iterate over all specified file groups
        var files = grunt.file.expand(this.filesSrc);
        for (var i = 0; i < files.length; i += 1) {
            if (!grunt.file.exists(files[i])) {
                // Warn that the file cannot be found
                grunt.log.warn('Source file "' + files[i] + '" not found.');
            } else {
                // Add the file to the list
                fileCount += 1;
                if (list.head === null) {
                    list.head = {
                        path: files[i],
                        next: null
                    };
                    list.tail = list.head;
                }
                else {
                    list.tail.next = {
                        path: files[i],
                        next: null
                    };
                    list.tail = list.tail.next;
                }
            }
        }

        // Check that we got files
        if (fileCount === 0) { 
            grunt.log.warn('No source files were found');
            done();
            return;
        }

        var checkRelaxed = function(errmsg) {
            for (var i = 0; i < options.relaxerror.length; i += 1) {
                var re = new RegExp(options.relaxerror[i], 'g');
                if (re.test(errmsg)) {
                    return true;
                }
            }
            return false;
        };

        var checkCustomTags = function(errmsg) {
            for (var i = 0; i < options.customtags.length; i += 1) {
                var re = new RegExp('^Element ' +
                                    options.customtags[i] +
                                    ' not allowed as child (.*)');
                if (re.test(errmsg)) {
                    return true;
                }
            }
            return false;
        };

        var checkCustomAttrs = function(errmsg) {
            for (var i = 0; i < options.customattrs.length; i += 1) {
                var re = new RegExp('^Attribute ' +
                                    options.customattrs[i] +
                                    ' not allowed on element (.*) at this point.');
                if (re.test(errmsg)) {
                    return true;
                }
            }
            return false;
        };

        var logErrMsg = function(file, msg) {
            // If we haven't logged this file before, write the starting line,
            // prep the file object is necessary, and mark that we've seen it
            if (file.seenerrs === undefined) {
                file.seenerrs = true;
                file.errs = [];
                grunt.log.writeln('Linting ' +
                                  file.path +
                                  ' ...' +
                                  'ERROR'.red);
            }

            // Log error message to console
            grunt.log.writeln('['.red +
                              'L'.yellow +
                              ('' + msg.lastLine).yellow +
                              ':'.red +
                              'C'.yellow +
                              ('' + msg.lastColumn).yellow +
                              '] '.red +
                              msg.message.yellow);

            // If we are expected to write a report, add to the error array
            if (options.reportpath !== null) {
                file.errs.push({
                    line: msg.lastLine,
                    col: msg.lastColumn,
                    msg: msg.message
                });
            }
        };

        var finished = function() {
            // Output report if necessary
            if (options.reportpath !== null) {
                // Build report
                var report = {
                    datetime: reportTime,
                    fileschecked: fileCount,
                    filessucceeded: succeedCount,
                    failed: []
                };

                var next = list.head;
                while (next !== null) {
                    if (next.errs !== undefined) {
                        report.failed.push({
                            filepath: next.path,
                            numerrs: next.errs.length,
                            errors: next.errs
                        });
                    }
                    next = next.next;
                }

                // Write the report out
                grunt.file.write(options.reportpath, JSON.stringify(report));
            }

            // Finished, let user and grunt know how it went
            if (succeedCount === fileCount) {
                grunt.log.oklns(succeedCount + ' files lint free');
                done();
            }
            else {
                grunt.fail.warn('HTML validation failed');
                done(false);
            }
        };

        var validate = function(file) {
            var results = w3cjs.validate({
                file: file.path,
                output: 'json',
                doctype: options.doctype,
                charset: options.charset,
                callback: function (res) {
                    // Handle results
                    var errFound = false;
                    for (var i = 0; i < res.messages.length; i += 1) {
                        // See if we should skip this error message
                        if (checkRelaxed(res.messages[i].message) ||
                            checkCustomTags(res.messages[i].message) ||
                            checkCustomAttrs(res.messages[i].message)) {
                            // Skip message (it is allowed)
                        } else {
                            // Log the error message
                            errFound = true;
                            logErrMsg(file, res.messages[i]);
                        }
                    }

                    // Count file as succeed if it did in fact succeed
                    if (!errFound) {
                        succeedCount += 1;
                    }

                    // Move on to next file or finish
                    if (file.next === null) {
                        finished();
                    } else {
                        validate(file.next);
                    }
                    // depending on the output type, res will either be a json object or a html string
                }
            });
        };

        // Start the validation
        validate(list.head);
    });
};