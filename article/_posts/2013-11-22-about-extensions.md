---
layout: article
title: Magix中的扩展机制
---

最初，我有一个任务：Magix中的view只做核心，然后可以一层层的增强这个view。我称之为view的回字形增强

从开始，我就掉进了继承的陷井里，觉得这个事情怎么都应该通过继承来做，但是结果很不理想，继承越深，越不易维护。直到Magix1.0出来后也没有合适的方案，直到直通车系统中对Router的一个需求让我清醒了

Router本身是对url的导航，解析等，在直通车中某些页面需要在跳转前判断当前页面用户的设置是否发生了改变，如果发生了改变则提示用户。Router原来是没有这个功能的，因为绝大多数项目是不需要该功能的，但是在直通车里这个功能必须实现，所以我就重写了Router的一个方法，然后又通过配置项的形式把重写的代码生效。

类似这样：在项目中建立一个router.js，并在里面写上如下代码：

```javascript
KISSY.add('app/router',function(S,Router){
    Router.useHash=function(){
        //…
    }
},{
    requires:['magix/router']
});
```

然后在Magix的start方法中把该文件启用：

```javascript
Magix.start({
    //…
    extensions:['app/router']
});
```

从而实现了对router的定制，我需要离开当前页面确认我就启用`app/router`，否则不启用。这不正是我想要的view的回字形增强么？

针对这种需要适应不同情形的，组合比继承更优势些，在JS里，简单的mixin其实就可以理解为组合，而某些时候会比继承还要好些，考虑下面的这段代码：

```javascript
//继承的写法
var T=function(){

};

T.prototype.hello=function(){

}

var E=KISSY.extend(T,{
    hi:function(){
        this.hello();
}
});

//组合

var T=function(){

};

T.prototype.hello=function(){

}

var E=function(){

};

E.prototype.hi=function(){
    this.hello();
};

KISSY.mix(E.prorotype,T.prototype);
```

同样new E();后者在调用hello方法时减少一次原型链查找。当然，组合也有组合的弊端，比如不方便调用父类的同名方法等


1.0想明白了，在做Magix1.1的时候，就重新审视了扩展机制，像View直接带有mixin方法，magix/body带有special方法等，这些都是为扩展做准备的。

扩展分为三大类：

一：增强类

比如View本身是不与Brix结合的，如果在项目中使用Brix，可以写一个增强View的扩展，比如添加一个renderByPagelet的方法，像这种是对View本身的一个增强或补充，这类扩展一旦使用则不能移除

二：统计类

如果要做Magix项目中的页面切换，接口请求进行统计，比如统计2个页面间切换用时，接口请求用时等。都可以通过相应的扩展来实现，从而不需要修改项目中的代码。也不需要项目开始时就启用统计扩展，只在需要用时启用即可

三：可有可无

其实第二类也可以归为可有可无类，因为有没有它并不会影响程序的正确运行，除了统计之外，还有一类比如页面间切换的动画效果，也是可以做成一个动画扩展，当启用时，页面间切换可以有一个动画，不启用时，则是普通的页面切换


以上这些扩展都可以在src/exts下面找到。这些扩展仅是示例扩展，如果要在项目中使用，还需要稍做改动。
