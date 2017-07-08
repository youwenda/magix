var Vframe_RootVframe;
var Vframe_GlobalAlter;
var Vframe_NotifyCreated = function(vframe, mId, p) {
    if (!vframe.$d && !vframe.$h && vframe.$cc == vframe.$rc) { //childrenCount === readyCount
        if (!vframe.$cr) { //childrenCreated
            vframe.$cr = 1; //childrenCreated
            vframe.$ca = 0; //childrenAlter
            vframe.fire('created'); //不在view上派发事件，如果view需要绑定，则绑定到owner上，view一般不用该事件，如果需要这样处理：this.owner.oncreated=function(){};this.ondestroy=function(){this.owner.off('created')}
        }
        mId = vframe.id;
        p = Vframe_Vframes[vframe.pId];
        if (p && !G_Has(p.$r, mId)) { //readyChildren
            p.$r[mId] = 1; //readyChildren
            p.$rc++; //readyCount
            Vframe_NotifyCreated(p);
        }
    }
};
var Vframe_NotifyAlter = function(vframe, e, mId, p) {
    if (!vframe.$ca && vframe.$cr) { //childrenAlter childrenCreated 当前vframe触发过created才可以触发alter事件
        vframe.$cr = 0; //childrenCreated
        vframe.$ca = 1; //childreAleter
        vframe.fire('alter', e);
        mId = vframe.id;
        //var vom = vframe.owner;
        p = Vframe_Vframes[vframe.pId];
        if (p && G_Has(p.$r, mId)) { //readyMap
            p.$rc--; //readyCount
            delete p.$r[mId]; //readyMap
            Vframe_NotifyAlter(p, e);
        }
    }
};
/**
 * 获取根vframe;
 * @return {Vframe}
 * @private
 */
var Vframe_Root = function(rootId, e) {
    if (!Vframe_RootVframe) {
        /*
            尽可能的延迟配置，防止被依赖时，配置信息不正确
        */
        G_DOCBODY = G_DOCUMENT.body;

        rootId = Magix_Cfg.rootId;
        e = G_GetById(rootId);
        if (!e) {
            G_DOCBODY.id = rootId;
        }
        Vframe_RootVframe = new Vframe(rootId);
    }
    return Vframe_RootVframe;
};
var Vframe_Vframes = {};


var Vframe_AddVframe = function(id, vf) {
    if (!G_Has(Vframe_Vframes, id)) {
        Vframe_Vframes[id] = vf;
        Vframe.fire('add', {
            vframe: vf
        });
        /*#if(modules.nodeAttachVframe){#*/
        id = G_GetById(id);
        if (id) id.vframe = vf;
        /*#}#*/
    }
};
/*#if(modules.linkage){#*/
var Vframe_RunInvokes = function(vf, list, o) {
    list = vf.$il; //invokeList
    while (list.length) {
        o = list.shift();
        if (!o.r) { //remove
            vf.invoke(o.n, o.a); //name,arguments
        }
        delete list[o.k]; //key
    }
};
/*#}#*/
var Vframe_RemoveVframe = function(id, fcc, vf) {
    vf = Vframe_Vframes[id];
    if (vf) {
        delete Vframe_Vframes[id];
        Vframe.fire('remove', {
            vframe: vf,
            fcc: fcc //fireChildrenCreated
        });
        /*#if(modules.nodeAttachVframe){#*/
        id = G_GetById(id);
        if (id) id.vframe = G_NULL;
        /*#}#*/
    }
};
/*#if(modules.router||modules.state){#*/
var Vframe_UpdateTag;
/**
 * 通知当前vframe，地址栏发生变化
 * @param {Vframe} vframe vframe对象
 * @private
 */
