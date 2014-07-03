/*
 * grunt-concatfiles
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

    // ==========================================================================
    // TASKS
    // ==========================================================================
    //concat all useful files
    grunt.registerMultiTask('concatfiles', 'concat magix files due to order', function() {
        var dir = this.data.dir;
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;
        //var addMagixStartFile = this.data.addMagixStartFile;

        var combosDir = this.data.combosDir;

        var maPrefix = dir + SEP + MAGIX + SEP;
        var magixArr = ['magix', 'event', 'router', 'vom', 'vframe', 'view', 'model', 'manager'];
        //删除dist中原来的文件
        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';
        var distArr = ['.js', '-min.js'];
        for (var i = 0; i < distArr.length; i++) {
            var f = destMagixPrefix + distArr[i];
            if (grunt.file.isFile(f)) {
                grunt.file.delete(f, {
                    force: true
                });
            }
        }
        grunt.config.set('copy', {
            main: {
                files: [{
                    expand: true,
                    cwd: maPrefix,
                    src: ['**'],
                    dest: [combosDir, platType, loaderType, MAGIX].join(SEP)
                }]

            }
        });

        grunt.task.run('copy');
        //concat 生成库文件
        var maFiles = [];
        for (var i = 0; i < magixArr.length; i++) {
            maFiles.push(maPrefix + magixArr[i] + '.js');
        }

        var basicFiles = maFiles;
        var footer = '';

        var lib = 'define';
        if (loaderType == 'kissy') {
            lib = 'KISSY';
        }
        footer = ';document.createElement("vframe");})(null,this,document,function(){},"\\u001f","",",",' + lib + ')';
        grunt.config.set('concat', {
            options: {
                banner: '(function(NULL,WINDOW,DOCUMENT,NOOP,SPLITER,EMPTY,COMMA,LIB,IdIt,COUNTER){COUNTER=1;IdIt=function(n){return n.id||(n.id=\'mx_n_\'+COUNTER++)};',
                separator: '\n',
                footer: footer
            },
            basic: {
                src: basicFiles,
                dest: destMagixPrefix + '.js'
            }

        });
        grunt.task.run('concat');


    });
};