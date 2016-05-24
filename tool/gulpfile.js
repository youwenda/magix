var gulp = require('gulp');
var uglify = require('gulp-uglify');
var fs = require('fs');
var path = require('path');
var rename = require('gulp-rename');
var tmpl = require('./lib/tmpl');
var doc = require('./lib/doc');
var sep = path.sep;
var modulesMap = {
  magix: 1,
  event: 1,
  vframe: 1,
  body: 1,
  view: 1
};
var type = 'cmd'; //打包kissy则type='kissy'
var extModules = {
  // linkage: 1,
  // base: 1,
  // style: 1,
  // cnum: 1,
  // ceach:1,
  // viewInit:1,
  // service: 1,
  // router: 1,
  // resource: 1,
  // tiprouter: 1,
  // share: 1
};
for (var p in extModules) {
  modulesMap[p] = extModules[p];
}

var copyFile = function(from, to, callback) {
  var folders = path.dirname(to).split(sep);
  var p = '';
  while (folders.length) {
    p += folders.shift() + sep;
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
  }
  var content = fs.readFileSync(from);
  if (callback) {
    content = callback(content + '');
  }
  fs.writeFileSync(to, content);
};

gulp.task('combine', function() {
  var incReg = new RegExp('Inc\\(\'.+?\\/tmpl\\/(.+)\'\\);?', 'g');
  copyFile('../src/magix/' + type + '/magix.js', '../dist/' + type + '/magix-debug.js', function(content) {
    content = content.replace(incReg, function(match, name) {
      if (modulesMap[name]) {
        return fs.readFileSync('../src/magix/tmpl/' + name + '.js') + '';
      }
      return '';
    });
    return tmpl(content, modulesMap);
  });
});

gulp.task('compress', function() {
  gulp.src('../dist/' + type + '/magix-debug.js')
    .pipe(uglify({
      banner: '/*Magix Licensed MIT*/',
      compress: {
        drop_console: true
      },
      output: {
        ascii_only: true
      }
    }))
    .pipe(rename('magix.js'))
    .pipe(gulp.dest('../dist/' + type + '/'));
});

gulp.task('doc', ['combine'],function() {
  var content = fs.readFileSync('../dist/' + type + '/magix-debug.js').toString();
  var main = doc(content);
  fs.writeFileSync('../doc/src/data.js', 'define("data",function(){return ' + JSON.stringify(main) + '})');
});