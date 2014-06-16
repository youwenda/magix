---
layout: post
title: Magix中的事件代理
---

先说普通事件代理，以`KISSY`为例

```
Event.delegate(document.body,'click','p',function(e){

});
```
这样其实是为`document.body`上绑定一个`click`事件，当鼠标在页面上点击时，看点击的元素是否是`p`元素,如果是则触发，不是则向从当前节点向上查找到符合的`p`元素，一直查到`body`。这里其实是有性能问题的(jQuery live)，稍后我们再讨论并给出解决方案。

事件代理其实就是把事件处理函数绑定在父级，通过事件冒泡的特点，识别触发事件的元素是否是自已期望的元素。对，重点是这个事件冒泡

`Magix`中的事件代理的过程是这样的：把相应的事件绑定在父节点后，当事件发生在父节点里，父节点的事件处理函数被调用后，从触发事件的节点(`target`)开始，判断节点是否有`mx-eventType`属性，如果有则停下来调用相应`view`的事件处理函数，如果没有则向上查找，直到父节点

再来看`Magix1.0`之前的事件代理方案
当前`view`使用的事件都统一绑定到`vframe`标签上，而`vframe`又可以嵌套，比如嵌套后的结构如下：

![Delegate Event]({{ site.baseurl }}/assets/img/article-de-0.png)

我们的事件是绑定在`vframe`上的，当`vframe2`与`vframe1`绑定相同类型的事件时，比如`click`，而`vframe2`的`view`与`vframe1`的`view`具有相同的事件处理函数时，比如`selectAll`，那么问题就来了：鼠标点击在`vframe2`的SelectAll checkbox上时，`vframe2`先处理，而同时事件冒泡，冒泡到`vframe1`上时，`vframe1`的`selectAll`方法同样会被触发。

这里因为`vframe1`节点与`vframe2`节点都绑定了`click`事件，而由于事件冒泡的原因，当点击在`vframe2`内部时，`vframe2`处理完事件向上冒泡到`vframe1`，导致`vframe1`又处理了一遍，那或许你会说为什么不取消事件冒泡呢？

因为在我们的项目中，我们有可能引入其它组件，比如弹出日历等，需要鼠标点击在页面其它位置时日历需要隐藏消失。所以我们不能直接就把事件冒泡取消，否则日历也无法隐藏(像日历这种通常是绑定在`document`，需要相关事件冒泡到`document`)
问题出来了总得有个解决办法

第1个解决方案：

明确事件的处理`vframe`，类似上图，当鼠标点击在`vframe2`时，当`vframe2`处理完事件后，给打一个标记，标明当前事件是被处理过的，当`vframe1`收到后，先判断是否是处理过的，如果是处理过则不再理会
说到这里，大家可以想象一下，如果嵌套的`vframe`比较多时，鼠标点击在最内部的`vframe`时，由于事件冒泡，冒泡到每一层的`vframe`时，这一层的`vframe`都需要对事件做一次判断，而这些判断其实是不必要的，因为事件已经被内部`vframe`处理了，为什么还在再次判断？这地方多少会有些性能损耗

方案1虽然有点性能损耗，但把问题解决了。可是方案1无法处理下面这个经常使用的场景：

![Delegate Event]({{ site.baseurl }}/assets/img/article-de-1.png)

当点击`vframe1`中的Popup按钮时，右下角弹出一个对话框，对话框中有一个不再提醒按钮，因对话框是`vframe1`弹出来的，所以对话框里带`mx-eventType`节点的事件处理也应该由`vframe1`来完成，通常对话框是在`body`下的，整个`HTML`内容都不在`vframe1`中，所以点击在对话框中的事件是不会被`vframe1`监听到的

这种问题如何解决？似乎只能把代理节点提高到`body`上，如果事件代理在`body`上而不是`vframe`上，则能解决掉上述弹出框的问题。同时也可以把注册在`vframe`上相同的监听统一合并到`body`上，这样`vframe`节点不需要注册任何事件，对于嵌套的`vframe`，也是统一在`body`上处理事件，不需要每一层`vframe`的判断了。

看样子很不错，但是一个很头痛的问题是：如何知道弹在`body`上的弹出框是属于哪个`vframe`的？

再来回归到`Magix`中的`view`设计，`view`设计成`html`和`js`两部分，所有与界面相关的都应该丢在`html`里。所以我们可以从这个`html`字符串入手，当`Magix`加载完成`view`时(加载js和html后),对`html`进行一次处理，对标有`mx-eventType`标识的节点加上一些标识，比如`html`是这样的：

