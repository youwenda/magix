---
title: 环境搭建
layout: tutorial
---

# 2. 环境搭建

首先需要为项目搭建好环境, 可以按照手动搭建一步步完成, 也可以直接克隆脚手架到本地。
项目使用的核心库:

- jquery-1.11: 兼容IE6+。 可以根据需要使用zepto, KISSY
- requirejs: 模块加载器。 可以根据需要选择seajs, KISSY
- magix3.1.5: magix提供了多种类库对接的版本，我们这里选择jquery + requirejs版本。 可以根据需要选择KISSY 或 seajs版本。甚至自己定制：https://github.com/thx/magix/issues/10

## 手动搭建

1. 命令行进入到要保存项目的目录, 新建并进入项目目录: `mkdir magix-todo-app && cd magix-todo-app`
2. 初始化npm: `npm init`, 全部回车填默认信息
3. 安装所需npm包:

        npm install del gulp gulp-cssnano gulp-load-plugins gulp-uglify gulp-watch gulp-webserver magix-combine run-sequence --save-dev

    项目使用gulp管理常用的任务, 如编译、监听文件修改等

4. 创建环境配置文件: `touch config.json`:

        {
            "tmplFolder": "./tmpl",
            "srcFolder": "./src",
            "buildFolder": "./build",
            "port": 5555
        }

    其中每个字段的用途如下:
    - tmplFolder: 项目源文件目录, 我们编辑的文件都放在这里。如视图的js代码和html代码, 源文件需要通过编译之后才能正常运行
    - srcFolder: 源文件编译后的文件目录, 能被模块加载器识别的模块, html代码被注入到js文件中。 没有经过压缩, 方便调试
    - buildFoler: srcFolder下的文件压缩后保存的目录, 用于上线
5. 执行`mkdir -p tmpl/vendor`创建vendor目录用于保存第三方js库, 如jquery
6. 执行`mkdir -p tmpl/app`创建app目录用于保存项目文件
7. 下载[jquery.js][1], [requirejs][2], [Magix.js][3]保存到`tmpl/vendor`目录下, 下载[bootstrap.css][5]到`tmpl/app/asset/`目录下
8. 新建gulpfile.js配置开发所需task: `touch gulpfile.js`

        var gulp = require('gulp')
        var $ = require('gulp-load-plugins')()
        var runSequence = require('run-sequence')
        var combineTool = require('magix-combine')
        var fs = require('fs')
        var del = require('del')
        var config = require('./config.json')

        /**
         * 配置Magix打包工具
         **/
        combineTool.config({
            tmplFolder: config.tmplFolder,
            srcFolder: config.srcFolder,
            buildFolder: config.buildFolder,
            loaderType: 'amd', //requirejs default === cmd
            excludeTmplFolders: [
                './tmpl/vendor/' //not add define
            ]
        })

        gulp.task('delSrc', function() {
            return del(config.srcFolder)
        })
        /**
         * combine命令: 把tmplFolder下的html和js合并到srcFolder下
         */
        gulp.task('combine', ['delSrc'], function() {
            combineTool.combine()
        })

        gulp.task('watch', ['combine'], function() {
            $.watch('./tmpl/**/*', function(e) {
                if (fs.existsSync(e.path)) {
                    combineTool.processFile(e.path)
                } else {
                    combineTool.removeFile(e.path)
                }
            })
        })

        gulp.task('delBuild', function() {
            return del('./build')
        })

        gulp.task('build', ['delBuild'], function() {
            gulp.src(config.srcFolder + '/**/*.js')
                .pipe($.uglify({
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    }
                }))
                .pipe(gulp.dest(config.buildFolder))

            gulp.src(config.srcFolder + '/**/*.css')
                .pipe($.cssnano({
                    safe: true
                }))
                .pipe(gulp.dest(config.buildFolder))
        })


        gulp.task('webserver',  function() {
            gulp.src('./')
                .pipe($.webserver({
                    livereload: true,
                    open: false,
                    port: config.port
                }))
        })



        gulp.task('dev', function(callback) {
            runSequence(
                'watch',
                'webserver',
                callback
            )
        })

    这里的`magix-combine`是magix所需的编译工具, 主要函数功能如下:

    - combineTool.config(): 配置源码目录、编译目标目录、加载器类型、源码目录中不需要编译的目录
    - combineTool.combine(): 将`tmplFolder`下面的视图html文件打包到js文件中, 并按照需要将js文件包装成加载器所需规范的组件, 如AMD, CMD
    - combineTool.processFile(): 调用编译工具处理单个文件
    - combineTool.removeFile(): 当文件被删除后，通知编译工具移除相关的缓存等资源


