/*
 * grunt-subtmpls
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
    var TMPL = 'tmpl';
    var MAGIX = 'magix';


    // ==========================================================================
    // TASKS
    // ==========================================================================
    // substitude tmpls for magix and mxext
    grunt.registerMultiTask('subtmpls', 'substitude tmpls in magix', function() {
        var dir = this.data.dir;

        var aimFile = dir + SEP + MAGIX + SEP + 'magix.js';
        var tmplFolder = dir + SEP + MAGIX + TMPL + SEP;
        var incReg = new RegExp("Inc\\('.+?\\/tmpl\\/(.+)'\\);?", 'g');
        var commentsReg = /#begin\s+([^#]+)#([\S\s]*?)#end#/g;
        grunt.file.copy(aimFile, aimFile, {
            process: function(content) {
                content = content.replace(incReg, function(match, name) {
                    return grunt.file.read(tmplFolder + name + ".js");
                });
                var cmts = {};
                content.replace(commentsReg, function(m, title, cnt) {
                    cmts[title] = cnt;
                });
                for (var p in cmts) {
                    var reg = new RegExp('#' + p + '#', 'g');
                    content = content.replace(reg, cmts[p]);
                }
                return content;
            }
        });
        grunt.file.delete(tmplFolder, {
            force: true
        });
    });
};