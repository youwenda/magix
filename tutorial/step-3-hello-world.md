---
title: Hello world &#58; APP核心工作流程
layout: tutorial
---

# 3. Hello world: APP核心工作流程

通过`Magix.boot({})`启动Magix项目, Magix根据boot方法传入的配置初始化系统, 加载模块渲染页面.


## 配置requirejs

之前搭建环境步骤新建的`tmpl/app`目录是用来存放项目相关文件的, 所有项目相关模块都是`app`开头的, 所以我们在`index.html`中添加app配置:

    var pathBase = './src/'

    require.config({
        paths: {
            app: pathBase + 'app',
            jquery: pathBase + 'vendor/jquery',
            magix: pathBase + 'vendor/magix'
        }
    })

    /**
     * Magix为了同时支持jquery和zepto, 使用通用的$表示这两个框架
     * 在这里设置$为我们需要的框架
     **/
    define('$',['jquery'],function($){
        return $
    })




## 启动Magix

通过`Magix.boot({})`启动Magix项目, Magix根据boot方法传入的配置初始化系统, 加载模块渲染页面.


    require(['$', 'magix'], function ($, Magix) {

        Magix.boot({
            defaultView: 'app/view/default',       // Magix启动渲染的默认视图
            defaultPath: '/todo/list',              // hash没有指定path时的默认路由

            rootId: 'magix_root',   // magix模块渲染DOM的容器ID, 默认为body元素

            /**
             * 程序中一些出错会影响整个应用的运行和稳定，
             * 这种情况在单页应用中最为致命，所以Magix对执行流程上的方法使用try catch调用，
             * 避免某个方法出错后导致后续代码不能继续运行。
             * 当出错时，Magix会调用配置中的error方法，您可以在这里抛出错误(开发阶段)或收集错误并上报(部署上线阶段)
             **/
            error: function(e) {
                // 这里我们先简单的抛出错误，部署上线的时候建议使用如
                // new Image().src='//xx.yy/jserror?desc='+e.description收集错误哦～
                throw e
            }
        })

    })


## 创建第一个Magix视图模块

所有的视图模块我们都保存在`app/view`目录下, 现在新建一个default模块, default模块包含`default.js`和`default.html`两部分

Magix和大部分MVC框架一样, 一个模块通常包含控制器(js)和界面(html文件)。 控制器负责从界面收集数据、 处理业务逻辑、与后端进行交互、将数据传递给模板引擎渲染出界面。

首先创建视图模板文件`mkdir -p tmpl/app/view && touch tmpl/app/view/default.html`, 内容如下:

    <h2>Hello Magix.js!</h2>

这个模板文件只输出一段简单HTML代码, 后期我们会介绍如何使用各种复杂模板引擎如Vue.js实现视图

创建视图控制器文件`touch tmpl/app/view/default.js`, 内容如下:



    /**
     * js文件使用CommonJS组件编写, Magix打包工具会根据combineTool.config配置将模块包装成所需的组件
     **/

    var Magix = require('magix')

    module.exports = Magix.View.extend({

        // 模板字段命名为tmpl(也可以起是其他有效标识符), 配置模板文件
        // Magix打包工具会读取html文件内容放在这里
        // 更多@规则可参考Magix打包工具：https://github.com/thx/magix-combine
        tmpl: '@default.html',

        // Magix组件生命周期中的render函数, 系统自动调用, 通常在这里重写并实现业务逻辑
        render: function() {

            this.setHTML(this.id, this.tmpl)    // 将模板注入到模块容器元素内
        }
    })


## 检查效果

刷新浏览器, 页面出现**Hello Magix!**. 此时我们完成了基于Magix单页面应用的Hello项目

完整的index.html内容如下:

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

        <div id="magix_root"></div>


     <script>
    var pathBase = './src/'

    require.config({
        paths: {
            app: pathBase + 'app',
            jquery: pathBase + 'vendor/jquery',
            magix: pathBase + 'vendor/magix'
        }
    })

    /**
     * Magix为了同时支持jquery和zepto, 使用通用的$表示这两个框架
     * 在这里设置$为我们需要的框架
     **/
    define('$',['jquery'],function($){
        return $
    })


    require(['$', 'magix'], function ($, Magix) {

        Magix.boot({
            defaultView: 'app/view/default',       // Magix启动渲染的默认视图
            defaultPath: '/todo/list',              // hash没有指定path时的默认路由

            rootId: 'magix_root',   // magix模块渲染DOM的容器ID, 默认为body元素

            /**
             * 程序中一些出错会影响整个应用的运行和稳定，
             * 这种情况在单页应用中最为致命，所以Magix对执行流程上的方法使用try catch调用，
             * 避免某个方法出错后导致后续代码不能继续运行。
             * 当出错时，Magix会调用配置中的error方法，您可以在这里抛出错误(开发阶段)或收集错误并上报(部署上线阶段)
             **/
            error: function(e) {
                // 这里我们先简单的抛出错误，部署上线的时候建议使用如
                // new Image().src='//xx.yy/jserror?desc='+e.description收集错误哦～
                throw e
            }
        })

    })
     </script>

     </body>
     </html>


## 小结


- `Magix.boot({})`启动Magix项目, Magix根据boot方法传入的配置初始化系统, 加载模块渲染页面.
- 使用`rootID`设置容器节点id, 如果不设置将使用`body`元素, 在vue2.0会报错
