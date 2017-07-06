var View_EvtMethodReg = /^(\$?)([^<]+?)<([^>]+)>$/;
var View_ScopeReg = /\u001f/g;
var View_SetEventOwner = function(str, id) {
    return (str + G_EMPTY).replace(View_ScopeReg, id || this.id);
};
/*#if(modules.viewProtoMixins){#*/
var processMixinsSameEvent = function(exist, additional, temp) {
    if (exist.$l) {
        temp = exist;
    } else {
        temp = function(e) {
            G_ToTry(temp.$l, e, this);
        };
        temp.$l = [exist];
        temp.$m = 1;
    }
    temp.$l = temp.$l.concat(additional.$l || additional);
    return temp;
};
/*#}#*/
//var View_MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;
/*#if(modules.resource){#*/
var View_DestroyAllResources = function(me, lastly) {
    var cache = me.$r, //reources
        p, c;
    for (p in cache) {
        c = cache[p];
        if (lastly || c.x) { //destroy
            View_DestroyResource(cache, p, 1);
        }
    }
};
var View_DestroyResource = function(cache, key, callDestroy, old) {
    var o = cache[key],
        fn, res;
    if (o && o != old) {
        //var processed=false;
        res = o.e; //entity
        fn = res.destroy;
        if (fn && callDestroy) {
            G_ToTry(fn, G_EMPTY_ARRAY, res);
        }
        delete cache[key];
    }
    return res;
};
/*#}#*/
var View_WrapRender = function(prop, fn, me) {
    fn = prop.render;
    prop.render = function() {
        me = this;
        if (me.$s > 0) { //signature
            me.$s++;
            me.fire('rendercall');
            /*#if(modules.resource){#*/
            View_DestroyAllResources(me);
            /*#}#*/
            G_ToTry(fn, G_Slice.call(arguments), me);
        }
    };
};
var View_DelegateEvents = function(me, destroy) {
    var events = me.$eo; //eventsObject
    var selectorObject = me.$so;
    var p, e;
    for (p in events) {
        Body_DOMEventBind(p, selectorObject[p], destroy);
    }
    events = me.$el; //eventsList
    p = events.length;
    while (p--) {
        e = events[p];
        G_DOMEventLibBind(e.e, e.n, G_DOMGlobalProcessor, destroy, {
            i: me.id,
            v: me,
            f: e.f,
            e: e.e
        });
    }
};
/*#if(modules.viewMerge){#*/
var View_Ctors = [];
/*#}#*/
var View_Globals = {
    win: G_WINDOW,
    doc: G_DOCUMENT
};
/**
 * 预处理view
 * @param  {View} oView view子类
 * @param  {Vom} vom vom
 */
