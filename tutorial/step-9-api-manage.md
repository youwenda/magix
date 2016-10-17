---
title: Service统一管理接口
layout: tutorial
---

# 9. Service统一管理接口

前面向后端获取数据都是独立使用`$.ajax()`完成, 每次都需要处理所有细节, 当项目复杂时会带来以下问题:

- 多个页面使用的接口修改需要在多处修改
- 一个功能需要请求多个接口时异步状态维护麻烦
- 每次请求回来都需要检查状态确保成功

Magix提供了Service用于接口管理, 统一处理参数格式, 异步维护, 状态检查. 使用Service包含以下步骤:


1. 继承`Magix.Service`, 实现参数处理, 发送ajax请求, 状态检查
2. `Service.add()`注册接口, 配置基本信息, 如请求方法
3. `var service = new Service()`新建Service实例, 执行`service.all()`请求所需接口列表

详细信息查看[Service详解][1]



# 继承Magix.Service

执行`mkdir -p tmpl/app/service && touch tmpl/app/service/service.js`创建自己的Service:

    var Magix = require('magix')
    var $ = require('$')

    var Service = Magix.Service.extend(function(bag, callback) {
        var data = bag.get('urlParams')

        $.ajax({
            url: bag.get('url'),
            data: data,
            type: bag.get('method') || 'GET',
            complete: function(xhr, text) {
                if (text == 'error') {
                    callback({
                        msg: xhr.statusText
                    })
                } else {
                    var respObj = $.parseJSON(xhr.responseText)

                    bag.set('data', respObj)
                    var errorInfo
                    if (!respObj.info.ok) {
                        errorInfo = {
                            msg:respObj.info.message
                        }
                    }
                    callback(errorInfo)
                }
            }
        })
    })

    Service.add([{
        name: 'todo-add',
        url: 'api/todo/add.json'
    },{
        name: 'todo-list',
        url: 'api/todo/list.json',
        method: 'get'
    }
    ])
    module.exports = Service

`Magix.Service.extend()`接受一个函数作为参数, 用于实现ajax请求细节, 后续所有接口请求都将接口信息通过bag传递给这个函数,函数从bag读取信息发送请求.


函数传入的第一个参数`bag`，`bag`被设计来存储数据或数据的载体。当我们向一个接口发送数据请求时，除了必须传递的接口数据(如todoId等)，可能还会有其它额外程序需要的数据(如是否是jsonp，是否是post方式发送等)，这些数据统统都可以放到`bag`对象里，然后在需要的时候获取使用。

`bag.get(key)`可以获取接口配置对象对应的信息, 如`Service.add()`添加的`todo-list`接口`method`字段用于设置接口请求方法.

获取返回结果之后检查状态并执行`callback()`回调通知Service请求完成, API如下:

    /**
     * 异步操作完成回调, 执行callback通知Service请求处理完成
     * @param errObj {Object} 错误信息对象, 如果传递非空, Service认为接口请求失败
     *      如果不传递次参数,Service认为请求成功
     **/
    function callback(errObj) {}

如果请求成功, 调用`bag.set(key, value)`设置请求返回的数据供请求者使用.


# Service.add添加接口信息


    Service.add([{
        name: 'todo-add',
        url: 'api/todo/add.json'
    },{
        name: 'todo-list',
        url: 'api/todo/list.json',
        method: 'get'
    }
    ])

`Service.add()`接受一个对象数组, 用于统一管理接口, 其中`name`字段唯一标识接口, 调用接口时只需指定`name`即可. `url`标记接口实际地址, 通过`bag.get('url')`可以获取到.


# todo/list页面中使用Service.all请求接口

下面是使用了Service管理接口后的todo/list render方法：

    var Magix = require('magix')
    var $ = require('jquery')
    var Service = require('app/service/service')

    module.exports = Magix.View.extend({
        render: function() {
            var that = this

            var router = Magix.Router.parse()
            this.data = {
                keyword: router.params.keyword
            }

            new Service().all([{
                name: 'todo-list',
                urlParams: {
                    keyword: this.data.keyword
                }
            }], function(err, listModel) {

                if (err) {
                    this.data.err = err
                } else {
                    var respObj = listModel.get('data', {})
                    var todoList = respObj.data.todos
                    that.data.todos = todoList.filter(function (todo) {
                        return todo.name.search(that.data.keyword) != -1
                    })
                }
                that.setVueHTML(that.data)

            })
        }
    })


在需要请求接口的模块引入自定义Service, 创建实例, 调用`service.all()`请求接口API如下

    /**
     * 请求apiList所指定的接口, 请求完成后收集信息调用callback
     * @param apiList {Array} 包含所需请求接口的信息, 其中name为必选, 指定请求Service.add()添加的接口
     * @param callback(err, bag1, bag2...) {function} 接口请求完成的回调
     *          @param err {Object} 错误信息对象, 如果非空则包含接口请求错误信息
     *          @param bag1, 2 {Bag} 接口返回数据, 对应apiList顺序接口返回的数据
     **/
    function all(apiList, callback) {}


最后在传递给`service.all()`的callback中检查`err`进行错误判断, 如果没有错误则获取数据. 多个接口的请求只需在apiList中列出, 就可以在callback中按照顺序获取结果, 异步控制交给Service处理. 同时多个接口的错误状态也统一到Service, 只需检查`err`字段即可获取错误信息.



[1]: http://thx.github.io/magix/articles/about-model-and-manager
