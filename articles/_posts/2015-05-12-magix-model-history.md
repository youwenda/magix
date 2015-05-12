---
layout: post
title: Magix中Model的历史变化
---

Magix更早的历史需要@limu来叙述(早期的Magix是托管在https://github.com/limu/magix这里)，我只说从我接手时的事情吧

我是从0.4.0版本(2011年底)开始的，基于backbone，后来到2012年初开始做同时支持seajs kissy版本的。seajs+backbone kissy+内置的mvc，我们的亮点是VOM，即对view抽象成类似DOM的一颗树，方便加载与管理，当时所有的前端MVC框架都是没这个功能的。

当时虽然做适应多类库的开发，但接触最多的是seajs+backbone。当时也没想重新造个轮子，而是在现有的框架基础上，加上我们想要的功能而已(VOM)。所以最初很多的写法仍然按相应框架的写法来实现，比如Model:

```js
define('app/models/sidebar',['magix/model'],function(Model){
    var Sidebar = Model.extend({
      url:'api/sidebar'
    });
    return Sidebar;
});
```
一个接口一个model文件，有多少接口就有多少个model文件，当时看来也没什么问题，直到我做“直通车报表”的时候遇到了相当头痛的问题(直通车是我入职第一个项目，也是这个项目让我和Magix成长很多)：

###问题一
当时项目也是尝试，服务端接口规划的也不是很好，导致当时经常一个接口拆成两个甚至更多接口，也有可能几个接口合并成一个接口，经常合了拆，拆了合，我也跟着增删model文件，痛苦可想而知。
为了解决因接口的变动而增删model文件，我对以往的项目拿出来做了一次分析(我经常用这个方式来解决一些问题)，以前的项目里大多数model文件的代码里只做了一件事情，就是继承基类model，添加url这个标识，再无其它代码，如前面示例中的代码。
既然这样，为什么要建立起那么多的model文件，感觉一个文件就够了啊，我当时就把model文件改成了这样的：

```js
define('app/models/model',['magix/model'],function(Model){
    return Model.extend({
        urlMap:{
            sidebar:'api/sidebar',
            camapgins:{
                list:'api/campaigns/list'
            }
        }
    });
});
```

整个项目中的url都在model的urlMap对象里，一个项目中也只需要一个model即可，这样随便服务器的接口调整，我只需要修改model文件中的urlMap对象即可，使用时：

```js
render:function(){
    var m=new Model({uri:'campaigns.list'});//使用urlMap中的campaigns.list的值做为请求的url
    m.load({
        success:function(){

        }
    });
}
```

这样就所问题解决了。

###问题二
由于项目的复杂性，导致一个view在渲染时，通常依赖好几个后台接口，所以当时的代码经常这样：

```js
render:function(){
    var m=new Model({uri:'campaigns.list'});
    m.load({
        success:function(){
            var m1=new Model({uri:'campaigns.categories'});
            m1.load({
                success:function(){
                    //business
                }
            });
        }
    });
}
```

好吧，遇到依赖5、6个接口的，真的是要了命了。再对以往的项目拿出来做一次分析吧，其实就是看一下以前别人是怎么解决的。不过当时这样做的项目是相当少的，而且参考的那个项目不复杂，很少有这种情况。没办法，只好自已解决了。

第一个思路：把这种多接口嵌套的封装成一个方法，调用的地方很简单，但不够灵活，需要封装的方法太多了，因为项目中几乎所有的view都需要调用2个以上的接口数据才能显示的。pass

第二个思路：智能组合model，按需要调用，当时在项目中实现了一个modelmanager(现Magix中的Manager中的雏形)

```js
render:function(){
    var m=new Model(/*...*/);
    var m1=new Model(/*...*/);
    Manager.fetchAll([m,m1],function(){
        //business
    });
}
```
当时model对象需要在外部创建，后来根据业务需要，又出现了fetchOne等方法。

不过当时的思路仍然是：如果view只需要一个数据接口就可以展示的，仍然使用model对象，否则才使用modelmanager。这个思路直到重构淘宝直通车的时候才做了转变(后面详说)。

2012年年底做的另外一件事是：重做Magix，细节不表，反正就是底层不再使用backbone，自已做view、model、router,然后再加上自已的vframe、vom。当时modelmanager并未内置到magix当中。

后来2013年初开始重构淘宝直通车。人也多了起来，当时magix也刚刚起步，几乎隔段时间就能收到很多bug和建议。modelmanger最初也是放在项目里的，后来听从他们的建议，放在了magix中，而且思路也从优先使用model转成了统一使用modelmanager，即使只需要一个数据接口，也使用modelmanager，这样就统一了数据接口的调用。
当时调整完的代码如下：

```js
//model.js
var M=Model.extend({
    urlMap:{
        campaigns:{
            list:'api/campaigns/list',
            categories:'api/campaigns/categories'
        }
    }
});
//manager.js
var MM=MagixManager.create(M);
MM.regitesrModels([{
    name:'Campaigns_Query',
    uri:'campaigns.list'
}]);
```
与现有的model和manager已经很像了

再后来就把model中的urlMap去掉了，把接口地址放到了manager中。不过淘宝直通车中，根据模块拆分出了多个manager，导致在某些地方需要跨模块取数据时仍然会有不方便，不过这种情况很少见，也就没有再去解决。

目前项目中的的做法是：
一个项目中只有一个manager对象，但可以拆成几个文件，每个文件中调用Manager.registerModels向这个对象注册相应的信息。

##总结
1. 合并model文件
2. manager自由组合调用model