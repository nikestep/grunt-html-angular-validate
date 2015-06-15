# grunt-html-angular-validate
[![Build Status](https://travis-ci.org/nikestep/grunt-html-angular-validate.svg?branch=master)](https://travis-ci.org/nikestep/grunt-html-angular-validate) [![Dependency Status](https://david-dm.org/nikestep/grunt-html-angular-validate.svg)](https://david-dm.org/nikestep/grunt-html-angular-validate) [![devDependency Status](https://david-dm.org/nikestep/grunt-html-angular-validate/dev-status.svg)](https://david-dm.org/nikestep/grunt-html-angular-validate#info=devDependencies)

> An HTML validator aimed at AngularJS projects.

While there are other Grunt plugins that will validate HTML files, there are lacking a couple important features:

 * Support for AngularJS attributes and tags (both from AngularJS and custom created)
 * Support for templated/fragmented HTML files
 * Ability to concurrently validate files for greatly increased speed

This plugin looks to solve these problems and provide the value that comes with having HTML validation in the build chain.

Please note that this plugin works with the [w3cjs](https://github.com/thomasdavis/w3cjs) node plugin and will send files to be validated
against the W3C online validator tool. W3C asks that you be considerate of their free validator service and they will block your IP if
your traffic is deemed "excessive" by their servers. Such a block will automatically clear once the traffic subsides, but if your
project is large enough, you may need to run your own local W3C validator server. A guide for how to do this can be found
[here](https://github.com/tlvince/w3c-validator-guide). See the options below for pointing this plugin to a local validator service.

## v0.5.0 Upgrade Notes
If you are upgrading to use v0.5.0, there are a couple of things you should keep in mind. The warning messages have changed slightly
as a result of changes in other packages used by this plugin. You may find that existing excluded messages no longer work and you'll
need to update your gruntfile.

If you are using a local version of the w3c validator, upgrading may cause an incompatibility. You should investigate this and also
upgrading your local validator before commiting the upgrade to your project.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started)
guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once
you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-html-angular-validate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-html-angular-validate');
```

## The "htmlangular" task

### Overview
In your project's Gruntfile, add a section named `htmlangular` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  htmlangular: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.angular
Type: `Boolean`
Default value: `true`

Turns on ignoring of validation errors that are caused by AngularJS.

#### options.customtags
Type: `Array`
Default value: `[]`

List all of the custom tags you have created through directives and other means here. The validator will ignore warnings about these tags.

You can use the `'*'` wildcard, e.g.: `'custom-tags-*'`

#### options.customattrs
Type: `Array`
Default value: `[]`

List all of the custom attributes you have created through directives and other means here. The validator will ignore warnings about
these attributes.

You can use the `*` wildcard, e.g.: `'custom-attrs-*'`

#### options.wrapping
Type: `Object`
Default value: `{}`

Not all Angular templates start with tags that can be wrapped directly within the `<body>` tag. For templates like this, they first need
to be wrapped before the regular full-document wrapping that the plugin performs. As an example, a template for a row in a table might
look like this:

    <tr>
        <td>{name}</td>
        <td>{birthdate}</td>
        <td>{address}</td>
    </tr>

The entry into the `options.wrapping` plugin option would look like this:

    wrapping: {
        'tr': '<table>{0}</table>'
    }

The content of the template will be placed within the `{0}` and then the whole block will be wrapped like other templates. Note that the
name of the tag should not be wrapped with `<` and `>`.

#### options.relaxerror
Type: `Array`
Default value: `[]`

List the error strings you want explicitly ignored by the validator.

#### options.tmplext
Type: `String`
Default value: `tmpl.html`

The extension of HTML files that are templated or otherwise not complete and valid HTML files (i.e. do not start and end with `<html>`). The validator will wrap these files as complete HTML pages for validation.

#### options.doctype
Type: `String`
Default value: `HTML5`

The doctype to use when validating HTML files. Set to `false` to have the validator auto-detect the doctype.

#### options.charset
Type: `String`
Default value: `utf-8`

The charset to use when validating HTML files. Set to `false` to have the validator auto-detect the charset.

#### options.reportpath
Type: `String`
Default value: `html-angular-validate-report.json`

The path to write a JSON report of validation and linting output to after completion. Set to `null` to not create this file.

#### options.w3clocal
Type: `String`
Default value: `null`

Use this when running a local instance of the W3C validator service (e.g. `http://localhost:8080`). Do not use in conjunction with
`options.w3cproxy`.

#### options.w3cproxy
Type: `String`
Default value: `null`

The proxy to the W3C validator service. Use this as an alternative when running a local instance of the W3C validator service
(e.g. `http://localhost:8080`). Do not use in conjunction with `options.w3clocal`.

#### options.concurrentJobs
Type: `Integer`
Default value: `1`

The maximum number of validation jobs to run concurrently. Using a number greater than `1` can greatly increase validation speed
with many files, especially when running a local validation server.

This should only be used when you have your own validation server. W3C will shut you down much faster if you run concurrent
requests against them.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  htmlangular: {
    options: {
        tmplext: 'html.tmpl',
        customtags: [
            'top-nav',
            'left-bar',
            'right-bar',
            'client-footer'
        ],
        customattrs: [
            'fixed-width-box',
            'video-box'
        ],
        relaxerror: [
            'The frameborder attribute on the iframe element is obsolete. Use CSS instead.'
        ]
        reportpath: 'target/html-angular-validate-report.json'
    },
    files: {
      src: ['src/www/**/*.html', 'src/www/**/*.html.tmpl']
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

Before submitting a pull request, please run the tests to make sure you did not break any existing functionality:

```shell
grunt test
```

## Release History
 * 2015-06-15  v0.5.0  Fixed #22 (using new w3c validator)
 * 2015-03-26  v0.4.1  Fixed #17
 * 2014-08-08  v0.4.0  Pulled in #9 (concurrency introduced)
 * 2014-08-04  v0.3.5  Pulled in #7 and #8, dropped support for NodeJS 0.8
 * 2014-04-26  v0.3.0  Fixed #4, Fixed #5, created unit tests
 * 2014-02-04  v0.2.3  Fixed #2, fixed silly push mistake, add ui-* to default angular tags/attrs
 * 2014-02-04  v0.2.2  Fixed #1 and added W3C proxy option
 * 2014-01-27  v0.2.1  Renamed project
 * 2014-01-12  v0.2.0  Increased recognition of AngularJS caused validation erros
 * 2014-01-11  v0.1.0  Initial release
