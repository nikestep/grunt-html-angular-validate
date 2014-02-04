# grunt-html-angular-validate

> An HTML validator aimed at AngularJS projects.

While there are other Grunt plugins that will validate HTML files, there are lacking a couple important features:

 * Support for AngularJS attributes and tags (both from AngularJS and custom created)
 * Support for templated/fragmented HTML files

This plugin looks to solve these problems and provide the value that comes with having HTML validation in the build chain. Please note that this plugin works with the [w3cjs](https://github.com/thomasdavis/w3cjs) node plugin and will send files to be validated against the W3C online validator tool.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

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

#### options.customattrs
Type: `Array`
Default value: `[]`

List the error strings you want explicitly ignored by the validator.

#### options.relaxerror
Type: `Array`
Default value: `[]`

List all of the custom tags you have created through directives and other means here. The validator will ignore warnings about these tags.

### options.tmplext
Type: `String`
Default value: `tmpl.html`

The extension of HTML files that are templated or otherwise not complete and valid HTML files (i.e. do not start and end with `<html>`). The validator will wrap these files as complete HTML pages for validation.

###options.doctype
Type: `String`
Default value: `HTML5`

The doctype to use when validating HTML files. Set to `false` to have the validator auto-detect the doctype.

###options.charset
Type: `String`
Default value: `utf-8`

The charset to use when validating HTML files. Set to `false` to have the validator auto-detect the charset.

###options.reportpath
Type: `String`
Default value: `html-angular-validate-report.json`

The path to write a JSON report of validation and linting output to after completion. Set to `null` to not create this file.

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
      src: ['src/www/**/*.html', 'src/www/**/*.html.tmpl'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2014-01-27  v0.2.1  Renamed project
 * 2014-01-12  v0.2.0  Increased recognition of AngularJS caused validation erros
 * 2014-01-11  v0.1.0  Initial release