var gulp = require('gulp');
var uglify = require('gulp-uglify');
var fs = require('fs');
var path = require('path');
var rename = require('gulp-rename');
var tmpl = require('./lib/tmpl');
var doc = require('./lib/doc');
var pkg = require('../package.json');
var sep = path.sep;
var modulesMap = {
  magix: 1, //公用方法及入口
  event: 1, //pubsub
  vframe: 1, //
  body: 1, //dom事件处理模块
  view: 1
};
var type = 'cmd'; //打包kissy则type='kissy'

var extModules = {//完整功能的magix,对应magix.js
  linkage: 1, //vframe上是否带父子间调用的方法，通常在移动端并不需要
  base: 1, //base模块
  style: 1, //是否有样式处理
  // cnum: 1,
  // ceach:1,
  viewInit: 1, //init方法
  service: 1, //接口服务
  router: 1, //路由模块
  resource: 1, //资源管理,不建议使用了,用wrapAsync足够了
  //edgerouter: 1, //使用pushState
  //tiprouter: 1, //切换页面时，如果开发者明确告诉magix数据有改变，则会提示用户
  // share: 1,//向子或孙view公开数据
  //collectView: 1,//收集同一个view中所有的子view并一次性发出请求，在请求combine时有用
  //layerVframe: 1,//父子化同一个view中嵌套存在的vframe
  autoEndUpdate: 1, //自动识别并结束更新。针对没有tmpl属性的view自动识别并结束更新
  viewRelate: 1, //view上是否增加relate方法，当一些节点在view范围外面，但需要响应view事件时有用
  configIni: 1, //是否有ini配置文件
  mxOptions: 1, //支持节点上添加mx-options属性
  viewMerge: 1 //view是否提供merge方法供扩展原型链对象
};
var coreModules = { //核心模块取上面的常用扩展模块做到核心中去，对应magix-core.js
  core: 1, //打包核心功能
  viewInit: 1,
  autoEndUpdate: 1
};

for (var p in modulesMap) {
  extModules[p] = modulesMap[p];
  coreModules[p] = modulesMap[p];
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
      if (extModules[name]) {
        return fs.readFileSync('../src/magix/tmpl/' + name + '.js') + '';
      }
      return '';
    });
    return tmpl('/*' + pkg.version + '*/' + content, extModules);
  });
  copyFile('../src/magix/' + type + '/magix.js', '../dist/' + type + '/magix-core-debug.js', function(content) {
    content = content.replace(incReg, function(match, name) {
      if (coreModules[name]) {
        return fs.readFileSync('../src/magix/tmpl/' + name + '.js') + '';
      }
      return '';
    });
    return tmpl('/*' + pkg.version + '*/' + content, coreModules);
  });
});

gulp.task('compress', function() {
  gulp.src('../dist/' + type + '/magix-debug.js')
    .pipe(uglify({
      banner: '/*Magix' + pkg.version + ' Licensed MIT*/',
      compress: {
        drop_console: true
      },
      output: {
        ascii_only: true
      }
    }))
    .pipe(rename('magix.js'))
    .pipe(gulp.dest('../dist/' + type + '/'));
  gulp.src('../dist/' + type + '/magix-core-debug.js')
    .pipe(uglify({
      banner: '/*Magix' + pkg.version + ' Licensed MIT*/',
      compress: {
        drop_console: true
      },
      output: {
        ascii_only: true
      }
    }))
    .pipe(rename('magix-core.js'))
    .pipe(gulp.dest('../dist/' + type + '/'));
});

gulp.task('doc', ['combine'], function() {
  var content = fs.readFileSync('../dist/' + type + '/magix-debug.js').toString();
  var main = doc(content);
  fs.writeFileSync('../../magix-doc3/tmpl/data.js', 'define("data",function(){return ' + JSON.stringify(main) + '})');
});