'use strict';

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['mocha'],
    files: [
      'https://g.alicdn.com/kissy/k/1.3.2/seed.js',
      'node_modules/chai/chai.js',
      'node_modules/chai-dom/chai-dom.js',
      'dist/kissy/magix-es3-debug.js',
      'test/test-code/*.js',
      'test/app/**/*.js'
    ],
    preprocessors: {
      'dist/kissy/magix-es3-debug.js': ['coverage']
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