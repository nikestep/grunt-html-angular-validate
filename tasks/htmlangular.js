/*
 * grunt-html-angular-validate
 * https://github.com/nikestep/grunt-html-angular-validate
 *
 * Copyright (c) 2014 Nik Estep
 * Licensed under the MIT license.
 */

'use strict';

var colors = require('colors');
var validate = require('html-angular-validate');

var writeFileErrors = function(grunt, file) {
	// Start writing this file
	grunt.log.writeln('Validating ' +
					  file.filepath +
					  ' ...' +
					  'ERROR'.red);

	if (file.errors[0].msg === 'Unable to validate file') {
		grunt.log.writeln('Validating ' +
		                  file.filepath +
		                  ' ...' +
		                  'ERROR'.red);
		grunt.log.writeln('Unable to validate file'.yellow);
		return;
	}

	// Write each error
	for (var i = 0; i < file.errors.length; i += 1) {
		var err = file.errors[i];
		if (err.line !== undefined) {
			grunt.log.writeln('['.red +
							  'L'.yellow +
							  ('' + err.line).yellow +
							  ':'.red +
							  'C'.yellow +
							  ('' + err.col).yellow +
							  ']'.red +
							  ' ' +
							  err.msg.yellow);
		} else {
			grunt.log.writeln('['.red +
							  'file'.yellow +
							  ']'.red +
							  ' ' +
							  err.msg.yellow);
		}
	}
};

module.exports = function(grunt) {
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
		options.concurrentjobs = options.concurrentJobs;

        // Delete an exist report if present
        if (options.reportpath !== null && grunt.file.exists(options.reportpath)) {
            grunt.file.delete(options.reportpath);
        }

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

		// Run the validation plug in
        validate.validate(this.filesSrc, options).then(function(result) {
			// Finished, let user and grunt know how it went
		    if (result.allpassed) {
				// No errors to output - task success
		        grunt.log.oklns(result.filessucceeded + ' files passed validation');
		        done();
		    } else {
				// Output failures - task failure
				for (var i = 0; i < result.failed.length; i += 1) {
					writeFileErrors(grunt, result.failed[i]);
				}

				// Finalize output and send control back to grunt
		        grunt.fail.warn('HTML validation failed');
		        done(false);
		    }
        }, function(err) {
			// Validator failure - task failure
        	grunt.log.errorlns('Unable to perform validation');
			grunt.log.errorlns('html-angular-validate error: ' + err);
			done(false);
        });
    });
};
