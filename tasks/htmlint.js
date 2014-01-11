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
            charset: 'utf-8'
        });

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        // Set up the linked list for processing
        var count = 0,
            list = {
                head: null,
                tail: null
            },
            succeedCount = 0;

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {
            // Build the list of files to validate
            f.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    // Warn that the file cannot be found
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    // Add the file to the list
                    count += 1;
                    if (list.head === null) {
                        list.head = {
                            path: filepath,
                            next: null
                        };
                        list.tail = list.head;
                    }
                    else {
                        list.tail.next = {
                            path: filepath,
                            next: null
                        };
                        list.tail = list.tail.next;
                    }
                    return true;
                }
            });
        });

        // Check that we got files
        if (count === 0) { 
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

        var validate = function(file) {
            var results = w3cjs.validate({
                file: file.path,
                output: 'json',
                doctype: options.doctype,
                charset: options.charset,
                callback: function (res) {
                    // Handle results
                    if (res.messages.length === 0) {
                        succeedCount += 1;
                    } else {
                        grunt.log.writeln('Linting ' +
                                          file.path +
                                          ' ...' +
                                          'ERROR'.red);
                        for (var i = 0; i < res.messages.length; i += 1) {
                            // See if we should skip this error message
                            if (checkRelaxed(res.messages[i].message) ||
                                checkCustomTags(res.messages[i].message) ||
                                checkCustomAttrs(res.messages[i].message)) {
                                grunt.log.errorlns('Supressing further errors');
                            } else {
                                grunt.log.writeln('['.red +
                                                  'L'.yellow +
                                                  ('' + res.messages[i].lastLine).yellow +
                                                  ':'.red +
                                                  'C'.yellow +
                                                  ('' + res.messages[i].lastColumn).yellow +
                                                  '] '.red +
                                                  res.messages[i].message.yellow);
                            }
                        }
                    }

                    // Move on to next file or finish
                    if (file.next === null) {
                        if (succeedCount === count) {
                            grunt.log.oklns(succeedCount + ' files lint free');
                            done();
                        }
                        else {
                            grunt.fail.warn('HTML validation failed');
                            done(false);
                        }
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