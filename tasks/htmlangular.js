/*
 * grunt-html-angular-validate
 * https://github.com/nikestep/grunt-html-angular-validate
 *
 * Copyright (c) 2014 Nik Estep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var w3cjs = require('w3cjs');
    var async = require('async');
    var colors = require('colors');
    var tmp = require('temporary');
    var max_validate_attempts = 3;

    // Prototype string with an endsWith function
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    grunt.registerMultiTask('htmlangular', 'An HTML5 validator aimed at AngularJS projects.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            angular: true,
            customtags: [],
            customattrs: [],
            wrapping: {},
            relaxerror: [],
            tmplext: 'tmpl.html',
            doctype: 'HTML5',
            charset: 'utf-8',
            reportpath: 'html-angular-validate-report.json',
            w3clocal: null,
            w3cproxy: null,
            concurrentJobs: 1
        });

        // Parse wildcard '*' to RegExp '(.*)'
        ['customtags', 'customattrs'].forEach(function(prop) {
            for (var i = 0; i < options[prop].length; i += 1) {
                options[prop][i] = options[prop][i].replace(/\*/g, '(.*)');
            }
        });

        // Add attributes to ignore if this is for AngularJS
        if (options.angular) {
            options.customtags.push('ng-(.*)');
            options.customtags.push('ui-(.*)');
            options.customattrs.push('ng-(.*)');
            options.customattrs.push('ui-(.*)');
            options.customattrs.push('on');
        }
		
        // Ignore certain default warnings
        options.relaxerror.push('The Content-Type was');
        options.relaxerror.push('The character encoding was not declared');
        options.relaxerror.push('Using the schema for HTML with');

        // Delete an exist report if present
        if (options.reportpath !== null && grunt.file.exists(options.reportpath)) {
            grunt.file.delete(options.reportpath);
        }

        // Set local w3c server
        if (options.w3clocal !== null) {
            w3cjs.setW3cCheckUrl(options.w3clocal);
        }

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var files,
            reportTime = new Date();

        files = grunt.file.expand(this.filesSrc).filter(function(file) {
            if (!grunt.file.exists(file)) {
                grunt.log.warn('Source file "' + file + '" not found.');
                return false;
            }
            return true;
        }).map(function(file) {
            return {
                path: file,
                istmpl: file.endsWith(options.tmplext),
                attempts: 0
            };
        });

        // Check that we got files
        if (files.length === 0) {
            grunt.log.warn('No source files were found');
            done();
            return;
        }

        var checkRelaxed = function(errmsg) {
            for (var i = 0; i < options.relaxerror.length; i += 1) {
                if (errmsg.indexOf(options.relaxerror[i]) !== -1) {
                    return true;
                }
            }
            return false;
        };

        var checkCustomTags = function(errmsg) {
            for (var i = 0; i < options.customtags.length; i += 1) {
                var re = new RegExp('^Element (.?)' +
                                    options.customtags[i] +
                                    '(.?) not allowed as child (.*)');
                if (re.test(errmsg)) {
                    return true;
                }
            }
            return false;
        };

        var checkCustomAttrs = function(errmsg) {
            for (var i = 0; i < options.customattrs.length; i += 1) {
                var re = new RegExp('Attribute (.?)' +
                                    options.customattrs[i] +
                                    '(.?) not allowed on element (.*) at this point.');
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
                grunt.log.writeln('Validating ' +
                                  file.path +
                                  ' ...' +
                                  'ERROR'.red);
            }

            // Log error message to console
            grunt.log.writeln('['.red +
                              'L'.yellow +
                              ('' + ((file.istmpl) ? msg.lastLine - 4 : msg.lastLine)).yellow +
                              ':'.red +
                              'C'.yellow +
                              ('' + msg.lastColumn).yellow +
                              '] '.red +
                              msg.message.yellow);

            // If we are expected to write a report, add to the error array
            if (options.reportpath !== null) {
                file.errs.push({
                    line: (file.istmpl) ? msg.lastLine - 4: msg.lastLine,
                    col: msg.lastColumn,
                    msg: msg.message
                });
            }
        };

        var failFile = function(file) {
            // Assume we have not logged errors for this file before
            file.seenerrs = true;
            file.errs = [{
                line: 0,
                col: 0,
                msg: 'Unable to validate file'
            }];

            // Write the console
            grunt.log.writeln('Validating ' +
                              file.path +
                              ' ...' +
                              'ERROR'.red);
            grunt.log.writeln('Unable to validate file'.yellow);
        };

        var finished = function(succeedCount) {
            // Output report if necessary
            if (options.reportpath !== null) {
                // Build report
                var report = {
                    datetime: reportTime,
                    fileschecked: files.length,
                    filessucceeded: succeedCount,
                    failed: []
                };

                report.failed = files.filter(function(file) {
                    return file.errs !== undefined;
                }).map(function(file) {
                    return {
                        filepath: file.path,
                        numerrs: file.errs.length,
                        errors: file.errs
                    };
                });

                // Write the report out
                grunt.file.write(options.reportpath, JSON.stringify(report));
            }

            // Finished, let user and grunt know how it went
            if (succeedCount === files.length) {
                grunt.log.oklns(succeedCount + ' files passed validation');
                done();
            }
            else {
                grunt.fail.warn('HTML validation failed');
                done(false);
            }
        };

        var validate = function(file, callback) {
            var temppath = file.path;

            // If this is a templated file, we need to wrap it as a full
            // document in a temporary file
            if (file.istmpl) {
                // Create a temporary file
                var tfile = new tmp.File();

                // Store temp path as one to pass to validator
                temppath = tfile.path;

                // Create a wrapped file to pass to the validator
                var content = grunt.file.read(file.path).trim();
                for (var key in options.wrapping) {
                    if (options.wrapping.hasOwnProperty(key)) {
                        var tag = '^<' + key + '[^>]*>';
                        if (content.match(tag)) {
                            content = options.wrapping[key].replace('{0}', content);
                            break;
                        }
                    }
                }

                // Build temporary file
                grunt.file.write (temppath,
                                  '<!DOCTYPE html>\n<html>\n<head><title>Dummy</title></head>\n<body>\n' +
                                  content +
                                  '\n</body>\n</html>');
            }

            // Do validation
            var results = w3cjs.validate({
                file: temppath,
                output: 'json',
                doctype: options.doctype,
                charset: options.charset,
                proxy: options.w3cproxy,
                callback: function (res) {
                    // Validate result
                    if (res === undefined || res.messages === undefined) {
                        // Something went wrong
                        //   See if we should try again or fail this file and
                        //   move on
                        if (file.attempts < max_validate_attempts) {
                            // Increment the attempt count and try again
                            file.attempts += 1;
                            validate(file, callback);
                        } else {
                            // Fail the file and stop remaining validations
                            failFile(file);
                            callback('Unable to check file');
                        }
                    } else {
                        // Handle results
                        var errFound = false;
                        for (var i = 0; i < res.messages.length; i += 1) {
                            // See if this error message is valid
                            if (!checkRelaxed(res.messages[i].message) &&
                                !checkCustomTags(res.messages[i].message) &&
                                !checkCustomAttrs(res.messages[i].message)) {
                                // Log the error message
                                errFound = true;
                                logErrMsg(file, res.messages[i]);
                            }
                        }

                        // Clean up temporary file if needed
                        if (file.istmpl) {
                            tfile.unlink();
                        }

                        // Callback: no halting error, success indicator
                        callback(null, !errFound);
                    }
                }
            });
        };

        // Start the validation
        async.mapLimit(files, options.concurrentJobs, validate,
        function(err, results) {
            finished(results.filter(Boolean).length);
        });
    });
};
