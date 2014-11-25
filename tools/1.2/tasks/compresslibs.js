/*
 * grunt-compresslibs
 * Copyright (c) 2013 思霏
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    // Grunt utilities.
    var task = grunt.task;
    var file = grunt.file;
    var utils = grunt.utils;
    var log = grunt.log;
    var verbose = grunt.verbose;
    var fail = grunt.fail;
    var option = grunt.option;
    var config = grunt.config;
    var template = grunt.template;

    // external dependencies
    var Fs = require('fs');
    var Path = require('path');
    var Helper = require('../libs/helper');

    var SEP = Path.sep;
    var MAGIX = 'magix';
    var MXEXT = 'mxext';

    grunt.registerMultiTask('removeunimpl', 'remove unimpl', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';

        [destMagixPrefix + '.js'].forEach(function(f) {
            grunt.file.copy(f, f, {
                process: function(content) {
                    content = content.replace(/\w+:\s*(Magix\.)?[Uu]nimpl\s*,?/g, '');
                    content = content.replace(/include\s*:\s*Include,/g, '');
                    content = content.replace(/debug\s*:\s*'\*_\*',/, '//debug-*_*');

                    content = content.replace(/window([\.,\r\n])/g, 'WINDOW$1');
                    content = content.replace(/([=:\?])\s*null\b/g, '$1NULL');
                    content = content.replace(/(?:KISSY|define)([\.\(])/g, 'LIB$1');
                    content = content.replace(/document([\.\[\r\n])/g, 'DOCUMENT$1');
                    content = content.replace(/var\s+IdIt\s*=[^}]+\};/gm, '');
                    content = content.replace(/'\\u001a'/g, 'SPLITER');
                    content = content.replace(/_win_/g, 'window');
                    return content;
                }
            });
        });
    });
    // ==========================================================================
    // TASKS
    // ==========================================================================
    //concat all useful files
    grunt.registerMultiTask('compresslibs', 'compress lib files', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';
        var jsMinMap = {};
        jsMinMap[destMagixPrefix + '-min.js'] = destMagixPrefix + '.js';

        //begin 压缩吧～
        grunt.config.set('uglify', {
            options: {
                preserveComments: 'some'
            },
            my_target: {
                files: jsMinMap
            }
        });
        grunt.task.run('uglify');

    });

    grunt.registerMultiTask('unsetry', 'remove try catch', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';

        [destMagixPrefix + '.js'].forEach(function(f) {
            grunt.file.copy(f, f, {
                process: function(content) {
                    content = content.replace(/\S*\/\*_\*\//g, '');
                    content = content.replace('//debug-*_*', "debug:'*_*',");
                    content = content.replace('//KEEPCONSOLE', 'console');
                    return content;
                }
            });
        });
    });

    grunt.registerMultiTask('copytocombos', 'to combos', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;
        var combosDir = this.data.combosDir;

        var o1 = distDir + SEP + platType + SEP + loaderType + '-magix.js';
        var d1 = combosDir + SEP + platType + SEP + loaderType + SEP + loaderType + '-magix.js';
        var o2 = distDir + SEP + platType + SEP + loaderType + '-magix-min.js';
        var d2 = combosDir + SEP + platType + SEP + loaderType + SEP + loaderType + '-magix-min.js';
        console.log(o1, d1);
        grunt.file.copy(o1, d1);
        grunt.file.copy(o2, d2);
    });
};