var Vframe_Update = function(vframe, /*#if(modules.state){#*/ stateKeys, /*#}#*/ view) {
    if (vframe && vframe.$g != Vframe_UpdateTag && (view = vframe.$v) && view.$s > 0) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的G_WINDOW.location.href对象，对于销毁的也不需要广播
        /*#if(modules.state&&modules.router){#*/
        var isChanged = stateKeys ? State_IsObserveChanged(view, stateKeys) : View_IsObserveChanged(view);
        /*#}else if(modules.state){#*/
        var isChanged = State_IsObserveChanged(view, stateKeys);
        /*#}else{#*/
        var isChanged = View_IsObserveChanged(view);
        /*#}#*/
        /**
         * 事件对象
         * @type {Object}
         * @ignore
         */
        /*var args = {
                location: RefLoc,
                changed: RefG_LocationChanged,*/
        /**
         * 阻止向所有的子view传递
         * @ignore
         */
        /* prevent: function() {
                    args.cs = EmptyArr;
                },*/
        /**
         * 向特定的子view传递
         * @param  {Array} c 子view数组
         * @ignore
         */
        /*to: function(c) {
                    c = (c + EMPTY).split(COMMA);
                    args.cs = c;
                }
            };*/
        if (isChanged) { //检测view所关注的相应的参数是否发生了变化
            view.render();
        }
        var cs = vframe.children(),
            j = cs.length,
            i = 0;
        //console.log(me.id,cs);
        while (i < j) {
            Vframe_Update(Vframe_Vframes[cs[i++]] /*#if(modules.state){#*/ , stateKeys /*#}#*/ );
        }
    }
};
/**
 * 向vframe通知地址栏发生变化
 * @param {Object} e 事件对象
 * @param {Object} e.location G_WINDOW.location.href解析出来的对象
 * @private
 */
var Vframe_NotifyChange = function(e) {
    var vf = Vframe_Root(),
        view;
    if ((view = e.view)) {
        vf.mountView(view.to);
    } else {
        Vframe_UpdateTag = G_COUNTER++;
        Vframe_Update(vf /*#if(modules.state){#*/ , e.keys /*#}#*/ );
    }
};
/*#}#*/
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {String} path 当前view的路径名，包括参数
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
var Vframe = function(id, pId, me) {
    me = this;
    me.id = id;
    if (DEBUG) {
        setTimeout(function() {
            var parent = Vframe_Vframes[pId];
            if (id != Magix_Cfg.rootId && (!pId || !parent || !parent.$c[id])) {
                console.error('be careful! Avoid use new Magix.Vframe() outside');
            }
        }, 50);
    }
    //me.vId=id+'_v';
    me.$c = {}; //childrenMap
    me.$cc = 0; //childrenCount
    me.$rc = 0; //readyCount
    me.$s = 1; //signature
    me.$r = {}; //readyMap
    /*#if(modules.linkage){#*/
    me.$il = []; //invokeList
    /*#}#*/
    me.pId = pId;
    Vframe_AddVframe(id, me);
};
G_Mix(Vframe, G_Mix({
    /**
     * @lends Vframe
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all: function() {
        return Vframe_Vframes;
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe|undefined} vframe对象
     */
    get: function(id) {
        return Vframe_Vframes[id];
    }
    /**
     * 注册vframe对象时触发
     * @name Vframe.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name Vframe.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     * @param {Boolean} e.fcc 是否派发过created事件
     */
}, Event));

