'use strict';

/*
    ======== A Handy Little Nodeunit Reference ========
    https://github.com/caolan/nodeunit

    Test methods:
        test.expect(numAssertions)
        test.done()
    Test assertions:
        test.ok(value, [message])
        test.equal(actual, expected, [message])
        test.notEqual(actual, expected, [message])
        test.deepEqual(actual, expected, [message])
        test.notDeepEqual(actual, expected, [message])
        test.strictEqual(actual, expected, [message])
        test.notStrictEqual(actual, expected, [message])
        test.throws(block, [error], [message])
        test.doesNotThrow(block, [error], [message])
        test.ifError(value)
*/

var
    path = require('path'),
    exec = require('child_process').exec,
    execOptions = {
        cwd: path.join(__dirname, '..')
    }
;

exports.tests = {
    default_options: function(test) {
        test.expect(1);
        exec('grunt htmlangular:default_options', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('6 files passed validation') > -1,
                true,
                'valid files pass'
            );
            test.done();
        });
    },
    default_options_concurrent: function(test) {
        test.expect(1);
        exec('grunt htmlangular:default_options_concurrent', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('6 files passed validation') > -1,
                true,
                'valid files pass'
            );
            test.done();
        });
    },
    missing_wrapping: function(test) {
        test.expect(4);
        exec('grunt htmlangular:missing_wrapping', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Stray start tag “tr”') > -1,
                true,
                'found unwrapped starting <tr>'
            );
            test.equal(
                stdout.indexOf('Stray start tag “td”') > -1,
                true,
                'found unwrapped starting <td>'
            );
            test.equal(
                stdout.indexOf('Stray end tag “td”') > -1,
                true,
                'found unwrapped starting <td>'
            );
            test.equal(
                stdout.indexOf('Stray end tag “tr”') > -1,
                true,
                'found unwrapped starting <tr>'
            );
            test.done();
        });
    },
    missing_custom_tags: function(test) {
        test.expect(1);
        exec('grunt htmlangular:missing_custom_tags', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Element “custom-tag” not allowed as child') > -1,
                true,
                'found custom tag'
            );
            test.done();
        });
    },
    missing_custom_attrs: function(test) {
        test.expect(1);
        exec('grunt htmlangular:missing_custom_attrs', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Attribute “fixed-div-label” not allowed on element') > -1,
                true,
                'found custom attribute'
            );
            test.done();
        });
    },
    template_missing_extension: function(test) {
        test.expect(1);
        exec('grunt htmlangular:template_missing_extension', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Element “head” is missing a required instance of child element “title”') > -1,
                true,
                'figured out it is just template'
            );
            test.done();
        });
    },
    missing_closing_tag: function(test) {
        test.expect(1);
        exec('grunt htmlangular:missing_closing_tag', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Unclosed element “div”') > -1,
                true,
                'found unclosed div'
            );
            test.done();
        });
    },
    improperly_closed_tag: function(test) {
        test.expect(2);
        exec('grunt htmlangular:improperly_closed_tag', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('Self-closing syntax (“/>”) used on a non-void HTML element') > -1,
                true,
                'found self-closed span'
            );
            test.equal(
                stdout.indexOf('Unclosed element “span”') > -1,
                true,
                'found unclosed span'
            );
            test.done();
        });
    },
    improperly_nested_tags: function(test) {
        test.expect(2);
        exec('grunt htmlangular:improperly_nested_tags', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('End tag “b” violates nesting rules') > -1,
                true,
                'found <b> closed too early'
            );
            test.equal(
                stdout.indexOf('No “i” element in scope but a “i” end tag seen') > -1,
                true,
                'found <i> closed too late'
            );
            test.done();
        });
    },
    improper_angular_operator: function(test) {
        test.expect(1);
        exec('grunt htmlangular:improper_angular_operator', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('“&” did not start a character reference. (“&” probably should have been escaped as “&amp;”.)') > -1,
                true,
                'found && in expression'
            );
            test.done();
        });
    },
    improper_angular_operator_relaxed: function(test) {
        test.expect(1);
        exec('grunt htmlangular:improper_angular_operator_relaxed', execOptions, function(error, stdout) {
            test.equal(
                stdout.indexOf('“&” did not start a character reference. (“&” probably should have been escaped as “&amp;”.)') === -1,
                true,
                'relaxed ignored error'
            );
            test.done();
        });
    }
};
