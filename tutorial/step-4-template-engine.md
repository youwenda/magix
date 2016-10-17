---
title: 使用Vue.js作为模板引擎
layout: tutorial
---

# 4. 使用Vue.js作为模板引擎

## setHTML原理

前面(第3步)中我们使用setHTML方法，[查看文档][1]
setHTML主要功能是向指定的节点设置innerHTML。除了设置innerHTML外，还会自动渲染子区块(view)
如果通过其它方式来更新节点的html，则需要手动调用子区块(view)渲染的代码，接下来就会介绍～

## 配置Vue.js

下载[vue1.0.26.js][2]到本机, 保存到`app/vendor/`目录下。**注意：**本教程使用的不是vue2.0版本， Vue2.0很多细节上与1.0不兼容， 如果读者使用vue2.0版本需要注意， 如果有疑问可以[给我们提issue][3]

在require中配置vue路径

    require.config({
        paths: {
            app: pathBase + 'app',      // 项目模块都以app开头
            jquery: pathBase + 'vendor/jquery',
            magix: pathBase + 'vendor/magix',
            vue: pathBase + 'vendor/vue' //配置vue路径
        }
    })


## 实现setVueHTML方法管理页面渲染

我们现在需要为所有区块(view)提供一个自定义的模板渲染方法, 在里面使用自己的模板引擎
Magix提供了非常便捷的扩展机制，我们只需要按要求写好自己的扩展并启用即可

1. 首先执行`touch tmpl/app/magix-view-extension.js`创建扩展文件, 在里面对View类进行扩展, 内容如下:

        var Magix = require('magix')
        var Vue = require('vue')
        var $ = require('jquery')

        Magix.View.merge({

            /**
             * 传入数据并使用Vue作为模板引擎
             **/
            setVueHTML: function (data) {
                var deferred = $.Deferred()
                var that = this

                this.vm = new Vue({

                    //  设置view容器元素为vue.js模板渲染容器元素
                    el: document.getElementById(this.id),

                    //  设置视图的tmpl字段为vue.js模板, 打包工具读取模板嵌入
                    template: this.tmpl,

                    // vue.js参数: 模板插入容器而不是替换容器元素
                    replace: false,

                    // 渲染模板的数据
                    data: data,

                    // vue.js异步, 需要监听渲染完成, 通知view和用户
                    ready: function () {
                        deferred.resolve()
                        that.endUpdate() //vue渲染完成后，需要调用endUpdate告知Magix当前区块渲染完成，而内置的setHTML会自动调用
                    }
                })

                return deferred.promise()
            }
        })




    `magix-view-extension.js`执行Magix.View.merge({})方法将参数对象merge到View的原型链上, 类似jQuery的extend扩展方法. 这样所有的View实例都可以直接使用setVueHTML方法.

    `document.getElementById(this.id)`说明:

    Maigx自动为每一个view生成唯一的id并设置到view容器元素上, view通过保存容器元素id而不保存容器元素节点以兼顾性能和内存, 然后就可以通过`document.getElementById(this.id)`获取视图容器元素。

    `$.Deferred`说明:

    vue.js模板的渲染是异步完成. 所以我们使用了`$.Deferred`来进行状态控制, 需要依赖模板渲染完成的操作可以在返回的promise设置操作

        this.setVueHTML(data)
            .then(function () {
                // 这里执行操作
            })

    `that.endUpdate()`说明:

    vue.js模板是异步.需要调用Magix.View的endUpdate方法通知view模板渲染完成, view开始解析html加载子view


2. 在Maigx.boot配置exts字段, 加载`magix-view-extension.js`

        Magix.boot({
            defaultView: 'app/view/default',       // Magix启动渲染的默认视图
            defaultPath: '/todo/list',              // hash没有指定path时的默认路由

            rootId: 'magix_root',   // magix模块渲染DOM的容器ID, 默认为body元素

            // Magix启动前加载这里的资源
            exts: ['app/magix-view-extension'],

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

    Magix.boot会在启动之前加载一次`exts`字段指定的模块, 项目初始化时需要执行的任务可以在这里设置。这样我们就完成了扩展的编写，接下来在我们的代码中使用即可

3. 在`app/view/default.js`中使用setVueHTML


        /**
         * js文件使用CommonJS组件编写, Magix打包工具会根据combineTool.config配置将模块包装成所需的组件
         **/

        var Magix = require('magix')

        module.exports = Magix.View.extend({

            // 模板字段命名为tmpl(也可以起是其他有效标识符), 配置模板文件
            // Magix打包工具会读取模板文件内容作为字符串作为tmpl值
            tmpl: '@default.html',

            // Magix组件生命周期中的render函数, 系统自动调用, 重写并实现业务逻辑
            render: function() {

                // 需要渲染到页面的数据
                var data = {
                    count: 0,
                    name: "Magix"
                }

                // 自动修改数据, 检验
                setInterval(function () {
                    ++data.count
                }, 1000)

                this.setVueHTML(data)

            }
        })




4. 修改`app/view/default.html`

        <div>
            <h2>Hello Magix.js!</h2>
            <input type="text" v-model="name">
            <p>count: {{count}}</p>
            <p>name: {{name}}</p>
        </div>


5. 刷新页面.可以看到count值没秒钟增加1, 输入框修改文字, 显示的也同时修改, 说明vue.js模板使用成功.





[3]: https://github.com/thx/magix/issues
[2]: https://cdn.bootcss.com/vue/1.0.26/vue.js
[1]: https://thx.github.io/magix-doc3/?to=setHTML