var View_Prepare = function(oView) {
    if (!oView[G_SPLITER]) { //只处理一次
        oView[G_SPLITER] = 1;
        var prop = oView[G_PROTOTYPE],
            currentFn, matches, selectorOrCallback, events, eventsObject = {},
            eventsList = [],
            selectorObject = {},
            node, isSelector, p, item, mask;
        for (p in prop) {
            currentFn = prop[p];
            matches = p.match(View_EvtMethodReg);
            if (matches) {
                isSelector = matches[1];
                selectorOrCallback = matches[2];
                events = matches[3].split(G_COMMA);
                while ((item = events.pop())) {
                    node = View_Globals[selectorOrCallback];
                    mask = 1;
                    if (isSelector) {
                        if (node) {
                            eventsList.push({
                                f: currentFn,
                                e: node,
                                n: item
                            });
                            continue;
                        }
                        mask = 2;
                        node = selectorObject[item];
                        if (!node) {
                            node = selectorObject[item] = {};
                        }
                        node[selectorOrCallback] = 1;
                    }
                    eventsObject[item] = eventsObject[item] | mask;
                    item = selectorOrCallback + G_SPLITER + item;
                    node = prop[item];
                    /*#if(modules.viewProtoMixins){#*/
                    //for in 就近遍历，如果有则忽略
                    if (!node) { //未设置过
                        prop[item] = currentFn;
                    } else if (node.$m) { //现有的方法是mixins上的
                        if (currentFn.$m) { //2者都是mixins上的事件，则合并
                            prop[item] = processMixinsSameEvent(node, currentFn);
                        } else if (G_Has(prop, p)) { //currentFn方法不是mixin上的，也不是继承来的，在当前view上，优先级最高
                            prop[item] = currentFn;
                        }
                    }
                    /*#}else{#*/
                    if (!node) {
                        prop[item] = currentFn;
                    }
                    /*#}#*/
                }
            }
        }
        //console.log(prop);
        View_WrapRender(prop);
        prop.$eo = eventsObject;
        prop.$el = eventsList;
        prop.$so = selectorObject;
        prop.$t = !!prop.tmpl;
    }
};
/*#if(modules.router){#*/
var View_IsParamsChanged = function(params, ps, r) {
    for (var i = 0; i < params.length; i++) {
        r = G_Has(ps, params[i]);
        if (r) break;
    }
    return r;
};
var View_IsObserveChanged = function(view) {
    var loc = view.$l;
    var res;
    if (loc.f) {
        if (loc.p) {
            res = Router_LastChanged[Router_PATH];
        }
        if (!res) {
            res = View_IsParamsChanged(loc.k, Router_LastChanged[Router_PARAMS]);
        }
        // if (res && loc.c) {
        //     loc.c.call(view);
        // }
    }
    return res;
};
/*#}#*/
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @example
 * // 关于事件:
 * // html写法：
 *
 * //  &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 * //  &lt;a href="http://etao.com" mx-click="test({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 * // js写法：
 *
 *     'test&lt;click&gt;':function(e){
 *          e.preventDefault();
 *          //e.current 处理事件的dom节点(即带有mx-click属性的节点)
 *          //e.target 触发事件的dom节点(即鼠标点中的节点，在current里包含其它节点时，current与target有可能不一样)
 *          //e.params  传递的参数
 *          //e.params.com,e.params.id,e.params.name
 *      },
 *      'test&lt;mousedown&gt;':function(e){
 *
 *       }
 *
 *  //上述示例对test方法标注了click与mousedown事件，也可以合写成：
 *  'test&lt;click,mousedown&gt;':function(e){
 *      alert(e.type);//可通过type识别是哪种事件类型
 *  }
 */


