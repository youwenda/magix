var wrapTMPL = 'define(\'${moduleId}\',[${requires}],function(require){\r\n/*${vars}*/\r\n${content}\r\n});';
var wrapNoDepsTMPL = 'define(\'${moduleId}\',function(){\r\n${content}\r\n});';
var wrapNoExports = 'seajs.use([${requires}],function(${vars}){${content}});';

var tmplFolder = 'tmpl'; //template folder
var srcFolder = 'src'; //source folder
var buildFolder = 'build'; //build folder
var excludeTmplFolders = [
    'tmpl/libs/'
];
var onlyAllows = {
    '.html': 1,
    '.css': 1,
    '.json': 1
};


var gulp = require('gulp');
var path = require('path');
var watch = require('gulp-watch');
var nano = require('cssnano');
var htmlminifier = require('html-minifier');
var fs = require('fs');
var del = require('del');
var buildTool = require('../src/build');

var sep = path.sep;
var sepReg = sep.replace(/\\/g, '\\\\');

tmplFolder = path.resolve(tmplFolder);
srcFolder = path.resolve(srcFolder);

buildFolder = path.resolve(buildFolder);

var tmplFolderName = path.basename(tmplFolder);
var srcFolderName = path.basename(srcFolder);
var buildFolderName = path.basename(buildFolder);
var moduleIdRemovedPath = path.resolve(tmplFolder);
buildTool.config({
    nano: nano,
    htmlminifier: htmlminifier,
    htmlminifierOptions: {
        removeComments: true, //注释
        collapseWhitespace: true, //空白
        //removeAttributeQuotes: true, //属性引号
        quoteCharacter: '"',
        keepClosingSlash: true, //
    },
    excludeTmplFolders: excludeTmplFolders,
    onlyAllows: onlyAllows,
    moduleIdRemoved: moduleIdRemovedPath,
    prefix: 'mp-',
    snippets: {
        loading: '<div class="loading"><span></span></div>'
    },
    tmplCommand: /<%[\s\S]+?%>/g,
    compressTmplCommand: function(tmpl) {
        var stores = {},
            idx = 1,
            key = '&\u001e';
        tmpl = tmpl.replace(/<%[^=][\s\S]*?%>\s*/g, function(m, k) {
            k = key + idx++;
            stores[k] = m;
            return k;
        });
        tmpl = tmpl.replace(/(?:&\u001e\d+){2,}/g, function(m) {
            m = m.replace(/&\u001e\d+/g, function(n) {
                return stores[n];
            });
            return m.replace(/%>\s*<%/g, ';').replace(/([\{\}]);/g, '$1');
        });
        //console.log(tmpl);
        tmpl= tmpl.replace(/&\u001e\d+/g, function(n) {
            //console.log(n,stores[n]);
            return stores[n];
        });
        //console.log(tmpl);
        return tmpl;
    },
    atAttrProcessor: function(name, tmpl, info) {
        if (name == 'pmap') {
            return '<%if(!window[\'' + tmpl + '\']){%>pm-hide="true"<%}%>';
        }
        if (info.prop) {
            var cond = tmpl.replace(/<%=([\s\S]+?)%>/g, '$1');
            return '<%if(' + cond + '){%>' + name + '<%}%>';
        }
        if (info.partial) {
            return tmpl;
        }
        return name + '="' + tmpl + '"';
    },
    generateJSFile: function(o) {
        var tmpl = o.requires.length ? wrapTMPL : wrapNoDepsTMPL;
        // if (!o.hasExports) {
        //     tmpl = wrapNoExports;
        // }
        for (var p in o) {
            var reg = new RegExp('\\$\\{' + p + '\\}', 'g');
            tmpl = tmpl.replace(reg, (o[p] + '').replace(/\$/g, '$$$$'));
        }
        return tmpl;
    }
});

var tmplReg = new RegExp('(' + sepReg + '?)' + tmplFolderName + sepReg),
    srcHolder = '$1' + srcFolderName + sep,
    srcReg = new RegExp('(' + sepReg + '?)' + srcFolderName + sepReg),
    buildHolder = '$1' + buildFolderName + sep;
gulp.task('cleanSrc', function() {
    return del(srcFolder);
});
gulp.task('combine', ['cleanSrc'], function() {
    buildTool.walk(tmplFolder, function(filepath) {
        var from = filepath;
        var to = from.replace(tmplReg, srcHolder);
        buildTool.processFile(from, to);
    });
});
gulp.task('watch', ['combine'], function() {
    watch(tmplFolder + '/**/*', function(e) {
        if (fs.existsSync(e.path)) {
            buildTool.processFile(e.path, e.path.replace(tmplReg, srcHolder), true);
        } else {
            var file = e.path.replace(tmplReg, srcHolder);
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
            buildTool.removeFile(file);
        }
    });
});

var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
gulp.task('cleanBuild', function() {
    return del(buildFolder);
});
gulp.task('build', ['cleanBuild'], function() {
    buildTool.walk(srcFolder, function(p) {
        buildTool.copyFile(p, p.replace(srcReg, buildHolder));
    });
    gulp.src(buildFolder + '/**/*.js')
        .pipe(uglify({
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }))
        .pipe(gulp.dest(buildFolder));

    gulp.src(buildFolder + '/**/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(buildFolder));
});