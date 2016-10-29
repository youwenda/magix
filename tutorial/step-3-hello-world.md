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

`Magix.boot()`设置Magix在`rootId`元素渲染`defaultView`模块. 现在创建设置的默认模块.


Magix和大部分MVC框架一样, 一个模块通常包含控制器(js)和界面(html文件)。 控制器负责从界面收集数据、处理业务逻辑、与后端进行交互、将数据传递给模板引擎渲染出界面。

- `.js`文件: 继承`Magix.View`, 包含完整的生命周期并提供模块所需方法
- `.html`文件: 模块可选的html, 其内容被magix编译后成为控制器对象的一个属性. 开发阶段按照普通html文件编辑, 使用时直接读取对象属性获取文件内容, 方便开发.


现在新建一个default模块, default模块包含`default.js`和`default.html`两部分，
所有的视图模块我们都保存在`app/view`目录下。


首先创建视图模板文件`mkdir -p tmpl/app/view && touch tmpl/app/view/default.html`, 内容如下:

    <h2>Hello Magix.js!</h2>

这个模板文件只输出一段简单HTML代码, 后期我们会介绍如何使用各种复杂模板引擎如Vue.js实现视图

创建视图控制器文件`touch tmpl/app/view/default.js`, 内容如下:


    /**
     * js文件使用CommonJS模块语法编写,
     * Magix打包工具会根据combineTool.config配置将模块包装成所需的组件
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

以上控制器文件中的一些细节:

- Magix控制器使用CommonJS模块语法, Magix打包工具读取模块并根据用户配置将模块转换为目标模块语法, 如AMD, seajs模块. 这样不同加载器下的组件可以无需修改实现复用
- 通过`Magix.View.extend({})`从`Magix.View`派生出模块控制器，用户只需关心模块所需业务逻辑，自动获得生命周期维护功能。
- `tmpl: '@default.html'`：设置Magix编译工具将`default.html`文件内容读取作为字符串赋值给控制器的`tmpl`字段。这样控制器需要的模板时直接访问属性即可。
- `render: function () {}`：render是Magix模块生命周期中的一个函数，用于收集参数、准备渲染数据、渲染界面。可能会被调用多次。 Magix推荐的工作模式是： 响应用户操作获取参数， 设置好参数后调用render更新界面， 这样整个模块的状态维护都是线性的，可维护性高。
- `this.setHTML(elemId, htmlStr)`：setHTML方法是从Magix.View继承的方法，它将指定id DOM节点的html内容设置为参数字符串。
    [setHTML][1]主要功能是向指定的节点设置innerHTML。除了设置innerHTML外，还会自动渲染子区块(view)
- `this.id`：每一个Maigx模块都有一个容器DOM元素，为了降低内存占用并防止内存泄漏，Magix在控制器内只保存容器DOM元素的id到id属性。控制器需要访问容器DOM元素时使用ID高效查找即可。id生成策略：
    - 如果元素有id， 使用该id
    - 如果元素没有id， Maigx为其生成唯一id
- `this.tmpl`：控制器属性访问。之前设置了tmpl为模板文件内容，所以这里访问的是模块所对应的模板文件。



## 检查效果

刷新浏览器, 页面出现**Hello Magix!**. 此时我们完成了基于Magix单页面应用的Hello项目

完整的index.html内容如下:

    <!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no">
         <title>Document</title>
         <link rel="stylesheet" href="./src/app/asset/bootstrap.css">
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

    require(['jquery', 'magix'], function ($, Magix) {
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
- `defaultView`：设置默认模块
- Magix模块使用CommonJS模块语法，编译工具根据需要转换为目标模块语法
- Magix模块包含必选的控制器（.js)和可选的视图（.html)
- Magix控制器需继承自`Magix.View`，实现所需业务逻辑
- Magix编译工具将模板文件编译成为控制器属性，方便开发，使用。
- render方法用于收集参数、准备所需数据、渲染界面。
- 响应用户操作设置参数，调用render更新界面的线性流程提高模块可维护性
- Magix控制器持有容器DOM元素id，高效、低内存



[1]: https://thx.github.io/magix-doc3/?to=setHTML