var View = function(ops, me) {
    me = this;
    G_Mix(me, ops);
    /*#if(modules.router){#*/
    me.$l = {
        k: []
    };
    /*#}#*/
    /*#if(modules.resource){#*/
    me.$r = {};
    /*#}#*/
    me.$s = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    /*#if(modules.updater){#*/
    me.updater = new Updater(me.id);
    /*#}#*/
    /*#if(modules.viewMerge){#*/
    G_ToTry(View_Ctors, ops, me);
    /*#}#*/
};
var ViewProto = View[G_PROTOTYPE];
G_Mix(View, {
    /**
     * @lends View
     */
    /**
     * 扩展View
     * @param  {Object} props 扩展到原型上的方法
     * @example
     * define('app/tview',function(require){
     *     var Magix = require('magix');
     *     Magix.View.merge({
     *         ctor:function(){
     *             this.$attr='test';
     *         },
     *         test:function(){
     *             alert(this.$attr);
     *         }
     *     });
     * });
     * //加入Magix.config的exts中
     *
     *  Magix.config({
     *      //...
     *      exts:['app/tview']
     *
     *  });
     *
     * //这样完成后，所有的view对象都会有一个$attr属性和test方法
     * //当然上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
     * //同时当项目进行中发现所有view要实现某个功能时，该方式比继承更快捷有效
     *
     *
     */
    /*#if(modules.viewMerge){#*/
    merge: function(props, ctor) {
        ctor = props && props.ctor;
        if (ctor) View_Ctors.push(ctor);
        G_Mix(ViewProto, props);
    },
    /*#}#*/
    /**
     * 继承
     * @param  {Object} [props] 原型链上的方法或属性对象
     * @param {Function} [props.ctor] 类似constructor，但不是constructor，当我们继承时，你无需显示调用上一层级的ctor方法，magix会自动帮你调用
     * @param {Array} [props.mixins] mix到当前原型链上的方法对象，该对象可以有一个ctor方法用于初始化
     * @param  {Object} [statics] 静态对象或方法
     * @example
     * var Magix = require('magix');
     * var Sortable = {
     *     ctor: function() {
     *         console.log('sortable ctor');
     *         //this==当前mix Sortable的view对象
     *         this.on('destroy', function() {
     *             console.log('dispose')
     *         });
     *     },
     *     sort: function() {
     *         console.log('sort');
     *     }
     * };
     * module.exports = Magix.View.extend({
     *     mixins: [Sortable],
     *     ctor: function() {
     *         console.log('view ctor');
     *     },
     *     render: function() {
     *         this.sort();
     *     }
     * });
     */
    extend: function(props, statics) {
        var me = this;
        props = props || {};
        var ctor = props.ctor;
        /*#if(modules.viewProtoMixins){#*/
        var ctors = [];
        if (ctor) ctors.push(ctor);
        /*#}#*/
        var NView = function(a, b) {
            me.call(this, a, b);
            /*#if(modules.viewProtoMixins){#*/
            G_ToTry(ctors, b, this);
            /*#}else{#*/
            if (ctor) ctor.call(this, b);
            /*#}#*/
        };
        /*#if(modules.viewProtoMixins){#*/
        var mixins = props.mixins;
        if (mixins) {
            var c = mixins.length,
                i = 0,
                o, temp = {},
                p, val, old;
            while (i < c) {
                o = mixins[i++];
                for (p in o) {
                    val = o[p];
                    old = temp[p];
                    if (p == 'ctor') {
                        ctors.push(val);
                    } else if (View_EvtMethodReg.test(p)) {
                        if (old) {
                            val = processMixinsSameEvent(old, val);
                        } else {
                            val.$m = 1;
                        }
                        temp[p] = val;
                    } else if (DEBUG && old) { //只在开发中提示
                        Magix_Cfg.error(Error('mixins duplicate:' + p));
                    } else {
                        temp[p] = val;
                    }
                }
            }

            props = G_Mix(temp, props);
        }
        /*#}#*/
        NView.extend = me.extend;
        return G_Extend(NView, me, props, statics);
    }
});
G_Mix(G_Mix(ViewProto, Event), {
    /**
     * @lends View#
     */
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: G_NOOP,
    /*#if(modules.viewInit){#*/
    /**
     * 初始化调用的方法
     * @beta
     * @module viewInit
     * @param {Object} extra 外部传递的数据对象
     */
    init: G_NOOP,
    /*#}#*/
    /*
     * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
     * @function
     * @param {String} html 处理的代码片断
     * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
     * @return {String} 处理后的字符串
     * @example
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one(G_HashKey+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         var tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
     *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
     *         tmpl=this.wrapEvent(tmpl);
     *         S.one(G_HashKey+e.currentId).append(tmpl);
     *     }
     * });
     */
    wrapEvent: View_SetEventOwner,
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate: function(id, me) {
        me = this;
        if (me.$s > 0 && me.$p) {
            me.owner.unmountZone(id, 1);
            me.fire('prerender', {
                id: id
            });
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate: function(id, me /*#if(modules.linkage){#*/ , o, f /*#}#*/ ) {
        me = this;
        if (me.$s > 0) {
            id = id || me.id;
            me.fire('rendered', {
                id: id
            });
            /*#if(modules.linkage){#*/
            f = me.$p;
            /*#}#*/
            me.$p = 1;
            /*#if(modules.linkage){#*/
            o = me.owner;
            o.mountZone(id);
            if (!f) {
                setTimeout(me.wrapAsync(function() {
                    Vframe_RunInvokes(o);
                }), 0);
            }
            /*#}else{#*/
            me.owner.mountZone(id);
            /*#}#*/
        }
    },
    /**
     * 包装异步回调
     * @param  {Function} fn 异步回调的function
     * @return {Function}
     * @example
     * render:function(){
     *     setTimeout(this.wrapAsync(function(){
     *         //codes
     *     }),50000);
     * }
     * // 为什么要包装一次？
     * // 在单页应用的情况下，可能异步回调执行时，当前view已经被销毁。
     * // 比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，
     * // 则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。
     * // (该示例中最好的做法是在view销毁时清除setTimeout，
     * // 但有时候你很难控制回调的执行，比如JSONP，所以最好包装一次)
     */
    wrapAsync: function(fn, context) {
        var me = this;
        var sign = me.$s;
        return function() {
            if (sign > 0 && sign == me.$s) {
                if (fn) fn.apply(context || me, arguments);
            }
        };
    },
    /*#if(modules.router){#*/
    /**
     * 监视地址栏中的参数或path，有变动时，才调用当前view的render方法。通常情况下location有变化不会引起当前view的render被调用，所以你需要指定地址栏中哪些参数有变化时才引起render调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String|Object} params  数组字符串
     * @param {Boolean} [isObservePath] 是否监视path
     * @beta
     * @module router
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeLocation('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的render被调用
     *          this.observeLocation(null,true);//关注path的变化
     *          //也可以写成下面的形式
     *          //this.observeLocation('page,rows',true);
     *          //也可以是对象的形式
     *          this.observeLocation({
     *              path: true,
     *              params:['page','rows']
     *          });
     *      },
     *      render:function(){
     *          var loc=Magix.Router.parse();
     *          console.log(loc);//获取地址解析出的对象
     *          var diff=Magix.Router.diff();
     *          console.log(diff);//获取当前地址与上一个地址差异对象
     *      }
     * });
     */
    observeLocation: function(params, isObservePath) {
        var me = this,
            loc;
        loc = me.$l;
        loc.f = 1;
        if (G_IsObject(params)) {
            isObservePath = params.path;
            params = params.params;
        }
        //if (isObservePath) {
        loc.p = isObservePath;
        //}
        if (params) {
            loc.k = (params + G_EMPTY).split(G_COMMA);
        }
    },
    /*#}#*/
    /*#if(modules.state){#*/
    observeState: function(keys) {
        this.$os = (keys + G_EMPTY).split(G_COMMA);
    },
    /*#}#*/
    /*#if(modules.resource){#*/
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} key 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [destroyWhenCalleRender] 调用render方法时是否销毁托管的资源
     * @return {Object} 返回托管的资源
     * @beta
     * @module resource
     * @example
     * View.extend({
     *     render: function(){
     *         var me = this;
     *         var dropdown = new Dropdown();
     *
     *         me.capture('dropdown',dropdown,true);
     *     },
     *     getTest: function(){
     *         var dd = me.capture('dropdown');
     *         console.log(dd);
     *     }
     * });
     */
    capture: function(key, res, destroyWhenCallRender, cache, wrapObj) {
        cache = this.$r;
        if (res) {
            View_DestroyResource(cache, key, 1, res);
            wrapObj = {
                e: res,
                x: destroyWhenCallRender
            };
            cache[key] = wrapObj;
            //service托管检查
            if (DEBUG && res && (res.id + G_EMPTY).indexOf('\x1es') === 0) {
                res.$c = 1;
                if (!destroyWhenCallRender) {
                    console.warn('be careful! May be you should set destroyWhenCallRender = true');
                }
            }
        } else {
            wrapObj = cache[key];
            res = wrapObj && wrapObj.e || res;
        }
        return res;
    },
    /**
     * 释放管理的资源
     * @param  {String} key 托管时的key
     * @param  {Boolean} [destroy] 是否销毁资源
     * @return {Object} 返回托管的资源，无论是否销毁
     * @beta
     * @module resource
     */
    release: function(key, destroy) {
        return View_DestroyResource(this.$r, key, destroy);
    },
    /*#}#*/
    /*#if(modules.tipRouter){#*/
    /**
     * 离开提示实现
     * @param  {String} msg 提示消息
     * @param  {Object} e 事件对象
     */
    //leaveConfirm: function(msg, e) {
    //
    //},
    /**
     * 离开提示
     * @param  {String} msg 提示消息
     * @param  {Function} fn 是否提示的回调
     * @beta
     * @module tipRouter
     * @example
     * var Magix = require('magix');
     * module.exports = Magix.View.extend({
     *     init:function(){
     *         this.leaveTip('页面数据未保存，确认离开吗？',function(){
     *             return true;//true提示，false，不提示
     *         });
     *     }
     * });
     */
    leaveTip: function(msg, fn) {
        var me = this;
        var changeListener = function(e) {
            var flag = 'a', // a for router change
                v = 'b'; // b for viewunload change
            if (e.type != 'change') {
                flag = 'b';
                v = 'a';
            }
            if (changeListener[flag]) {
                e.prevent();
                e.reject();
            } else if (fn()) {
                e.prevent();
                changeListener[v] = 1;
                me.leaveConfirm(msg, function() {
                    changeListener[v] = 0;
                    e.resolve();
                }, function() {
                    changeListener[v] = 0;
                    e.reject();
                });
            } else {
                e.resolve();
            }
        };
        var unloadListener = function(e) {
            if (fn()) {
                e.msg = msg;
            }
        };
        Router.on('change', changeListener);
        Router.on('pageunload', unloadListener);
        me.on('unload', changeListener);
        me.on('destroy', function() {
            Router.off('change', changeListener);
            Router.off('pageunload', unloadListener);
        });
    },
    /*#}#*/
    /*#if(modules.share){#*/
    /**
     * 向子(孙)view公开数据
     * @param  {String} key key
     * @param  {Object} data 数据
     * @beta
     * @module share
     */
    share: function(key, data) {
        var me = this;
        if (!me.$sd) {
            me.$sd = {};
        }
        me.$sd[key] = data;
    },
    /**
     * 获取祖先view上公开的数据
     * @param  {String} key key
     * @return {Object}
     * @beta
     * @module share
     * @example
     * //父view
     * render:function(){
     *     this.share('x',{a:20});
     * }
     * //子view
     * render:function(){
     *     var d=this.getShared('x');
     * }
     */
    getShared: function(key) {
        var me = this;
        var sd = me.$sd;
        var exist;
        if (sd) {
            exist = G_Has(sd, key);
            if (exist) {
                return sd[key];
            }
        }
        var vf = me.owner.parent();
        if (vf) {
            return vf.invoke('getShared', key);
        }
    },
    /*#}#*/
    /**
     * 设置view的html内容
     * @param {String} id 更新节点的id
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    setHTML: function(id, html) {
        var me = this,
            n;
        me.beginUpdate(id);
        if (me.$s > 0) {
            n = G_GetById(id);
            if (n) G_HTML(n, View_SetEventOwner(html, me.id));
        }
        me.endUpdate(id);
    }


    /**
     * 当view调用setHTML刷新前触发
     * @name View#prerender
     * @event
     * @param {Object} e
     * @param {String} e.id 指示哪块区域要进行更新
     */

    /**
     * 每次调用setHTML更新view内容完成后触发
     * @name View#rendered
     * @event
     * @param {Object} e view 完成渲染后触发
     * @param {String} e.id 指示哪块区域完成的渲染
     */

    /**
     * view销毁时触发
     * @name View#destroy
     * @event
     * @param {Object} e
     */

    /**
     * 异步更新ui的方法(render)被调用前触发
     * @name View#rendercall
     * @event
     * @param {Object} e
     */
});
Magix.View = View;