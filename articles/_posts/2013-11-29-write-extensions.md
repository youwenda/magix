---
layout: post
title: 如何编写Magix中的扩展
---

View的扩展
----------

通过View的mixin方法进行扩展，示例如下（KISSY）：

```javascript
KISSY.add('app/exts/extview',function(S,View){
    View.mixin({
         testExt:function(){
             alert(this.$msg);
         }
    },function(){
         this.$msg='test';
    });
},{
    requires:['magix/view']
});
```

然后启用扩展

```javascript
KISSY.use('magix/magix',function(S,Magix){
    Magix.start({
        extensions:['app/exts/extview']
    });
});
```

这样在任意view中都会有一个testExt方法，比如：

```javascript
//...
render:function(){
    this.testExt();
}
```

mixin的API见这里：[http://thx.github.io/magix-api/#!/kissy/1.1/view?focus=sm_mixin][1]


Router的扩展
------------

```javascript
/*
    扩展路由示例，仅KISSY版
*/
KISSY.add('mxext/router', function(S, R, E, View) {
    var W = window;
    R.useState = function() {
        var me = this,
            initialURL = location.href;
        var lastHref = initialURL;
        var newHref;
        E.on(W, 'popstate', function(e) {
            newHref = location.href;
            var equal = newHref == initialURL;
            if (!me.poped && equal) return;
            me.poped = 1;
            if (newHref != lastHref) {
                e = {
                    backward: function() {
                        e.p = 1;
                        history.replaceState(S.now(), document.title, lastHref);
                        me.fire('change:backward');
                    },
                    forward: function() {
                        e.p = 1;
                        lastHref = newHref;
                        me.route();
                    },
                    prevent: function() {
                        e.p = 1;
                        me.fire('change:prevent');
                    },
                    location: me.parseQH(newHref)
                };
                me.fire('change', e);
                if (!e.p) {
                    e.forward();
                }
            }
        });
    };
    R.useHash = function() {
        var me = this,
            lastHash = me.parseQH().srcHash;
        var newHash;
        E.on(W, 'hashchange', function(e, loc) {
            loc = me.parseQH();
            newHash = loc.srcHash;
            if (newHash != lastHash) {
                e = {
                    backward: function() {
                        e.p = 1;
                        location.hash = '#!' + lastHash;
                        me.fire('change:backward');
                    },
                    forward: function() {
                        e.p = 1;
                        lastHash = newHash;
                        me.route();
                    },
                    prevent: function() {
                        e.p = 1;
                        me.fire('change:prevent');
                    },
                    location: loc
                };
                me.fire('change', e);
                if (!e.p) {
                    e.forward();
                }
            }
        });
    };
    /**
     * 页面改变后的提示
     * @param {Function} changedFun 是否发生改变的回调方法
     * @param {String} tipMsg 提示信息
     */
    View.prototype.observePageChange = function(changedFun, tipMsg) {
        var me = this;
        var changeListener = function(e) {
            if (changedFun.call(me)) {
                if (!me.$waitPC) {
                    me.$waitPC = true;
                    if (W.confirm(tipMsg)) {
                        delete me.$waitPC;
                        e.forward();
                    } else {
                        delete me.$waitPC;
                        e.backward();
                    }
                } else {
                    e.prevent();
                }
            }
        };
        R.on('change', changeListener);
        W.onbeforeunload = function(e) {
            if (changedFun.call(me)) {
                e = e || W.event;
                if (e) e.returnValue = tipMsg;
                return tipMsg;
            }
        };

        me.on('destroy', function() {
            R.un('change', changeListener);
            W.onbeforeunload = null;
        });
    };
}, {
    requires: ['magix/router', 'event', 'magix/view']
});
```

ModelManager的扩展
---------------

```javascript
/*
    author:xinglie.lkf@taobao.com
*/
KISSY.add('exts/mmanager', function(S, MM, Magix) {
    var JoinedCache = Magix.cache();
    var MConvert = function(obj, prefix, toObject) {
        var a = toObject ? {} : [];
        prefix = prefix || '';
        var one;
        var mix = Magix.mix;
        for (var p in obj) {
            one = obj[p];
            if (toObject) {
                if (prefix) {
                    p = prefix + p;
                }
                a[p] = one;
            } else {
                if (prefix) {
                    one = mix({}, one);
                    one.name = prefix + one.name;
                }
                a.push(one);
            }
        }
        return a;
    };
    return MM.mixin({
        /**
          * 注册常用方法，或以把经常几个同时请求的model封装成一个方法以便快捷调用
          * @param {Object} methods 方法对象
          */
        registerMethods: function(methods) {
            var me = this;
            var cMethods = me.$mMetods;
            var one;
            for (var p in methods) {
                one = methods[p];
                me[p] = one;
                cMethods[p] = one;
            }
        },
        /**
          * 联合其它MManager查询
          * @param {MManager} manager 要联合的Manager
          * @param {String} [prefix] 为联合的Manager中的元信息名称加的前缀，当2个Manager内部有同名的元信息时的解决方案
          * @return {MManager}
          */
        join: function(manager, prefix) {
            var me = this;
            var mclass = me.$mClass;
            if (mclass != manager.$mClass) {
                throw new Error('modelClass diff!');
            }
            var key = prefix + '$' + me.id + '$' + manager.id;
            var m = JoinedCache.get(key);
            if (!m) {
                m = MM.create(mclass);
                m.registerModels(MConvert(me.$mMetas));
                m.registerMethods(me.$mMetods);

                m.registerModels(MConvert(manager.$mMetas, prefix));
                m.registerMethods(MConvert(manager.$mMetods, prefix, 1));
                JoinedCache.set(key, m);
            }
            return m;
        }
    }, function() {
        var me = this;
        me.$mMetods = {};
    });
}, {
    requires: ['mxext/mmanager', 'magix/magix']
});
```

启用扩展与前面的View启用示例一样，都是加入`Magix.start`的`extensions'的数组中

更多扩展与示例请参考：[https://github.com/thx/magix/tree/master/src/exts][2]


[1]: http://thx.github.io/magix-api/#!/kissy/1.1/view?focus=sm_mixin
[2]: https://github.com/thx/magix/tree/master/src/exts