```html
<div>
    <button mx-click="save">Save</button>
</div>
```

Magix1.0处理完成后是这样的：

```html
<div>
    <button mx-owner="magix_vf_65535" mx-click="save">Save</button>
</div>
```

而从Magix1.1之后的处理是这样的：

```html
<div>
    <button mx-click="magix_vf_65535^save">Save</button>
</div>
```
不管是哪种，都是在节点上加上当前`vframe`的`id`，这样当事件发生时，可通过该标识知道应该把这个事件交给哪个`vframe处`理。到这里，一个看似很完善的方案就产生了。

回到开头我们的那个问题(jQuery live)：事件是绑定在`body`上的，每当事件发生时，我们都要从发生事件的节点向上查找带有`mx-eventType`标识的节点，直到`body`。那我们来看一种情况：

![Delegate Event]({{ site.baseurl }}/assets/img/article-de-2.png)

假设html结构是这样的：

```html
<div>
    div1
    <div>
        div2
        <button mx-click="save">Save</button>
    </div>
</div>
```

`document.body`注册了一个`click`事件，当鼠标点击在`button`上时，`target`即符合我们的要求(带有`mx-click`属性)，所以不再向上查找，把`button`转交给相应的`vframe`去处理，而如果点击在`button`外部时，由于`div`不带`mx-click`属性，则会一直向上查找，直到`body`，而如果这种嵌套比较深的话，每次点击在`button`外部时，都需要从里至外的查找到`body`，性能上肯定不乐观，如何提升这块的性能 ？

我们发现不管是点击在`div2`内部还是`div1`内部，从事件触发的节点到`body`这条路径上是没有带`mx-eventType`属性的节点的，所以在向上查找的过程中，会把整条路径上的节点都记录下来，如果到`body`还未找到带`mx-eventType`的节点，则会把这些节点都打上`mx-ei`标识，处理后如下：

```html
<div mx-ei="click">
    div1
    <div mx-ei="click">
        div2
        <button mx-click="save">Save</button>
    </div>
</div>
```

表明从这个节点向上是没有带`mx-eventType`属性的节点的，当下次再点击时，首先看当前这个节点是否带`mx-ei`，如果带且`mx-ei`里面有相应的事件类型，则不再向上查找

对于上面这种结构，如果首次点击在`div1`内部，则`div1`会打上`mx-ei="click"`标识，如果第二次点击在`div2`内部，则从`div2`开始向上查找，查找一次后发现父节点带`mx-ei="click"`标识，则中止，不再一直查到`body`，同时给`div2`也打上`mx-ei="click"`的标识

这种方案在首次消耗一次`CPU`，后续的查找基本上都不会查到`body`，只要父节点带有`mx-ei="eventType"`即可结束


由于Maigx事件本身是代理进行的，直接在期望的节点上写`mx-event`即可，最好不要出现类似这样的代码：

```html
<div>
    <ul mx-click="delegateLiClick">
        <li>A</li>
        <li>B</li>
        <li>C</li>
    </ul>
</div>
```

直接在`li`上面写`mx-click`即可，如果是在`ul`节点上，Magix本身需要从事件触发的节点向上找到带`mx-eventType`或`mx-ei`的节点，开发者还需要从`target`再来判断一次事件触发节点是否是期望的`li`，从而拉低了性能。

经过上述方案后，对于高频事件比如`mousemove`也能很好的应对，不至于鼠标在页面内快速移动而造成`CPU`瞬间上升

最后要说的是非冒泡事件的代理

非冒泡是直接调用`KISSY`的实现，整体性能上肯定不如冒泡事件，但所幸的是非冒泡事件在项目中并不常用，再一个是非冒泡事件没有高频事件，所以这块还是比较理想(Magix中只处理可视元素的事件，像`document`,`window`上的事件需要开发者手动绑定)

综上是Magix中整个事件代理的过程，代码可参考`maigx/body`中的实现，以及`magix/view`中的`wrapMxEvent`方法对`html`添加标识的处理

当然还有一处是对`html`打标识的这个过程，Magix是如何精确的为带`mx-eventType`的节点加上标识的？其实就是简单的正则替换，肯定有不准确的情况，如果出现这种情况可以通过扩展重写`view`的`wrapMxEvent`方法即可