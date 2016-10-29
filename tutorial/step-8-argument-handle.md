---
title: 参数传递与获取
layout: tutorial
---

# 8. 参数传递与获取


Magix通过View嵌套组装构成页面, 需要解决多个View之间参数传递, 状态获取. 这里只展示简单的url传递参数, 深入介绍可以查看[Magix view参数传递][1]


# todo列表页需求

todo列表页需要一个搜索功能, 只显示与用户输入关键字匹配的结果.

# 从url获取参数

关键字, 翻页信息这样的简单参数通常放到url上, 然后从url获取参数渲染页面, 即使刷新页面也不会造成状态丢失.

模拟数据的`touch api/todo/list.json`:

    {
        "info": {
            "ok": true,
            "code": "S001",
            "message": "保存成功"
        },
        "data": {
            "todos": [
                {
                    "id": 1,
                    "name": "aaa"
                },
                {
                    "id": 2,
                    "name": "bbb"
                },
                {
                    "id": 3,
                    "name": "ccc"
                },
                {
                    "id": 4,
                    "name": "ddd"
                },
                {
                    "id": 5,
                    "name": "eee"
                },
                {
                    "id": 6,
                    "name": "fff"
                }
            ]
        }
    }


模拟数据的`touch api/todo/delete.json`:

    {
        "info": {
            "ok": true,
            "code": "S001",
            "message": "保存成功"
        },
        "data": {
        }
    }

功能完成后的`list.js`:

    var Magix = require('magix')
    var $ = require('jquery')

    module.exports = Magix.View.extend({
        tmpl: '@list.html',
        init: function () {
            this.observe('keyword')
        },
        render: function() {
            var that = this

            var router = Magix.Router.parse()
            this.data = {
                keyword: router.params.keyword
            }

            $.ajax({
                url: '/api/todo/list.json',
                data: {
                    keyword: this.data.keyword
                }
            }).done(function (todosResp) {
                that.data.todos = todosResp.data.todos.filter(function (todo) {
                    return todo.name.search(that.data.keyword) != -1
                })

                that.setVueHTML(that.data)
            })
        },
        'search<submit>': function (e) {
            e.preventDefault()
            Magix.Router.to({
                keyword: this.data.keyword
            })
        },
        'deleteItem<click>': function (e) {
            var that = this

            // Maigx在模板中传递的参数对象挂载到event.params
            var paramObj = e.params
            $.ajax({
                url: '/api/todo/delete.json',
                data: {
                    id: paramObj.id
                }
            }).done(function (resp) {

                if (resp.info.ok) {
                    alert('删除成功')
                } else {
                    alert('删除失败')
                }
                that.render()

            })
        }
    })


功能完成后的`list.html`:

    <div>
        <form class="form-inline" mx-submit="search()">
            <div class="form-group">
                <label>关键字:</label>
                <input type="text" class="form-control" v-model="keyword">
            </div>
            <button class="btn btn-default" type="submit">搜索</button>
        </form>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>名称</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="todo in todos">
                    <td>{{todo.id}}</td>
                    <td>{{todo.name}}</td>
                    <td>
                        <a href="javascript:;" class="mr10" mx-click="deleteItem({id: {{todo.id}}})">删除</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>




整个页面的处理流程如下:

1. 使用`Magix.Router.parse()`解析url获取参数, 根据参数处理好数据渲染模板

        render: function() {
            var that = this

            var router = Magix.Router.parse()
            this.data = {
                keyword: router.params.keyword
            }

            $.ajax({
                url: '/api/todo/list.json',
                data: {
                    keyword: this.data.keyword
                }
            }).done(function (todosResp) {
                that.data.todos = todosResp.data.todos.filter(function (todo) {
                    return todo.name.search(that.data.keyword) != -1
                })

                that.setVueHTML(that.data)
            })
        }

    前面已经介绍过`Magix.Router.parse()`, 它解析url返回path和参数. 参数保存在`router.params`对象, 我们定义`keyword`保存关键字, 查询`router.params.keyword`可以获取url上的关键字, 如`http://localhost:5555/?#!/todo/list?keyword=66`解析得到的关键字为`66`

    获取参数并发送到后端得到结果列表, 搜索功能通常是后端执行, 这里为了演示效果在前端加了一个过滤, 然后将符合条件的数据传递给模板进行渲染.

    在模板中我们将`keyword`进行双向绑定并渲染todo列表

2. 响应搜索动作, 使用`Magix.Router.to()`将关键字同步到url参数

    根据前面的事件处理知识我们监听表单的`submit`事件, 然后将关键字同步到url:

        'search<submit>': function (e) {
            e.preventDefault()
            Magix.Router.to({
                keyword: this.data.keyword
            })
        }

    `Magix.Router.to()`方法在`add.js`中用来修改path实现页面切换. 现在传递参数对象给第一个参数, Magix将参数对象各个字段同步到URL上



3. `this.observe()`监听参数变化, 刷新页面

    将关键字同步到url, 从url获取参数并渲染页面已经完成, 但是此时只有刷新页面才会触发render方法, 接下来我们需要让Magix在检测到关键字变化时调用render方法.

        init: function () {
            this.observe('keyword')
        }

    `init`是view生命周期中的一个函数, 初始化时Magix会自动调用, 整个生命周期中执行一次, 监听事件等操作通常在这里执行.

    `this.observe()`在前面介绍过详细API如下:

        /**
         * 向Magix注册hash变化, 可分别监听path或者特定参数, 当关注的参数或者path变化时
         * Magix自动调用view的render方法
         * @param params {Array|string} 当前view所关注的参数列表
         *      可以是参数名称数组或者逗号分隔的参数名称(逗号前后不允许有空格)
         * @param isObservePath {boolean} 是否监听path变化
         **/
        function observe(params, isObservePath) {}

    在这里我们只关注`keyword`参数所以第一个参数传入`keyword`字符串即可, 当这个参数变化时, Magix会调用render方法渲染页面.




操作部分的删除演示了绑定事件监听器传递参数功能, 在模板中通过这样的方式传递简单参数简化了开发.



[1]: https://github.com/thx/magix/issues/20
