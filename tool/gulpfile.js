var gulp = require('gulp');
var uglify = require('gulp-uglify');
var fs = require('fs');
var path = require('path');
var rename = require('gulp-rename');
var header = require('gulp-header');
var tmpl = require('./lib/tmpl');
var doc = require('./lib/doc');
var pkg = require('../package.json');
var sep = path.sep;
var modules = {
  magix: 1, //公用方法及入口
  event: 1, //pubsub
  vframe: 1, //vframe
  body: 1, //dom事件处理模块
  view: 1, //view
  cnum: 1, //Cache num
  ceach: 1, //Cache each
  tipRouter: 1, //切换页面时，如果开发者明确告诉magix数据有改变，则会提示用户
  tipLockUrlRouter: 1,//锁定url功能
  edgeRouter: 1, //使用pushState
  collectView: 1, //收集同一个view中所有的子view并一次性发出请求，在请求combine时有用
  updaterSetState: 1, //updater是否由用户指定更新。即用户指定什么就更新什么，不管值有没有改变
  forceEdgeRouter: 1, //强制使用pushState
  serviceCombine: 1, //接口combine
  updater: 1, //自动更新
  viewProtoMixins: 1, //支持mixins
  share: 1, //向子或孙view公开数据
  core: 1, //核心模块
  autoEndUpdate: 1, //自动识别并结束更新。针对没有tmpl属性的view自动识别并结束更新
  linkage: 1, //vframe上是否带父子间调用的方法，通常在移动端并不需要
  base: 1, //base模块
  style: 1, //是否有样式处理
  viewInit: 1, //init方法
  service: 1, //接口服务
  router: 1, //路由模块
  resource: 1, //资源管理
  configIni: 1, //是否有ini配置文件
  nodeAttachVframe: 1, //节点上挂vframe对象
  mxInit: 1, //支持mx-init获取数据
  viewMerge: 1 //view是否提供merge方法供扩展原型链对象
};
var type = 'cmd,amd,kissy,webpack'; //打包kissy则type='kissy'
var enableModules = 'magix,event,vframe,body,view,tmpl,updater,share,core,autoEndUpdate,linkage,style,viewInit,service,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updaterSetState,viewProtoMixins,base';
//coreModules='magix,event,vframe,body,view,tmpl,updater,core,viewInit,autoEndUpdate';
//loaderModules='loader,magix,event,vframe';

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
  var map = {};
  var others = [];
  enableModules.split(',').forEach(function(m) {
    map[m.trim()] = 1;
  });
  for (var p in modules) {
    if (!map[p]) {
      others.push(p);
    }
  }
  var incReg = new RegExp('Inc\\(\'.+?\\/tmpl\\/(.+)\'\\);?', 'g');
  type.split(',').forEach(function(t) {
    copyFile('../src/' + t + '/magix.js', '../dist/' + t + '/magix-debug.js', function(content) {
      content = content.replace(incReg, function(match, name) {
        if (map[name]) {
          return fs.readFileSync('../src/tmpl/' + name + '.js') + '';
        }
        return '';
      });
      var header = '/*!' + pkg.version + ' Licensed MIT*/';
      header += '\r\n/*\r\nauthor:xinglie.lkf@alibaba-inc.com;kooboy_li@163.com\r\nloader:' + t;
      header += '\r\nenables:' + enableModules;
      header += '\r\n\r\noptionals:' + others;
      header += '\r\n*/\r\n';
      return tmpl(header + content, map);
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
  var content = fs.readFileSync('../dist/' + (type.split(',')[0]) + '/magix-debug.js').toString();
  var main = doc(content);
  fs.writeFileSync('../../magix-doc3/tmpl/data.js', 'define("data",function(){return ' + JSON.stringify(main) + '})');
});
