let gulp = require('gulp');
let uglify = require('gulp-uglify');
let fs = require('fs');
let rename = require('gulp-rename');
let header = require('gulp-header');
let doc = require('./lib/doc');
let pkg = require('../package.json');
let customize = require('./customize');

let type = 'cmd,amd,kissy,webpack'; //打包kissy则type='kissy'
let enableModules = 'magix,event,vframe,body,view,tmpl,updater,share,core,autoEndUpdate,linkage,style,viewInit,service,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updaterSetState,viewProtoMixins,base';
//coreModules='magix,event,vframe,body,view,tmpl,updater,core,viewInit,autoEndUpdate';
//loaderModules='loader,magix,event,vframe';

gulp.task('combine', function() {

    type.split(',').forEach(function(t) {
        customize({
            loaderType: t,
            tmplFile: '../src/' + t + '/magix.js',
            aimFile: '../dist/' + t + '/magix-debug.js',
            enableModules: enableModules
        });
    });
});

gulp.task('compress', function() {
    type.split(',').forEach(function(t) {
        gulp.src('../dist/' + t + '/magix-debug.js')
            .pipe(uglify({
                compress: {
                    drop_console: true
                },
                output: {
                    ascii_only: true
                }
            }))
            .pipe(header('/*<%=ver%> Licensed MIT*/', {
                ver: pkg.version
            }))
            .pipe(rename('magix.js'))
            .pipe(gulp.dest('../dist/' + t + '/'));
    });
});

gulp.task('doc', ['combine'], function() {
    let content = fs.readFileSync('../dist/' + (type.split(',')[0]) + '/magix-debug.js').toString();
    let main = doc(content);
    fs.writeFileSync('../../magix-doc3/tmpl/data.js', 'define("data",function(){return ' + JSON.stringify(main) + '})');
});