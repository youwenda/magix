---
title: Router路由视图切换
layout: tutorial
---

# 5. Router路由视图切换

项目通常包含几十或者上百个页面, 和传统页面使用`/todo/list.html`路径切换页面类似, Magix在hash上定义了path和参数两部分, 使用Router解析hash获取path和参数, 然后将path映射到模块.

项目中完整的路由切换由以下几个部分组成

- 根据项目设计不同的模块并设计path到模块的映射
- 在`app/view/default`模块中render方法中使用Router获取path, 映射到对应模块, 然后在页面主容器中加载该模块
- 在`app/view/default`的`init`方法中监听path变化, Magix自动调用模块render方法加载对应模块


# 设计模块和path到模块的映射

项目当前有**todo add**和**todo list**两个功能, 分为两个不同模块实现:

- app/view/todo/add
- app/view/todo/list

path和文件结构一一对应

- /todo/add
- /todo/list

映射关系: 只需要在path前面加上`app/view`前缀即可

|    功能    |      path   |     模块    |
|-----------|-------------|-------------|
|  添加todo  |  /todo/add  | app/view/todo/add |
|  todo列表  |  /todo/list | app/view/todo/list |


# 修改`app/view/default.js`render方法, 获取path并映射到模块, 加载模块


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

            var loc = Magix.Router.parse()
            this.owner.mountVframe('magix_vf_main', 'app/view' + loc.path)
        }
    })


新添加的核心代码如下:

    // 解析url为对象放回
    var loc = Magix.Router.parse()
    this.owner.mountVframe('magix_vf_main', 'app/view' + loc.path)


Magix.Router是Magix路由的核心模块, 主要功能有
- 更新地址栏地址
- 将hash解析为path和参数对象

其中`var loc = Magix.Router.parse()`方法默认解析当前url并返回包含具体字段的对象, 以`http://localhost:5555/#!/todo/add?id=333&name=demo`为例, 得到的loc对象如下:

    {
        "href": "http://localhost:5555/#!/todo/add?id=333&name=demo",
        "srcQuery": "/",
        "srcHash": "/todo/add?id=333&name=demo",
        "query": {
            "path": "/",
            "params": {}
        },
        "hash": {
            "path": "/todo/add",
            "params": {
                "id": "333",
                "name": "demo"
            }
        },
        "params": {
            "id": "333",
            "name": "demo"
        },
        "path": "/todo/add",
        "view": "app/view/default"
    }


其中主要字段含义如下:

- `path`: hash的路径, 用于映射到页面模块
- `params`: hash中包含的参数, 模块可从中获取参数


前面我们提到区块(view)都是渲染在vframe中的，持有view的owner就是这个vframe。而view间这种父子关系是维护在vframe上的，开发者通常不需要关心view之间的关系，只专注实现当前view的功能即可。

在我们的`app/views/default`中，我们需要手动渲染某个子view，所以通过owner拿到持有当前view的vframe，然后再渲染子view即可

`that.owner.mountVframe('magix_vf_main', 'app/view' + router.path);`view的owner是一个Vframe对象, `mountVframe`方法
用来动态加载View, 方法接收三个参数:

- 第一个参数是动态加载view的容器元素id
    我们需要将主体页面渲染到这个`<div id="magix_vf_main">main content</div>`元素, 所以第一个参数为`magix_vf_main`
- 第二个参数是view的模块id
    这里根据加载器的要求能正确加载到的模块路径
- 第三个参数是传递给动态加载view的初始化参数.
    这个对象将传递给目标view的init函数, 这里没有用到，所以可以不传


现在我们已经告诉Magix如何根据path动态渲染页面主体部分了. 需要实现新功能时只需新建对应模块即可.

# 新建`app/view/todo/list`模块

现在刷新页面会提示404找不到`http://localhost:5555/src/app/views/todo/list.js `, 因为我们在`Magix.boot()`设置了`defaultPath`为`/todo/list`, Magix发请求找不到该模块就报错. 现在我们需要新建这个模块, 和之前一样模块通常包含一个js和一个模板文件

`mkdir -p tmpl/app/view/todo && touch tmpl/app/view/todo/list.js`创建todo目录并新建list.js文件, 文件内容我们参考`header.js`并进行对应修改:

    var Magix = require('magix')

    module.exports = Magix.View.extend({
        tmpl: '@list.html',
        render: function() {
            this.setHTML(this.id, this.tmpl)
        }
    })


