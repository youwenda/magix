var View_EvtMethodReg = /^([^<]+)<([^>]+)>$/;
//var View_EvtSelectorReg = /\$(.+)/;
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
var View_DestroyResource = function(cache, key, callDestroy) {
    var o = cache[key],
        fn, res;
    if (o) {
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
    var p /*, e*/ ;
    for (p in events) {
        Body_DOMEventBind(p, destroy);
    }
    // events = me.$el; //eventsList
    // p = events.length;
    // while (p--) {
    //     e = events[p];
    //     Body_DOMEventLibBind(e.h, e.t, e.s && G_HashKey + me.id + ' ' + e.s, Body_DOMGlobalProcessor, destroy, {
    //         v: me,
    //         f: e.f
    //     });
    // }
};
/*#if(modules.fullstyle||modules.style){#*/
// var View_Style_Map;
// var View_Style_Key;
// var View_Style_Reg = /(\.)([\w\-]+)(?=[^\{\}]*?\{)/g;
// var View_Style_Processor = function(m, dot, name) {
//     return dot + (View_Style_Map[name] = View_Style_Key + name);
// };
/*#}#*/
//
//console.log((a=r.responseText).replace(/(\.)([\w\-]+)(?=[^\{\}]*?\{)/g,function(m,k,v){console.log(m);o[v]=v+'0';return k+v+'0'}));
// var View_StyleNameKeyReg = /[^,]+(?=,|$)/g;
// var View_StyleNamePickReg = /(^|\})\s*([^{}]+)(?=\{)/mg;
// var View_StyleCssKeyTemp; //
// var View_StyleCallback = function(m, left, key) {
//     return left + key.replace(View_StyleNameKeyReg, '.' + View_StyleCssKeyTemp + ' $&');
// };
/*#if(modules.viewMerge){#*/
var View_Ctors = [];
/*#}#*/
// var View_Globals = {
//     win: G_WINDOW,
//     doc: G_DOCUMENT
// };
/**
 * 预处理view
 * @param  {View} oView view子类
 * @param  {Vom} vom vom
 */
var View_Prepare = function(oView) {
    if (!oView[G_SPLITER]) { //只处理一次
        oView[G_SPLITER] = 1;
        //oView.extend = me.extend;
        var prop = oView[G_PROTOTYPE],
            old, temp, name, evts, eventsObject = {},
            p;
        /*,eventsList = [],node, p, selector;*/
        for (p in prop) {
            old = prop[p];
            temp = p.match(View_EvtMethodReg);
            if (temp) {
                name = temp[1];
                evts = temp[2];
                evts = evts.split(G_COMMA);
                while ((temp = evts.pop())) {
                    // selector = name.match(View_EvtSelectorReg);
                    // if (selector) {
                    //     name = selector[1];
                    //     node = View_Globals[name];
                    //     eventsList.push({
                    //         f: old,
                    //         s: node ? G_NULL : name,
                    //         t: temp,
                    //         h: node || G_DOCBODY
                    //     });
                    // } else {
                    eventsObject[temp] = 1;
                    prop[name + G_SPLITER + temp] = old;
                    //}
                }
            }
        }
        View_WrapRender(prop);
        prop.$eo = eventsObject;
        //prop.$el = eventsList;
        /*#if(modules.fullstyle||modules.style){#*/
        //css = prop.css;
        /*
            view上添加的style样式字符串，经magix处理后，会变成一个name映射对象，在页面上使用时，使用style.name来获取处理后的class名称
         */
        // if (css) {
        //     prop.cssNames = View_Style_Map = {};
        //     View_Style_Key = oView.$k;
        //     oView.$c = css.replace(View_Style_Reg, View_Style_Processor);
        // }
        /*#}#*/
    }
};
/*#if(modules.router){#*/
var View_IsObsveChanged = function(view) {
    var loc = view.$l;
    var res;
    if (loc.f) {
        if (loc.p) {
            res = Router_LastChanged.path;
        }
        if (!res) {
            res = Router_LastChanged.isParam(loc.k);
        }
        // if (res && loc.c) {
        //     loc.c.call(view);
        // }
    }
    return res;
};
/*#}#*/
var View_Oust = function(view) {
    if (view.$s > 0) {
        view.$s = 0;
        view.fire('destroy', 0, 1, 1);
        /*#if(modules.resource){#*/
        View_DestroyAllResources(view, 1);
        /*#}#*/
        View_DelegateEvents(view, 1);
    }
    view.$s--;
};
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
 * 关于事件:
 * 示例：
 *   html写法：
 *
 *   &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 *   &lt;a href="http://etao.com" mx-click="test({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 *   view写法：
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
     *     var Magix=require('magix');
     *     Magix.View.merge({
     *         ctor:function(){
     *             this.$attr='test';
     *         },
     *         test:function(){
     *             alert(this.$attr);
     *         }
     *     });
     * });
     * //加入Magix.start的exts中
     *
     *  Magix.start({
     *      //...
     *      exts:['app/tview']
     *
     *  });
     *
     * //这样完成后，所有的view对象都会有一个$attr属性和test方法
     * //当前上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
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
     * @param  {Object} [statics] 静态对象或方法
     */
    extend: function(props, statics) {
        var me = this;
        props = props || {};
        var ctor = props.ctor;
        var NView = function(a, b) {
            me.call(this, a, b);
            if (ctor) ctor.call(this, b);
        };
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
    init: G_NOOP,
    /*#}#*/
    /*#if(modules.viewRelate){#*/
    relate: function(node) {
        var id = node.id || (node.id = G_Id());
        var me = this;
        Body_ViewRelateInfo[id] = me.owner;
        me.on('destroy', function() {
            delete Body_ViewRelateInfo[id];
        });
    },
    /*#}#*/
    // *
    //  * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
    //  * @function
    //  * @param {String} html 处理的代码片断
    //  * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
    //  * @return {String} 处理后的字符串
    //  * @example
    //  * View.extend({
    //  *     'del&lt;click&gt;':function(e){
    //  *         S.one(G_HashKey+e.currentId).remove();
    //  *     },
    //  *     'addNode&lt;click&gt;':function(e){
    //  *         var tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
    //  *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
    //  *         tmpl=this.wrapEvent(tmpl);
    //  *         S.one(G_HashKey+e.currentId).append(tmpl);
    //  *     }
    //  * });
    //  * //注意，只有动态添加的节点才需要处理

    // wrapEvent: function(html) {
    //     return (html + G_EMPTY).replace(View_MxEvt, '$&' + this.id + G_SPLITER);
    // },
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate: function(id, me) {
        me = this;
        if (me.$s > 0 && me.$p) {
            me.owner.unmountZone(id, 1);
            // me.fire('prerender', {
            //     id: id
            // });
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate: function(id, me /*#if(modules.linkage){#*/ , o, f /*#}#*/ ) {
        me = this;
        if (me.$s > 0) {
            // me.fire('rendered', {
            //     id: id
            // });
            /*#if(modules.linkage){#*/
            f = me.$p;
            /*#}#*/
            me.$p = 1;
            /*#if(modules.linkage){#*/
            o = me.owner;
            o.mountZone(id);
            if (!f) Vframe_RunInvokes(o);
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
     * //为什么要包装一次？
     * //Magix是单页应用，有可能异步回调执行时，当前view已经被销毁。比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。(该示例中最好的做法是在view销毁时清除setTimeout，但有时候你很难控制回调的执行，所以最好包装一次)
     * //
     * //
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
     * @param {Array|String} params  数组字符串
     * @param {Boolean} isObservePath 是否监视path
     * @beta
     * @module router
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observe('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的render被调用
     *          this.observe(null,true);//关注path的变化
     *          //也可以写成下面的形式
     *          //this.observe('page,rows',true);
     *      },
     *      render:function(){
     *          var loc=Magix.Router.parse();
     *          console.log(loc);//获取地址解析出的对象
     *          var diff=Magix.Router.diff();
     *          console.log(diff);//获取当前地址与上一个地址差异对象
     *      }
     * });
     */
    observe: function(params, isObservePath /*, changedCallback*/ ) {
        var me = this,
            loc, keys;
        loc = me.$l;
        loc.f = 1;
        keys = loc.k;
        if (isObservePath) {
            loc.p = isObservePath;
        }
        if (params) {
            loc.k = keys.concat((params + G_EMPTY).split(G_COMMA));
        }
        // if (changedCallback) {
        //     loc.c = changedCallback;
        // }
    },
    /*#}#*/
    /*#if(modules.resource){#*/
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} key 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} destroyWhenCalleRender 调用render方法时是否销毁托管的资源
     * @return {Object} 返回托管的资源
     * @beta
     * @module resource
     * @example
     * View.extend({
     *     ctor:function(){
     *     },
     *     render:function(){
     *         var me=this;
     *         var dropdown=new Dropdown();
     *
     *         me.capture('dropdown',dropdown,true);
     *     }
     * });
     */
    capture: function(key, res, destroyWhenCallRender, cache, wrapObj) {
        cache = this.$r;
        View_DestroyResource(cache, key, 1);
        wrapObj = {
            e: res,
            x: destroyWhenCallRender
        };
        cache[key] = wrapObj;
        return res;
    },
    /**
     * 释放管理的资源
     * @param  {String} key 托管时的key
     * @param  {Boolean} destroy 是否销毁资源
     * @return {Object} 返回托管的资源，无论是否销毁
     * @beta
     * @module resource
     */
    release: function(key, destroy) {
        return View_DestroyResource(this.$r, key, destroy);
    },
    /*#}#*/
    /*#if(modules.tiprouter){#*/
    /**
     * 离开提示
     * @param  {String} msg 提示消息
     * @param  {Function} fn 是否提示的回调
     * @beta
     * @module tiprouter
     */
    leaveTip: function(msg, fn) {
        var me = this;
        var changeListener = function(e) {
            e.prevent();
            if (!me.$tipped) {
                if (fn.call(me)) { //firefox的confirm可以同时有多个
                    me.$tipped = true;
                    if (window.confirm(msg)) {
                        me.$tipped = false;
                        e.forward();
                    } else {
                        me.$tipped = false;
                        e.backward();
                    }
                } else {
                    e.forward();
                }
            }
        };
        var unloadListener = function(e) {
            if (fn.call(me)) {
                e.msg = msg;
            }
        };
        Router.on('change', changeListener);
        Router.on('pageunload', unloadListener);
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
            if (n) G_HTML(n, html);
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