G_Mix(G_Mix(Vframe[G_PROTOTYPE], Event), {
    /**
     * @lends Vframe#
     */
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} [viewInitParams] 调用view的init方法时传递的参数
     */
    mountView: function(viewPath, viewInitParams /*,keepPreHTML*/ ) {
        var me = this;
        var id = me.id;
        var node = G_GetById(id),
            po, sign, view;
        if (!me.$a && node) { //alter
            me.$a = 1;
            me.$t = node.innerHTML; //.replace(ScriptsReg, ''); template
        }
        me.unmountView( /*keepPreHTML*/ );
        me.$d = 0; //destroyed 详见unmountView
        if (node && viewPath) {
            me.path = viewPath;
            po = G_ParseUri(viewPath);
            view = po.path;
            sign = ++me.$s;
            var params = po.params;
            /*#if(modules.updater){#*/
            var pId = me.pId;
            /*#if(modules.mxViewAttr){#*/
            pId = node.getAttribute('mx-datafrom') || pId;
            /*#}#*/
            var parent = Vframe_Vframes[pId],
                p, val;
            parent = parent && parent.$v;
            parent = parent && parent.updater;
            if (parent && viewPath.indexOf(G_SPLITER) > 0) {
                for (p in params) {
                    val = params[p];
                    if (val.charAt(0) == G_SPLITER) {
                        params[p] = parent.get(val);
                    }
                }
            }
            /*#if(modules.mxViewAttr){#*/
            var attrs = node.attributes;
            var capitalize = function(_, c) {
                return c.toUpperCase();
            };
            var vreg = /^[\w_\d]+$/;
            for (var i = attrs.length - 1, attr, name, value; i >= 0; i--) {
                attr = attrs[i];
                name = attr.name;
                value = attr.value;
                if (name.indexOf('view-') === 0) {
                    var key = name.slice(5).replace(/-(\w)/g, capitalize);
                    if (value.slice(0, 3) == '<%@' && value.slice(-2) == '%>') {
                        try {
                            var temp = parent.$data;
                            Tmpl(value, temp);
                            value = temp[G_SPLITER + '1'];
                        } catch (ex) {
                            value = G_Trim(value.slice(3, -2));
                            if (parent && vreg.test(value)) {
                                value = parent.get(value);
                            } else {
                                //Magix_Cfg.error(ex);
                            }
                        }
                    }
                    params[key] = value;
                }
            }
            /*#}#*/
            /*#}#*/
            G_Mix(params, viewInitParams);
            G_Require(view, function(TView) {
                if (sign == me.$s) { //有可能在view载入后，vframe已经卸载了
                    if (!TView) {
                        return Magix_Cfg.error(Error('id:' + id + ' cannot load:' + view));
                    }
                    /*#if(!modules.loader){#*/
                    View_Prepare(TView);
                    /*#}#*/
                    view = new TView({
                        owner: me,
                        id: id
                    }, params);
                    me.$v = view;
                    /*#if(modules.router||modules.state){#*/
                    me.$g = Vframe_UpdateTag;
                    /*#}#*/
                    /*#if(!modules.loader){#*/
                    View_DelegateEvents(view);
                    /*#}#*/
                    /*#if(modules.viewInit){#*/
                    view.init(params);
                    /*#}#*/
                    view.render();
                    /*#if(modules.autoEndUpdate&&!modules.loader){#*/
                    if (!view.$t && !view.$p) {
                        view.endUpdate();
                    }
                    /*#}#*/
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView: function( /*keepPreHTML*/ ) {
        var me = this;
        var view = me.$v,
            node, reset;
        /*#if(modules.linkage){#*/
        me.$il = []; //invokeList 销毁当前view时，连同调用列表一起销毁
        /*#}#*/
        if (view) {
            if (!Vframe_GlobalAlter) {
                reset = 1;
                Vframe_GlobalAlter = {
                    id: me.id
                };
            }
            me.$d = 1; //用于标记当前vframe处于view销毁状态，在当前vframe上再调用unmountZone时不派发created事件
            me.unmountZone(0, 1);
            Vframe_NotifyAlter(me, Vframe_GlobalAlter);

            me.$v = 0; //unmountView时，尽可能早的删除vframe上的view对象，防止view销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            /*#if(!modules.loader){#*/
            if (view.$s > 0) {
                view.$s = 0;
                view.fire('destroy', 0, 1, 1);
                /*#if(modules.resource){#*/
                View_DestroyAllResources(view, 1);
                /*#}#*/
                View_DelegateEvents(view, 1);
            }
            view.$s--;
            view.owner = G_NULL;
            /*#}#*/
            node = G_GetById(me.id);
            if (node && me.$a /*&&!keepPreHTML*/ ) { //如果view本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且view有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即view安装前什么样，销毁后把节点恢复到安装前的情况
                G_HTML(node, me.$t);
            }

            /*if (me.$vPrimed) { //viewMounted与viewUnmounted成对出现
                me.$vPrimed = 0;
                me.fire('viewUnmounted');
            }*/
            if (reset)
                Vframe_GlobalAlter = 0;
        }
        me.$s++; //增加signature，阻止相应的回调，见mountView
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} [viewInitParams] 传递给view init方法的参数
     * @return {Vframe} vframe对象
     * @example
     * // html
     * // &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe: function(id, viewPath, viewInitParams /*, keepPreHTML*/ ) {
        var me = this,
            vf;
        Vframe_NotifyAlter(me, {
            id: id
        }); //如果在就绪的vframe上渲染新的vframe，则通知有变化
        //var vom = me.owner;
        vf = Vframe_Vframes[id];
        if (!vf) {
            if (!G_Has(me.$c, id)) { //childrenMap,当前子vframe不包含这个id
                /*#if(modules.linkage){#*/
                me.$cl = G_EMPTY; //childrenList 清空缓存的子列表
                /*#}#*/
                me.$cc++; //childrenCount ，增加子节点
            }
            me.$c[id] = id; //map
            vf = new Vframe(id, me.id);
        }
        vf.mountView(viewPath, viewInitParams /*,keepPreHTML*/ );
        return vf;
    },
    /**
     * 加载某个区域下的view
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @param {Object} [viewInitParams] 传递给view init方法的参数
     * @example
     * // html
     * // &lt;div id="zone"&gt;
     * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
     * // &lt;/div&gt;
     *
     * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
     */
    mountZone: function(zoneId, viewInitParams /*,keepPreHTML*/ ) {
        var me = this;
        var i, vf, id, vfs = [];
        zoneId = zoneId || me.id;

        var vframes = $(G_HashKey + zoneId + ' [mx-view]');
        /*
            body(#mx-root)
                div(mx-vframe=true,mx-view='xx')
                    div(mx-vframe=true,mx-view=yy)
            这种结构，自动构建父子关系，
            根结点渲染，获取到子列表[div(mx-view=xx)]
                子列表渲染，获取子子列表的子列表
                    加入到忽略标识里
            会导致过多的dom查询

            现在使用的这种，无法处理这样的情况，考虑到项目中几乎没出现过这种情况，先采用高效的写法
            上述情况一般出现在展现型页面，dom结构已经存在，只是附加上js行为
            不过就展现来讲，一般是不会出现嵌套的情况，出现的话，把里面有层级的vframe都挂到body上也未尝不可，比如brix2.0
         */

        me.$h = 1; //hold fire creted
        //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27
        /*#if(modules.collectView){#*/
        var temp = [];
        for (i = vframes.length - 1; i >= 0; i--) {
            vf = vframes[i];
            temp.push(vf.getAttribute('mx-view'));
        }
        G_Require(temp);
        /*#}#*/
        /*#if(modules.layerVframe){#*/
        var subs = {},
            svfs, j, subVf;
        /*#}#*/
        for (i = 0; i < vframes.length; i++) {
            vf = vframes[i];
            id = vf.id || (vf.id = G_Id());
            /*#if(modules.layerVframe){#*/
            if (!G_Has(subs, id)) {
                /*#}#*/
                if (!vf.$m) { //防止嵌套的情况下深层的view被反复实例化
                    vf.$m = 1;
                    vfs.push([id, vf.getAttribute('mx-view')]);
                }
                /*#if(modules.layerVframe){#*/
                svfs = $(G_HashKey + id + ' [mx-view]');
                for (j = svfs.length - 1; j >= 0; j--) {
                    subVf = svfs[j];
                    id = subVf.id || (subVf.id = G_Id());
                    subs[id] = 1;
                }
            }
            /*#}#*/
        }
        while (vfs.length) {
            vf = vfs.shift();
            id = vf[0];
            if (vfs[id]) {
                Magix_Cfg.error(Error('vf.id duplicate:' + id + ' at ' + me.path));
            } else {
                me.mountVframe(vfs[id] = id, vf[1], viewInitParams);
            }
        }
        me.$h = 0;
        Vframe_NotifyCreated(me);
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe: function(id /*,keepPreHTML*/ , inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        var me = this,
            vf, fcc, pId;
        id = id ? me.$c[id] : me.id;
        //var vom = me.owner;
        vf = Vframe_Vframes[id];
        if (vf) {
            fcc = vf.$cr; //childrenCreated
            pId = vf.pId;
            vf.unmountView( /*keepPreHTML*/ );
            Vframe_RemoveVframe(id, fcc);
            vf.id = vf.pId = G_EMPTY; //清除引用,防止被移除的view内部通过setTimeout之类的异步操作有关的界面，影响真正渲染的view
            vf = Vframe_Vframes[pId];
            if (vf && G_Has(vf.$c, id)) { //childrenMap
                delete vf.$c[id]; //childrenMap
                /*#if(modules.linkage){#*/
                vf.$cl = G_EMPTY;
                /*#}#*/
                vf.$cc--; //cildrenCount
                if (!inner) Vframe_NotifyCreated(vf); //移除后通知完成事件
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId]节点对象或id
     */
    unmountZone: function(zoneId, inner) {
        var me = this;
        var p;
        var cm = me.$c;
        for (p in cm) {
            if (!zoneId || (p != zoneId && G_NodeIn(p, zoneId))) {
                me.unmountVframe(p /*,keepPreHTML,*/ , 1);
            }
        }
        if (!inner) Vframe_NotifyCreated(me);
    } /*#if(modules.linkage){#*/ ,
    /**
     * 获取父vframe
     * @param  {Integer} [level] 向上查找层级，默认1,取当前vframe的父级
     * @return {Vframe|undefined}
     * @beta
     * @module linkage
     */
    parent: function(level, vf) {
        vf = this;
        level = (level >>> 0) || 1;
        while (vf && level--) {
            vf = Vframe_Vframes[vf.pId];
        }
        return vf;
    },
    /**
     * 获取当前vframe的所有子vframe的id。返回数组中，vframe在数组中的位置并不固定
     * @return {Array[String]}
     * @beta
     * @module linkage
     * @example
     * var children = view.owner.children();
     * console.log(children);
     */
    children: function(me) {
        me = this;
        return me.$cl || (me.$cl = G_Keys(me.$c)); //排序，获取对象的key在不同的浏览器返回的顺序不一样，我们这里排序一次，强制一样。同时id不存在重复，所以排序后浏览器之间的表现肯定一致。
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} [args] 参数
     * @return {Object}
     * @beta
     * @module linkage
     * @example
     * // html
     * // &lt;div&gt; mx-view="path/to/v1" id="test"&gt;&lt;/div&gt;
     * var vf = Magix.Vframe.get('test');
     * vf.invoke('methodName',['args1','agrs2']);
     */
    invoke: function(name, args) {
        var result;
        var vf = this,
            view, fn, o, list = vf.$il,
            key;
        if ((view = vf.$v) && view.$p) { //view rendered
            result = (fn = view[name]) && G_ToTry(fn, args, view);
        } else {
            o = list[key = G_SPLITER + name];
            if (o) {
                o.r = args == o.a; //参数一样，则忽略上次的
            }
            o = {
                n: name,
                a: args,
                k: key
            };
            list.push(o);
            list[key] = o;
        }
        return result;
    }


    /*#}#*/


    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */
});
Magix.Vframe = Vframe;


/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有$cc(childrenCount)属性和$c(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和$r(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */