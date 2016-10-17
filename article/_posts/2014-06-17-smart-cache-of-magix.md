---
layout: article
title: Magix中智能缓存
---

在前端开发过程中，我们经常会在内存中缓存一些数据，其实javascript的缓存比较简单，只需要声明一个变量或把一些数据挂到某个对象上即可，比如我们要实现一个对所有的ajax请求缓存的方法，简单实现如下:

```js
var cache={};
var request=function(url,callback){
    if(cache[url]){
        callback(cache[url]);
    }else{
        $.ajax({
            url:url,
            success:function(data){
                callback(cache[url]=data);
            }
        });
    }
};
```

**注意**
示例中仅做简单演示，未考虑同时对相同的url请求多次，比如

```js
request('/a');
request('/a');
```

在上述代码中仍然会发起2次对a的请求，这不是我们讨论的重点，我们重点讨论请求成功并缓存数据后，再请求该url的事情，所以这个问题略过不题


我们回头看一下我们的request方法，会发现这样的问题：

**有些url在整个项目中或许只请求一次，我们仍然对它的结果进行缓存，造成资源被白白占用，如果应用在移动端，移动端的资源本身就比较宝贵，所以我们更应该珍惜资源的使用**

所以针对request方法中的缓存做一些改进，使它更智能些。我们需要一种算法，保证缓存的个数不能太多，同时缓存的资源数超多时，它能聪明的删掉那些不常用的缓存数据

那我们看一下，当我们要实现这样一个算法有哪些关键点要考虑：

 1. 我们需要知道缓存中缓存了多少个资源
 2. 当我们从缓存中获取某个缓存资源时，获取的算法复杂度应该是o(1)，缓存模块的作用是提高程序的效率，拿空间换时间，所以缓存模块不应该占用过多的CPU时间

明确目标后，我们就需要寻找合适的对象来缓存我们的数据：

**var obj={}**

根据key从obj上查找某个对象，复杂度是o(1)，满足我们的第2条要求，但obj上缓存了多少个资源需要我们自已维护

**var obj=[]**

根据key查找某个对象时，复杂度是o(n)，但数组有length，可以自动的帮我们维护当前缓存了多少个资源

我们知道数组是特殊的对象，所以我们可以把数组当成普通的对象来用。

**当我们把一个缓存对象push进数组时，再根据缓存对象唯一的key，把它放到这个数组对象上**


所以这时候我们第1版本的代码可能类似这样：

```js
var Cache=function(){
    this.$cache=[];
};

Cache.prototype.set=function(key,item){
    var cache=this.$cache;
    var wrap={//包装一次，方便我们放其它信息，同时利用对象引用传递
        key:key,
        item:item
    };
    cache.push(wrap);
    cache['cache_'+key]=wrap;//加上cache_的原因是：防止key是数字或可转化为数字的字符串，这样的话就变成了如 cache['2'] 通过下标访问数组里面的元素了。
};

Cache.prototype.get=function(key){
    var res=this.$cache['cache_'+key];
    return res.item;//返回放入的资源
};
```

使用示例如下：

```js
var c=new Cache();
c.set('/api/userinfo',{
    name:'彳刂'
});

console.log(c.get('/api/userinfo'));
```

这时候我们就完成了初步要求，知道缓存个数，查找时复杂度是o(1)

不过我们仍然需要更智能一些的缓存：

 1. 知道单个缓存资源的使用频率
 2. 知道单个缓存资源的最后使用时间
 3. 缓存中最多能放多少个缓存资源
 4. 何时清理缓存资源

我们改造下刚才的代码：

```diff
var Cache=function(max){
    this.$cache=[];
+   this.$max=max | 0 ||20;
};

Cache.prototype.set=function(key,item){
    var cache=this.$cache;
-   var wrap={//包装一次，方便我们放其它信息，同时利用对象引用传递
-        key:key,
-        item:item
-    };
+   key='cache_'+key;
+   var wrap=cache[key];
+   if(!cache.hasOwnProperty(key){
+       wrap={};
+       cache.push(wrap);
+       cache[key]=wrap;
+   }
+   wrap.item=item;
+   wrap.fre=1;//初始使用频率为1
+   wrap.key=key;
+   wrap.time=new Date().getTime();
};

Cache.prototype.get=function(key){
    var res=this.$cache['cache_'+key];
    if(res){
        res.fre++;//更新使用频率
        res.time=new Date().getTime();
    }
    return res.item;//返回放入的资源
};
```

在我们第2版本的代码中，我们添加了最多缓存资源数max，同时每个缓存资源加入了使用频率fre及最后使用时间time，同时我们修改了set方法，考虑了相同key的多次set问题。

我们简单测试下：

```js
var c=new Cache();
c.set('/api/userinfo',{
    name:'彳刂'
});

console.log(c.$cache[0].fre);//1
console.log(c.get('/api/userinfo'));
console.log(c.$cache[0].fre);//2
```

接下来我们要考虑一但缓存资源数超出了我们规定的max时，我们要清理掉不常用的资源。清理时我们根据频率的使用fre标志，fre最小的优先清理，同时相同的fre，我们优先清理time比较小的，这也是time设计的意义所在。

所以第3版我们的代码如下：

```diff
var Cache=function(max){
    this.$cache=[];
    this.$max=max | 0 ||20;
};

Cache.prototype.set=function(key,item){
    var cache=this.$cache;
    key='cache_'+key;
    var wrap=cache[key];
    if(!cache.hasOwnProperty(key){
+       if(cache.length>=this.$max){
+           cache.sort(function(a,b){
+               return b.fre==a.fre?b.time-a.time:b.fre-a.fre;
+           });
+           var item=cache.pop();//删除频率使用最小，时间最早的1个
+           delete cache[item.key];//
+       }
        wrap={};
        cache.push(wrap);
        cache[key]=wrap;
    }
    wrap.item=item;
    wrap.fre=1;//初始使用频率为1
    wrap.key=key;
    wrap.time=new Date().getTime();
};

Cache.prototype.get=function(key){
    var res=this.$cache['cache_'+key];
    if(res){
        res.fre++;//更新使用频率
        res.time=new Date().getTime();
    }
    return res.item;//返回放入的资源
};

+Cache.prototype.has=funciton(key){
+   return this.$cache.hasOwnProperty('cache_'+key);
+};
```

OK，到这里我们就完成了想要的缓存，我们结合最开始的request方法来进行实际测试：

```js
var cache=new Cache(2);
var request=function(url,callback){
    if(cache.has(url)){
        callback(cache.get(url);
    }else{
        $.ajax({
            url:url,
            success:function(data){
                cache.set(url,data);
                callback(data);
            }
        });
    }

    })
};

//实际使用（假设下一个request方法被调用时，前面request的已经完成请求并缓存好了数据）：
request('/api/item1');
request('/api/item2');
request('/api/item1');//命中缓存
request('/api/item3');//达到上限2，cache对象的内部$cache排序一次，删除/api/item2的缓存
request('/api/item4');//仍然达到上限2，cache对象的内部$cache排序一次，删除/api/item3的缓存

request('/api/item3');//接下来需要多次使用/api/item3，但在请求/api/item4时，它已经被删除了，所以我们需要重新请求。完成请求后，因为上限2依然满足，所以cache对象内部的$cache仍然需要排序一次，删除/api/item4
request('/api/item3');//命中缓存
```

根据上述使用，我们发现，一但达到缓存的上限后，带来的问题如下：

 1. 新的缓存资源进来一个，就需要重新排序一次，性能不好
 2. 有可能误删除接下来可能频率使用到的缓存资源

这时候我们就需要寻找突破。类比我们经常使用的操作系统的缓存区，我们的缓存是否也可以加入一个缓冲区呢？当整个缓存列表加上缓冲区都满的时候，才清空一次缓存区，不但能解决频繁排序的问题，也能很好的保留接下来程序中可能频繁使用到的缓存资源

来，缓存的第4版：

```diff
var Cache=function(max,buffer){
    this.$cache=[];
    this.$max=max | 0 ||20;
+   this.$buffer=buffer | 0 ||5;
};

Cache.prototype.set=function(key,item){
    var cache=this.$cache;
    key='cache_'+key;
    var wrap=cache[key];
    if(!cache.hasOwnProperty(key){
-        if(cache.length>=this.$max){
+       if(cache.length>=this.$max+this.$buffer){
            cache.sort(function(a,b){
                return b.fre==a.fre?b.time-a.time:b.fre-a.fre;
            });
-            var item=cache.pop();//删除频率使用最小，时间最早的1个
-            delete cache[item.key];//
+           var buffer=this.$buffer;
+           while(buffer--){
+               var item=cache.pop();
+               delete cache[item.key];
+           }
        }
        wrap={};
        cache.push(wrap);
        cache[key]=wrap;
    }
    wrap.item=item;
    wrap.fre=1;//初始使用频率为1
    wrap.key=key;
    wrap.time=new Date().getTime();
};

Cache.prototype.get=function(key){
    var res=this.$cache['cache_'+key];
    if(res){
        res.fre++;//更新使用频率
        res.time=new Date().getTime();
    }
    return res.item;//返回放入的资源
};

Cache.prototype.has=funciton(key){
    return this.$cache.hasOwnProperty('cache_'+key);
};
```

这时候我们再结合request来测试一下：

```js
var cache=new Cache(2,2);//最大2个，2个缓存区，真实可以缓存4个
var request=function(url,callback){
    if(cache.has(url)){
        callback(cache.get(url);
    }else{
        //$.ajax略
    }
};

request('/api/item1');
request('/api/item2');
request('/api/item3');//放在缓冲区
request('/api/item4');//放在缓冲区
request('/api/item5');//排序一次，清除/api/item2 /api/item1
request('/api/item6');//放在缓冲区
request('/api/item7');//放在缓冲区
```

至此我们就完成了比较完善的缓存模块

当然，后续我们增加缓存资源的生命期，比如20分钟后清除，也是较容易的，不在这里详解。

Magix的cache模块比这里稍微再复杂些，不过原理都是一样的。
