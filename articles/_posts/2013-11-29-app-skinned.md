---
layout: post
title: Magix应用中的换肤与换模板
---

目录结构：

    app
        theme
            global
                reset.css
            default
                header.css
            skin1
                style.css
                header.css
            skin2
                style.css
        views
            default.html
            default-skin2.html
            default.js

            header.html
            header-skin1.html
            header.js


index.html

```html
<link href="theme/global/reset.css" rel="stylesheet" type="text/css" />
<link href="theme/{{skin}}/style.css" rel="stylesheet" type="text/css" />

<script>
KISSY.use('magix/magix',function(S,Magix){
    //...
    Magix.start({
          //...
         skin:'{{skin}}'
    });
});
</script>
```

header.js
```javascript
KISSY.add('app/views/header',function(S,View){
     return View.extend({
          supportSkins:['skin1'],
          supportTmpls:['skin2'],

          render:function(){
          }
     });
},{
    requires:['magix/view']
});
```

default.js
```javascript
KISSY.add('app/views/default',function(S,View){
     return View.extend({
          supportTmpls:['skin2'],
          render:function(){
          }
     });
},{
    requires:['magix/view']
});
```

css部分：分共用css和依据当前皮肤，特殊定制的css。比如上例中，默认所有的header都加载default/header.css文件，而对于指明使用skin1时，就需要去加载skin1/header.css，指明使用skin2时，由于skin2并不需要对header.css进行特殊定制，则加载default/header.css（换句话说skin2里并没有header.css则转去加载default中的header.css）

html部分：与css类似，也是根据选择的皮肤，可能使用默认模板，也可能使用特殊定制的模板，不管哪种，它们的js是一样的。比如使用skin1时，default要加载default.html，header要加载header-skin1.html，而对于使用skin2时，default要加载default-skin2.html，header要加载header.html


由于magix核心本身并不提供换肤换布局的机制，所以我们需要写一个扩展来实现我们的需求：

```javascript
KISSY.add('app/exts/skinedview',function(S,View,Magix){
    var oldLoad=View.prototype.load;
    View.mixin({
         load:function(){
              var me=this;
              var sign=me.sign;
              var skin=Magix.config('skin');
              var curViewName=me.path.split('/').pop();
              var curViewCss=curViewName+'.css';

             if(me.supportSkins){//有一些view本身是不需要再额外加载css的，所以我们只处理可能要单独加载css的这一部分
                  skin=S.inArray(skin,me.supportSkins)?skin:'default';
                  S.use('app/theme/'+skin+'/'+curViewCss,function(){
                      if(sign==me.sign){
                          oldLoad.call(me);
                      }
                  });
            }else{
                  oldLoad.call(me);
            }
         }
    });
},{
    requires:['magix/view','magix/magix']
});
```

这样就完成了css的部分，然后在`Magix.start`中启用该扩展

```javascript
Magix.start({
    extensions:['app/exts/skinedview']
});
```

对于模板来讲，稍微复杂些，分开发与上线2个环境，对于开版来讲，只需要根据View中supportTmpls来决定加载哪个html，所以这块容易解决，对于上线来讲，原来的打包方案是把html打包进js中，并做为View的一个属性`template`存在，但对于换html来讲，这样显然是不行的，所以打包需要把html打包成一个单独的js如：

```javascript
KISSY.add('app/views/default-skin2-tmpl',function(){
     return 'template';
});
```

是否是开发还是上线，是使用xhr获取html文件还是用script标签加载模板js文件，在程序内部很难识别出来，所以我们在`Magix.start`中增加一个新的配置项`release`来帮助我们确定使用哪种

```javascipt
Magix.start({
    release:{{release}}//true or false
});
```

在Magix中，View获取模板是通过`fetchTmpl`方法，所以我们拦截这个方法进行改写`app/exts/skinedview`：

```javascript
KISSY.add('app/exts/skinedview',function(S,View,Magix){
     var oldFetch=View.prototype.fetchTmpl;
     return View.extend({
         //...略去css换肤部分(load)
         fetchTmpl:function(path,callback){
               var me=this;
               var release=Magix.config('release');
               var skin=Magix.config('skin');
               var supportTmpls=me.supportTmpls;
               if(supportTmpls){
                   skin=S.inArray(supportTmpls,skin)?'-'+skin:'';
                   if(release){
                       S.use(path+skin+'-tmpl',function(S,Tmpl){
                           callback(Tmpl);
                       });
                   }else{
                       oldFetch.call(me,path+skin+'-tmpl',callback);
                   }
               }else{
                   if(release){
                       S.use(path+'-tmpl',function(S,Tmpl){
                           callback(Tmpl);
                       });
                   }else{
                       oldFetch.call(me,path+'-tmpl',callback);
                   }
               }
           }
     });
},{
    requires:['magix/view','magix/magix']
});
```

至此，我们就完成了复杂而又灵活自由多变的换肤功能(css可能定制可能使用默认，html同样)，如果我们能够统一下来，比如不管哪种皮肤，所有的css都应该存在，模板也按同样的方式处理，则换肤会更简单些。

以上代码是个人按印象中所写，并不代表代码一定可以运行，需要看官实践！