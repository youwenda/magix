---
layout: article
title: 为什么合并view的render与locationChange方法
---

**注：原1.2版本之前渲染流程和url改变流程是分开的，从1.2版本开始，把这2个流程合并，即不管哪种情况均走渲染流程，原因参考以下说明**

考虑原来以下代码

```js
View.extend({
    init:function(){
        this.observeLocation('page,rows');
    },
    loadList:function(){
        //
        var loc=this.location;
        var rows=loc.get('rows');
        var page=loc.get('page');
        async(function(){
            var listNode=S.one('#'+me.id+' .list');
            listNode.html('abc');
        });
    },
    render:function(){
        var me=this;
        async(function(){//异步获取一些信息
            me.setViewHTML(me.template);//首次更新模块
            me.loadList();//加载列表
        });
    },
    locationChange:function(){
        this.loadList();//直接加载列表
    }
});
```

在render中，异步获取一些数据，然后首次渲染界面，然后再渲染list，当地址栏中的参数rows或page改变时，重新渲染一次list.

考虑以下情况：
当render中的async尚未完成时，rows或page发生改变
此时调用loadList方法
假设loadList中的async方法先于render中的async完成
则会出错。

Q:当rows或page发生改变时，如果页面未完成渲染的情况下为什么还调用locationChange？不调用不可以吗？
A:就刚才的代码来讲，如果初始页面的url中rows和page是这样的：`rows=20&page=2`，当发生改变如变成：`rows=20&page=3`，此时如果view未完成首次渲染，不调用locationChange的情况下，loadList方法里读取的仍是`page=2`的情况，这显然是不对的，所以正确的做法是调用。

以上的情况复现很难，但确实有问题，会给我们的程序带来隐患

而合并render与locationChange后

```js
View.extend({
    init:function(){
        this.observeLocation('page,rows');
    },
    loadList:function(){
        //
        var loc=this.location;
        var rows=loc.get('rows');
        var page=loc.get('page');
        async(function(){
            var listNode=S.one('#'+me.id+' .list');
            listNode.html('abc');
        });
    },
    render:function(){
        var me=this;
        async(function(){//异步获取一些信息
            me.setViewHTML(me.template);//首次更新模块
            me.loadList();//加载列表
        });
    }
});
```

当发生改变时，仍然调用render方法，与初始调用render时同样的流程，所以不容易产生隐患。

从另外一个角度来看：
原来存在2个渲染入口：render与locationChange，从应用框架上来讲很难控制这2个入口渲染的流程是一致的。合并后，只有render一个入口，能有效解决一些隐患。

