var wrapTMPL = 'define(\'${moduleId}\',[${requires}],function(require){\r\n/*${vars}*/\r\n${content}\r\n});';
var wrapNoDepsTMPL = 'define(\'${moduleId}\',function(){\r\n${content}\r\n});';
var wrapNoExports = 'seajs.use([${requires}],function(${vars}){${content}});';
var config = require('./config.json');
var $ = require('gulp-load-plugins')();
var autoPrefixerConfig = {};
var runSequence = require('run-sequence');

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
var fs = require('fs');
var del = require('del');
var combineTool = require('magix-combine');

combineTool.config({
    nanoOptions: {
        safe: true
    },
    htmlminifierOptions: {
        removeComments: true, //注释
        collapseWhitespace: true, //空白
        //removeAttributeQuotes: true, //属性引号
        quoteCharacter: '"',
        keepClosingSlash: true, //
    },
    excludeTmplFolders: excludeTmplFolders,
    onlyAllows: onlyAllows,
    prefix: 'mp-',
    snippets: {
        loading: '<div class="loading"><span></span></div>'
    },
    tmplCommand: /<%[\s\S]+?%>/g,
    compressTmplCommand: function(tmpl) {
        var stores = {},
            idx = 1,
            key = '&\u001e';
        tmpl = tmpl.replace(/<%(=)?([\s\S]*?)%>/g, function(m, oper, content) {
            return '<%' + (oper ? '=' : '') + content.trim() + '%>';
        });
        tmpl = tmpl.replace(/<%[^=][\s\S]*?%>\s*/g, function(m, k) {
            k = key + (idx++) + key;
            stores[k] = m;
            return k;
        });
        tmpl = tmpl.replace(/(?:&\u001e\d+&\u001e){2,}/g, function(m) {
            m = m.replace(/&\u001e\d+&\u001e/g, function(n) {
                return stores[n];
            });
            return m.replace(/%>\s*<%/g, ';').replace(/([\{\}]);/g, '$1');
        });
        //console.log(tmpl);
        tmpl = tmpl.replace(/&\u001e\d+&\u001e/g, function(n) {
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
        for (var p in o) {
            var reg = new RegExp('\\$\\{' + p + '\\}', 'g');
            tmpl = tmpl.replace(reg, (o[p] + '').replace(/\$/g, '$$$$'));
        }
        tmpl = tmpl.replace(/module\.exports\s*=\s*/, 'return ');
        return tmpl;
    }
});

gulp.task('cleanSrc', function() {
    return del(srcFolder);
});
gulp.task('combine', ['cleanSrc'], function() {
    combineTool.combine();
});


gulp.task('sass', function() {
    return gulp.src([tmplFolder + '/**/*.scss'])
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer(autoPrefixerConfig))
        .pipe(gulp.dest(tmplFolder + ''));
});

gulp.task('watch', ['combine'], function() {
    watch(tmplFolder + '/**/*', function(e) {
        console.log(e.path);
        if (path.extname(e.path) == '.scss') {
            if (config.incrementBuild) {
                return gulp.src([e.path])
                    .pipe($.sass().on('error', $.sass.logError))
                    .pipe($.autoprefixer(autoPrefixerConfig))
                    .pipe(gulp.dest(path.dirname(e.path)));
            } else {
                runSequence('sass');
            }
            return;
        }
        if (fs.existsSync(e.path)) {
            combineTool.processFile(e.path);
        } else {
            combineTool.removeFile(e.path);
        }
    });
});

var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
gulp.task('cleanBuild', function() {
    return del(buildFolder);
});
gulp.task('build', ['cleanBuild'], function() {
    combineTool.build();
    gulp.src(buildFolder + '/**/*.js')
        .pipe(uglify({
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }))
        .pipe(gulp.dest(buildFolder));

    gulp.src(buildFolder + '/**/*.css')
        .pipe(cssnano({
            safe: true
        }))
        .pipe(gulp.dest(buildFolder));
});