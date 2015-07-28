/**
 * Copyright (c) 2013 思霏
 * used to package magix
 */
module.exports = function(grunt) {
    var srcDir = '../../src';
    var tmpDir = '../../tmp';
    var distDir = '../../dist';
    var docDir = '../../docs';
    var combosDir = '../../combos';
    var platType = '2.0'; //String(grunt.option('platType')).replace(/'/g, ''); //'1.0' or 'm1.0'
    var loaderType = String(grunt.option('loaderType')).replace(/'/g, ''); //'kissy' or 'seajs'

    if (!platType || !loaderType) {
        grunt.fail.warn('please enter right params');
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cpsource: {
            build: {
                source: srcDir,
                dir: tmpDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        deconsole: {
            build: {
                dir: tmpDir
            }
        },
        subtmpls: {
            build: {
                dir: tmpDir
            }
        },
        concatfiles: {
            build: {
                dir: tmpDir,
                distDir: distDir,
                loaderType: loaderType,
                platType: platType,
                combosDir: combosDir
            }
        },
        removeunimpl: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        compresslibs: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        copytocombos: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType,
                combosDir: combosDir
            }
        },
        unsetry: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        generatedoc: {
            build: {
                docDir: docDir,
                dir: tmpDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        clean: {
            options: {
                force: true
            },
            build: {
                src: [tmpDir]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadTasks('tasks');
    grunt.registerTask('default', ['cpsource', 'deconsole', 'subtmpls', /*'generatedoc',*/ 'concatfiles', 'removeunimpl', 'compresslibs', 'copytocombos', 'unsetry', 'clean']);
    // grunt.registerTask('default', ['exec']);
};