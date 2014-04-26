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
                stdout.indexOf('5 files passed validation') > 0,
                true,
                'valid files pass'
            );
            test.done();
        });
    },
};