9. 新建index.html文件作为项目入口`touch index.html`

        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no">
            <title>Document</title>
            <link rel="stylesheet" href="./src/app/asset/bootstrap.min.css">
            <script src="./src/vendor/require.js"></script>
        </head>
        <body>


        <script>
        var pathBase = './src/'
        require.config({
            paths: {
                jquery: pathBase + 'vendor/jquery',
                magix: pathBase + 'vendor/magix'
            }
        })

        // magix为了同时支持jquery和zepto, 在依赖的时候，使用了中性名称$，代表jquery或者zepto，具体是使用jquery还是zepto
        // 需要在这里对使用的框架进行配置才能被正确解析
        define('$',['jquery'],function($){
            return $
        })

        require(['jquery', 'magix'], function ($, Magix) {
            console.log('jquery', $)
            console.log('magix' , Magix)
        })
        </script>

        </body>
        </html>

    注意我们的变量`pathBase`，开发阶段我们配置jquery和magix路径到`src`目录, 上线时修改为`build`目录即可

10. 项目主要关注Magix部分, 所以样式使用了目前流行的bootstrap.css

11. 命令行运行`gulp dev`, 浏览器访问`http://localhost:5555/`, 控制台输出下面类似的代码表示安装成功

        jquery ( selector, context ) {
                // The jQuery object is actually just the init constructor 'enhanced'
                // Need init if jQuery is called (just allow error to be thrown if not included)
                return new…
        magix Object {Event: Object, Router: Object}

## 脚手架搭建

1. 克隆本教程项目[magix-todo-app][4]到本地.
2. git切换到step-2分支`git checkout step-02-set-up-finish`
3. 安装npm组件`npm install`
4. 命令行运行`gulp dev`, 浏览器访问`http://localhost:5555/`, 控制台显示类似输出表示安装成功

        jquery ( selector, context ) {
                // The jQuery object is actually just the init constructor 'enhanced'
                // Need init if jQuery is called (just allow error to be thrown if not included)
                return new…
        magix Object {Event: Object, Router: Object}



## 小结

- Magix针对主流加载器, js库提供了对应的不同版本, 供不同需求用户选择
- Magix配套打包工具将html打包到模块文件中, 避免额外HTTP请求, 提高效率方便使用
- Magix有三个目录, 代码流向`tmplFolder`  --> `srcFolder` --> `buildFolder`
    - `tmplFolder`: 项目源文件目录, 在这个目录下进行开发
    - `srcFolder`: 本地调试目录, 源文件使用工具打包后保存的目录
    - `buildFolder`: 发布目录, 调试目录文件的压缩版本, 用于发布上线
- Magix使用`$`代表jquery或者zepto, 方便用户自由选择, 用户需要以下配置

        define('$',['jquery'],function($){
            return $
        })
- 如果你是从github clone的脚手架, 执行`git checkout <分支名>`可以切换到对应每一步完成是的状态, 这样可以保证在每一步教程开始时与教程保持相同的项目代码


[5]: http://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css
[4]: https://github.com/thx/magix-todo-app
[3]: https://raw.githubusercontent.com/thx/magix/master/dist/amd/magix-debug.js
[2]: http://requirejs.org/docs/release/2.2.0/comments/require.js
[1]: https://code.jquery.com/jquery-1.11.3.js
