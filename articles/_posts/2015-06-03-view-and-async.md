---
layout: post
title: View与异步
---

不管是传统的多页开发，还是现在的单页应用，凡是有异步(ajax,timer,loader等)的地方，都可能存在问题，以下用实例来进行分析。

## 博客园(www.cnblogs.com)示例

博客园的翻页是使用ajax请求进行更新的，当请求如下情况时，则可能出问题。

```
点击第2页
点击第3页
第3页的请求先于第2页的请求返回
则可能先显示第3页的内容后又显示第2页的内容
与用户期望不符，最终应该显示第3页的内容
```

其实这个问题也很容易解决，比如记录请求的xhr,当再次请求时，不管上次的请求成功与否，均调用xhr.abort()，把上次的请求取消即可。

timer(setTimeout,setInterval)情况其实与xhr一样，解决办法只需要清除即可(clearTimeout,clearInterval)。

## loader(requirejs,seajs)示例

博客园示例中的异步是可以取消的，然而并不是所有的异步都可以轻松取消，也并不是所有提供异步的库都提供了取消方法。

比如我们实现一个列表组件，而列表组件中我们再异步加载一个提示组件：

```js
define('app/list',function(require){
    var List=function(){
    };
    List.prototype.load=function(){
        document.getElementById('list').innerHTML='/*content*/';
        require.async('app/tip',function(Tip){
            new Tip('#list');
        });
    };
    List.prototype.destroy=funciton(){
        //如何取消require.async加载app/tip?
    };
});
```

当我们使用时：

```js
var list=new List();
list.load();
list.destroy();
```

调用load后，seajs去异步加载app/tip组件了，而我们随后又调用了destroy方法，但我们却没办法停止加载app/tip组件，当app/tip组件加载完成后，那个回调方法依然会被执行，里面的new Tip('#list')依然会被执行。

其实这时候这个问题已经比较严重了，有可能回调中操作了界面，而界面上一些DOM节点早不存在，导致程序出错。实例化不必要的对象，消耗不必要的资源。

这个问题的解决方案也简单，比如记录当前对象是否调用了destroy方法，当调用后，后续的其它操作均不执行即可


## 为什么没发现问题

我们开发中也到处是异步，但出现上述错误情况很少，为什么？

```
取决于开发者的水平
取决于网络速度
取决于是否很闲
浏览器帮忙了
```

当你写代码时，你是最清楚程序的流程的，自测时自然也会等待异步加载完成才去操作下一步。再加上开发环境可能全部都在自已的机器上，异步的加载可以说是瞬间完成的，导致很难发现异步先后回调的问题。

即使一些开发者发现了现象，可能忙于业务开发，可能刷新页面重来没复现，
也就不可能投入精力去研究这个现象的背后问题。

我们回头再看一下博客园那个例子。当我们做如下操作时

```
点击第2页
请求未完成时点击别的链接
浏览器在当前窗口导航到新的地址
```

乍一看，没问题啊。确实没问题，原因是页面跳转时，浏览器会自动帮我们清除当前页面所使用的资源，包括那个未完成请求的xhr，所以呢，我们本身是不需要在页面跳转前先停止xhr的请求的。

## 思维定势

其实绝大多数异步的地方都很容易出问题，非常脆弱。但是如前面“为什么没发现问题”所说，我们并没认识到问题，时间久了就会认为自已写的异步是没有任何问题的。

即使有一天别人指出来说：你这次的请求发送之前要把上一个请求先停止掉。可能当时你的代码修改了，到下次仍然会忘掉这样做。因为你不停止，代码并不会报错，甚至警告都没有，也不会立即出现我们前面所说的问题现象。

但，问题，确实存在！而你，却认为自已的代码非常健壮

## 单页(View)

前面的问题在单页应用中表现更为突出，因为页面切换不再是浏览器unload,load，而是我们自已去实现，这就意味着我们要在view卸载时自已停止掉异步请求，销毁组件等。

我们应该如何彻底解决？

一切以页面区块(view)为主！

只有view知道当前的呈现状态，我们所有的操作都应该关联到这个view上，请求是否可以发出，请求回调是否可以被调用，组件是否要实例化，是否需要销毁等。让view来做决定

## View示例

在Magix中，简化了开发，提供了托管的概念，即所有的资源都应该托管到view对象上，并实现destroy方法，当view有变化并需要对这些资源销毁处理时，会自动调用它们的destroy方法。

比如：
```js
define('app/views/default',['magix'],function(require){
    var Magix=require('magix');
    return Magix.View.extend({
        render:function(){
            var timer=setTimeout(function(){
                alert('xl');
            },5000);
            this.manage({
                destroy:function(){
                    clearTimeout(timer);
                }
            });
        }
    });
});
```

而对于没有办法提供destroy的方法，比如前面的示例中require.async，终级解决方案是：

```js
define('app/views/default',['magix'],function(require){
    var Magix=require('magix');
    return Magix.View.extend({
        render:function(){
            reqire.async('app/tip',this.wrapAsync(function(Tip){
                //
            }));
        }
    });
});
```

对回调函数做一层包装，其实所有的异步回调的地方做一层包装均可解决异步带来的问题。

其实思维定势的问题，开发水平的问题，Magix很难解决，只能尽可能的提供如model,manager,以及brix.js，在这些文件中把上述问题内部消化掉。开发者仍需明白异步中存在的问题，这样在转移到其它开发平台上时，才能够杜绝类似的现象出现。