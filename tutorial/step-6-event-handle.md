---
title: 事件处理
layout: tutorial
---

# 6. 事件处理

本节通过新建todo模块的实现展示Magix事件处理. 绑定事件监听器传递参数功能在下一章介绍.

Magix在模板中DOM节点上通过`mx- + eventName = eventHandler(argObj)`的形式为元素设置事件监听器. 其中

- eventName为用户所关心的事件如click
- eventHandler为该事件的处理函数, Maigx会在View中寻找
- argObj为传递给处理函数的参数对象, 这个参数对象会挂在在`event.params`


如在一个div上绑定点击事件的模板为

    <div mx-click="hello({name: 'magix'})">点击我</div>


事件处理函数通常是定义在模块对应的js文件上:

    var Magix = require('magix')

    module.exports = Magix.View.extend({
        tmpl: '@add.html',
        render: function() {
            this.setHTML(this.id, this.tmpl)
        },
        'hello<click>': function (e) {
            console.log('hello ' + e.params.name)        // 输出hello magix
        }
    })



- 事件处理函数名后面的尖括号内需要指明函数所关心的事件类型，当绑定的事件和处理函数指定的名称不一致时，处理函数将无法被调用。事件处理函数后通过尖括号指名事件名称方便在阅读代码时知道当前view绑定了哪些事件及对应的处理函数
- 函数接受第一个参数为所使用框架对应的event事件, Magix将绑定事件时设置的参数挂在到`event.params`,  如jquery就是jquery对应event加上参数对象
- 函数this为view本身



事件详细介绍参考:[Magix事件原理][1]



# 新建mock接口

为了方便测试我们在本地创建api目录, 用于保存json文件模拟接口

    mkdir -p api/todo

为新建todo添加接口`touch api/todo/add.json`


内容如下:

    {
        "info": {
            "ok": true,
            "code": "S001",
            "message": "保存成功"
        },
        "data": {
            "todo": {
                "id": 1
            }
        }
    }

# 修改`app/view/todo/add`模块实现功能



修改`app/view/todo/add.html`:


    <div>
        <h2>新建Todo</h2>

        <form  mx-submit="saveTodo()">
            <div class="form-group">
                <label >Name:</label>
                <input type="text" class="form-control" name="name">
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-default">提交</button>
            </div>
        </form>

    </div>


修改`app/view/todo/add.js`:

    var Magix = require('magix')
    var $ = require('jquery')

    module.exports = Magix.View.extend({
        tmpl: '@add.html',
        render: function() {
            this.setHTML(this.id, this.tmpl)
        },

        /**
         * 事件监听器方括号内注明方法所监听的事件, 事件监听器的this为view
         * @param e {Event} 所使用框架的event事件, 如果是jquery, 那就是jquery事件, kissy类似
         **/
        'saveTodo<submit>': function (e) {
            e.preventDefault()

            // 通过id查找模块容器DOM节点
            var $main = $('#' + this.id)
            var $name = $main.find('[name=name]')

            $.ajax({
                url: '/api/todo/add.json',
                data: {
                    name: $name.val()
                }
            }).then(function (resp) {
                if (resp.info.ok) {
                    alert('保存成功')
                    Magix.Router.to('/todo/list')
                } else {
                    alert(resp.info.message)
                }
            })

        }
    })



`saveTodo<click>`处理用户点击事件, 将用户输入值作为参数发送到后端.获取结果
后检查状态, 如果保存成功则在主界面显示todo列表.


`Magix.Router.to()`会根据参数修改hash, 结合之前`default.js`中`this.observe(null, true)`实现不同页面之间的切换.
其API如下:

    /**
     * 导航到新的地址
     * @param  {Object|String} pn path或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * var R = Magix.Router;
     * R.to('/list?page=2&rows=20');//改变path和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     * R.to('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     * R.to({//通过对象修改参数，地址栏上的其它参数会保留
     *     page:2,
     *     rows:20
     * });
     * R.to('/list',{//改变path和相关参数，丢弃地址栏上原有的其它参数
     *     page:2,
     *     rows:20
     * });
     *
     * //凡是带path的修改地址栏，都会把原来地址栏中的参数丢弃
     */
    to: function(pn, params, replace) {}



[1]: https://github.com/thx/magix/issues/14

