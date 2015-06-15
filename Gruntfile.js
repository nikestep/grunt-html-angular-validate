/*
 * grunt-html-angular-validate
 * https://github.com/nikestep/grunt-html-angular-validate
 *
 * Copyright (c) 2014 Nik Estep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.all %>',
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp'],
        },

        // Configurations to be run (and then tested).
        htmlangular: {
            default_options: {
                options: {
                    customtags: ['custom-tag', 'custom-*'],
                    customattrs: ['fixed-div-label', 'custom-*'],
                    wrapping: {
                        'tr': '<table>{0}</table>'
                    }
                },
                files: {
                    src: ['test/html/valid/**/*.html']
                }
            },
            default_options_concurrent: {
                options: {
                    customtags: ['custom-tag', 'custom-*'],
                    customattrs: ['fixed-div-label', 'custom-*'],
                    wrapping: {
                        'tr': '<table>{0}</table>'
                    },
                    concurrentJobs: 4
                },
                files: {
                    src: ['test/html/valid/**/*.html']
                }
            },
            missing_wrapping: {
                options: {
                },
                files: {
                    src: ['test/html/valid/template/valid_angular_table_row.tmpl.html']
                }
            },
            missing_custom_tags: {
                options: {
                },
                files: {
                    src: ['test/html/valid/full/valid_angular.html']
                }
            },
            missing_custom_attrs: {
                options: {
                },
                files: {
                    src: ['test/html/valid/template/valid_angular.tmpl.html']
                }
            },
            template_missing_extension: {
                options: {
                },
                files: {
                    src: ['test/html/invalid/template_missing_extension.html']
                }
            },
            missing_closing_tag: {
                options: {
                },
                files: {
                    src: ['test/html/invalid/missing_closing_tag.tmpl.html']
                }
            },
            improperly_closed_tag: {
                options: {
                },
                files: {
                    src: ['test/html/invalid/improperly_closed_tag.tmpl.html']
                }
            },
            improperly_nested_tags: {
                options: {
                },
                files: {
                    src: ['test/html/invalid/improperly_nested_tags.tmpl.html']
                }
            },
            improper_angular_operator: {
                options: {
                },
                files: {
                    src: ['test/html/invalid/improper_angular_operator.tmpl.html']
                }
            },
            improper_angular_operator_relaxed: {
                options: {
                    relaxerror: [
                        '“&” did not start a character reference. (“&” probably should have been escaped as “&amp;”.)'
                    ],
                },
                files: {
                    src: ['test/html/invalid/improper_angular_operator.tmpl.html']
                }
            }
        },

        // Unit tests.
        nodeunit: {
            all: ['test/*_test.js'],
        },

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'nodeunit:all']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['clean', 'jshint', 'test']);

};
