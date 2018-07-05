'use strict';

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['mocha'],
    files: [
      'https://g.alicdn.com/kissy/k/1.3.2/seed.js',
      'https://g.alicdn.com/kissy/k/1.3.2/sizzle.js',
      'test/test-code/common.js',
      'node_modules/chai/chai.js',
      'node_modules/chai-dom/chai-dom.js',
      'https://g.alicdn.com/thx/magix/1.0/kissy-magix-mxext.js',
      'test/app/**/*.js',
      'test/test-code/*.js',
      'test/test-code/magix@1.0.html'
    ],
    preprocessors: {
      'https://g.alicdn.com/thx/magix/1.0/kissy-magix-mxext.js': ['coverage']
    },
    plugins: ['karma-mocha', 'karma-chai', 'karma-coverage', 'karma-spec-reporter', 'karma-chrome-launcher'],
    browsers: ['Chrome'],
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'test/coverage',
      reporters: [{
        type: 'json',
        subdir: '.',
        file: 'coverage.json',
      }, {
        type: 'lcov',
        subdir: '.'
      }, {
        type: 'text-summary'
      }]
    }
  });
};