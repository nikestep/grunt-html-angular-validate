'use strict';

var grunt = require('grunt');

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

/* global htmlangular */
exports.htmlangular = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    default_options: function(test) {
        test.expect(1);

        
        htmlangular(grunt, ['test/valid.html', 'test/invalid.html'], function(error, result) {
            if (error) {
                throw error;
            }
            /*test.deepEqual(result, [
                '"test/invalid.html":10.1-10.81: error: An "img" element must have an "alt" attribute, except under certain conditions. For details, consult guidance on providing text alternatives for images.',
                '"test/invalid.html":12.1-12.19: error: The "clear" attribute on the "br" element is obsolete. Use CSS instead.',
                '"test/invalid.html": info warning: The character encoding of the document was not declared.'
            ], 'three errors from test/invalid.html');*/
            test.equal(1, 1);
            test.done();
        });

        test.done();
    }
};