`touch tmpl/app/view/todo/list.html`新建list模块的模板文件. 内容如下:

    <div>todo list</div>

现在的list模块只是简单渲染模板到容器, 还没有业务相关代码, 现在刷新浏览器可以看到界面中显示**todo list**表明Magix已经根据hash信息正确路由到`todo/list`模块.


# 修改`tmpl/app/view/common/header.html`, 加入导航链接

修改后的文件内容如下:

    <header class="navbar navbar-default">
        <ul class="nav navbar-nav">
            <li><a href="#!/todo/list">todo列表</a></li>
            <li><a href="#!/todo/add">新建todo</a></li>
        </ul>
    </header>


我们增加了两个链接, 分别对应todo列表和新建todo两个页面, 链接地址格式为**`#!` + 模块路径**.


`Magix.Router.parse()`会解析url将`#!`后面的路径设置为返回对象的path字段. default.js中将这个字段组装成模块名进行加载:


# 设置default视图监听path变化

现在刷新页面可以看到导航项**todo列表**和**新建todo**, 点击两个链接可以看到地址栏在下面地址间切换

- http://localhost:5555/#!/todo/list
- http://localhost:5555/#!/todo/add

但是这时候页面主体部分始终显示**todo list**, 这是因为还没有监听hash变化, 单页面应用通常都是将参数保存到hash然后监听hash变化, 解析参数渲染视图.

Magix监听hashchange事件并解析获得path和参数, 用户只需通过view向Magix注册关注的内容, 对应内容发生变化时Magix会通知用户(默认调用view的render方法).

Magix为每个视图提供了observe方法让用户注册关注的hash信息, API接口如下:

    /**
     * 监听hash并解析为params对象和path, view通过observe注册所关心的参数或者path变化,
     * 用户关心的部分变化时调用render方法
     * @param {Array|String|Object} params  数组字符串或一个对象
     * @param isObservePath {Boolean} [可选] 是否监视path
     **/
    this.observe(params,isObservePath)

Magix将hash分为path和参数两部分.

- path对应`location.pathname`: 用来实现视图之间的路由切换
- params对应`location.search`: Magix解析参数并保存, 方便用户使用


default需要在path变化时加载对应的视图, 所以需要向Magix注册path变化, 这个任务通常在init方法内


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


        // 视图生命周期, Magix初始化时调用, 只调用一次, 适合资源准备,事件监听等操作
        init: function () {

            /**
             * 监视地址栏中的参数或path，有变动时，才调用当前view的render方法
             * 通常情况下location有变化不会引起当前view的render被调用，
             * 所以你需要指定地址栏中哪些参数有变化时才引起render调用，使得view只关注与自已需要刷新有关的参数
             **/
            this.observe(null, true)
            //也可以写成对象的形式
            //this.observe({path:true});
        },

        // Magix组件生命周期中的render函数, 系统自动调用, 通常在这里重写并实现业务逻辑
        render: function() {


            this.setHTML(this.id, this.tmpl)    // 将模板注入到模块容器元素内

            // 解析url为对象
            var loc = Magix.Router.parse()
            this.owner.mountVframe('magix_vf_main', 'app/view' + loc.path)
        }
    })



现在点击导航栏的**todo列表**和**新建todo** hash会进行对应切换, 但是切换到`http://localhost:5555/#!/todo/add`控制台会报错404: `http://localhost:5555/src/app/view/todo/add.js`
原因在前面已经提到过. 这说明我们的监听path变化+根据path加载模块流程已经完成. 只需要新建所需模块即可.

# 新建`app/view/todo/add`模块

`touch tmpl/app/view/todo/add.js`新建list.js文件:

    var Magix = require('magix')

    module.exports = Magix.View.extend({
        tmpl: '@add.html',
        render: function() {
            this.setHTML(this.id, this.tmpl)
        }
    })



`touch tmpl/app/view/todo/add.html`新建模块的模板文件. 内容如下:

    <div>todo add</div>

现在刷新浏览器可以看到界面中显示**todo add**表明Magix已经根据hash信息正确路由到`todo/add`模块.


# 小结

- Magix根据path按需加载功能模块

项目中完整的路由切换由以下几个部分组成

- 根据项目设计不同的模块并设计path到模块的映射
- 在`app/view/default`模块中render方法中使用Router获取path, 映射到对应模块, 然后在页面主容器中加载该模块
- 在`app/view/default`的`init`方法中监听path变化, Magix自动调用模块render方法加载对应模块
