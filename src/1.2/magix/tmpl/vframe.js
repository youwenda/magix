var VframeIdCounter = 1 << 16;
var SafeExec = Magix.tryCall;
var EmptyArr = [];


var Mix = Magix.mix;

var MxConfig = Magix.config();

var TagName;
var TagNameChanged;
var UseQSA;
var ReadMxVframe;
var Selector;
var MxVframe = 'mx-vframe';

var Has = Magix.has;
var SupportContains;
var QSA = 'querySelectorAll';


var Alter = 'alter';
var Created = 'created';
var RootVframe;
var GlobalAlter;

var $ = function(id) {
    return typeof id == 'object' ? id : document.getElementById(id);
};
var $$ = function(id, node, arr) {
    node = $(id);
    if (node) {
        arr = UseQSA ? document[QSA]('#' + IdIt(node) + Selector) : node.getElementsByTagName(TagName);
    }
    return arr || EmptyArr;
};

var IdIt = function(dom) {
    return dom.id || (dom.id = 'magix_vf_' + (VframeIdCounter--));
};


var NodeIn = function(a, b, r) {
    a = $(a);
    b = $(b);
    if (a && b) {
        if (a !== b) {
            try {
                r = SupportContains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) {
                r = 0;
            }
        } else {
            r = 1;
        }
    }
    return r;
};
//var ScriptsReg = /<script[^>]*>[\s\S]*?<\/script>/ig;
var RefLoc, RefChged, RefVOM;
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @borrows Event.once as #once
 * @borrows Event.rely as #rely
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {View} view view对象
 * @property {VOM} owner VOM对象
 * @property {Boolean} viewInited view是否完成初始化，即view的inited事件有没有派发
 * @property {Boolean} viewPrimed view是否完成首次渲染，即view的primed事件有没有派发
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
var Vframe = function(id) {
    var me = this;
    me.id = id;
    //me.vId=id+'_v';
    me.cM = {};
    me.cC = 0;
    me.rC = 0;
    me.sign = 1 << 30;
    me.rM = {};
    me.owner = RefVOM;
    RefVOM.add(id, me);
};
/**
 * 获取根vframe
 * @param {VOM} vom vom对象
 * @param {Object} refLoc 引用的Router解析出来的location对象
 * @param {Object} refChged 引用的URL变化对象
 * @return {Vframe}
 * @private
 */
Vframe.root = function(owner, refLoc, refChged) {
    if (!RootVframe) {
        /*
            尽可能的延迟配置，防止被依赖时，配置信息不正确
        */
        TagName = MxConfig.tagName;
        TagNameChanged = MxConfig['!tnc'];
        UseQSA = TagNameChanged && document[QSA];
        Selector = ' ' + TagName + '[' + MxVframe + '=true]';
        ReadMxVframe = TagNameChanged && !UseQSA;

        var body = document.body;
        SupportContains = body.contains;

        RefLoc = refLoc;
        RefChged = refChged;
        RefVOM = owner;

        var rootId = MxConfig.rootId;
        var e = $(rootId);
        if (!e) {
            e = document.createElement(TagName);
            e.id = rootId;
            body.appendChild(e);
            e = null;
        }
        RootVframe = new Vframe(rootId);
    }
    return RootVframe;
};

Mix(Mix(Vframe.prototype, Event), {
    /**
     * @lends Vframe#
     */
    /**
     * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
     * @return {Boolean}
     * @default false
     * @function
     */
    //useAnimUpdate:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
     * @function
     */
    //oldViewDestroy:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
     * @function
     */
    //prepareNextView:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
     * @function
     */
    //newViewCreated:Magix.noop,
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} viewInitParams 调用view的init方法时传递的参数
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    mountView: function(viewPath, viewInitParams, keepPreHTML) {
        var me = this;
        var node = $(me.id);
        if (!me._a) {
            me._a = 1;
            me._t = node.innerHTML; //.replace(ScriptsReg, '');
        }
        //var useTurnaround=me.viewInited&&me.useAnimUpdate();
        me.unmountView(keepPreHTML);
        me._d = 0;
        if (viewPath) {
            var po = Magix.toObject(viewPath);
            var vn = po.path;
            var sign = --me.sign;
            Magix.use(vn, function(View) {
                if (sign == me.sign) { //有可能在view载入后，vframe已经卸载了

                    BaseView.prepare(View);

                    var view = new View({
                        owner: me,
                        id: me.id,
                        $: $,
                        $c: NodeIn,
                        path: vn,
                        vom: RefVOM,
                        location: RefLoc
                    });
                    me.view = view;
                    var mountZoneVframes = function(e) {
                        me.mountZoneVframes(e.id);
                    };
                    view.on('interact', function(e) { //view准备好后触发
                        if (!e.tmpl) {
                            node.innerHTML = me._t;
                            mountZoneVframes($);
                        }
                        view.on('primed', function() {
                            me.viewPrimed = 1;
                            me.fire('viewMounted');
                        });
                        view.on('rendered', mountZoneVframes);
                        view.on('prerender', function(e) {
                            if (!me.unmountZoneVframes(e.id, e.keep, 1)) {
                                me.cAlter();
                            }
                        });
                    }, 0);
                    viewInitParams = viewInitParams || {};
                    view.load(Mix(viewInitParams, po.params, viewInitParams), RefChged);
                }
            });
        }
    },
    /**
     * 销毁对应的view
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    unmountView: function(keepPreHTML) {
        var me = this;
        var view = me.view;
        if (view) {
            if (!GlobalAlter) {
                GlobalAlter = {};
            }
            me._d = 1;
            me.unmountZoneVframes(0, keepPreHTML, 1);
            me.cAlter(GlobalAlter);

            me.view = 0; //unmountView时，尽可能早的删除vframe上的view对象，防止view销毁时，再调用该 vfrmae的类似unmountZoneVframes方法引起的多次created
            view.oust();

            var node = $(me.id);
            if (node && me._a && !keepPreHTML) {
                node.innerHTML = me._t;
            }

            me.viewInited = 0;
            if (me.viewPrimed) { //viewMounted与viewUnmounted成对出现
                me.viewPrimed = 0;
                me.fire('viewUnmounted');
            }
            GlobalAlter = 0;
        }
        me.sign--;
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} viewInitParams 传递给view init方法的参数
     * @param {Boolean} [cancelTriggerEvent] 是否取消触发alter与created事件，默认false
     * @param  {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @return {Vframe} vframe对象
     * @example
     * //html
     * &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe: function(id, viewPath, viewInitParams, cancelTriggerEvent, keepPreHTML) {
        var me = this;
        //me._p = cancelTriggerEvent;
        if (me.fcc && !cancelTriggerEvent) me.cAlter(); //如果在就绪的vframe上渲染新的vframe，则通知有变化
        //var vom = me.owner;
        var vf = RefVOM.get(id);
        if (!vf) {
            vf = new Vframe(id);

            vf.pId = me.id;

            if (!Has(me.cM, id)) {
                me.cC++;
            }
            me.cM[id] = 1;
        }
        vf._p = cancelTriggerEvent;
        vf.mountView(viewPath, viewInitParams, keepPreHTML);
        return vf;
    },
    /**
     * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @param {Object} viewInitParams 传递给view init方法的参数
     * @param {Boolean} [cancelTriggerEvent] 是否取消触发alter与created事件，默认false
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    mountZoneVframes: function(zoneId, viewInitParams, cancelTriggerEvent, keepPreHTML) {
        var me = this;
        zoneId = zoneId || me.id;
        me.unmountZoneVframes(zoneId, keepPreHTML, 1);

        var vframes = $$(zoneId);
        var count = vframes.length;
        var subs = {};

        if (count) {
            var views = [],
                keys = [];
            for (var i = 0, vframe, key, mxView, mxBuild; i < count; i++) {
                vframe = vframes[i];

                key = IdIt(vframe);
                if (!Has(subs, key)) {
                    mxView = vframe.getAttribute('mx-view');
                    mxBuild = ReadMxVframe ? vframe.getAttribute(MxVframe) : 1;

                    if (mxBuild || mxView) {
                        views.push(mxView);
                        keys.push(key);
                        var svs = $$(vframe);
                        for (var j = 0, c = svs.length, temp; j < c; j++) {
                            temp = svs[j];
                            subs[IdIt(temp)] = 1;
                        }
                    }
                }
            }
            Magix.use(views);
            count = 0;
            while (keys[count]) {
                me.mountVframe(keys[count], views[count++], viewInitParams, cancelTriggerEvent, keepPreHTML);
            }
        }
        //if (me.cC == me.rC) { //有可能在渲染某个vframe时，里面有n个vframes，但立即调用了mountZoneVframes，这个下面没有vframes，所以要等待
        me.cCreated();
        //}
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @param {Boolean} [inner] 内部调用时传递
     */
    unmountVframe: function(id, keepPreHTML, inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        var me = this;
        id = id || me.id;
        //var vom = me.owner;
        var vf = RefVOM.get(id);
        if (vf) {
            var fcc = vf.fcc;
            vf.unmountView(keepPreHTML);
            RefVOM.remove(id, fcc);
            var p = RefVOM.get(vf.pId);
            if (p && Has(p.cM, id)) {
                delete p.cM[id];
                p.cC--;
                if (!inner && !me._d) {
                    p.cCreated();
                }
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId]节点对象或id
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @param {Boolean} [inner] 内部调用时传递，用于判断在这个区域内稍后是否还有vframes渲染，如果有，则为true，否则为false
     */
    unmountZoneVframes: function(zoneId, keepPreHTML, inner) {
        var me = this;
        var hasVframe;
        var p;
        var cm = me.cM;
        for (p in cm) {
            if (!zoneId || NodeIn(p, zoneId)) {
                me.unmountVframe(p, keepPreHTML, hasVframe = 1);
            }
        }
        if (!inner && !me._d) { //已调用父view的unmountView卸载时，子view的不再响应alter与created事件
            me.cCreated();
        }
        return hasVframe;
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} args 参数
     * @return {Object}
     */
    invokeView: function(name, args) {
        var result;
        var vf = this;
        if (vf.viewInited) {
            var view = vf.view;
            var fn = view && view[name];
            if (fn) {
                result = SafeExec(fn, args || EmptyArr, view);
            }
        }
        return result;
    },
    /**
     * 通知所有的子view创建完成
     * @private
     */
    cCreated: function(e) {
        var me = this;
        if (me.cC == me.rC) {
            var view = me.view;
            if (view && !me.fcc) {
                me.fcc = 1;
                me.fca = 0;
                view.fire(Created, e);
                me.fire(Created, e);
            }
            var mId = me.id;
            var p = RefVOM.get(me.pId);
            if (p && !Has(p.rM, mId)) {

                p.rM[mId] = p.cM[mId];
                p.rC++;
                p.cCreated(e);
            }
        }
    },
    /**
     * 通知子vframe有变化
     * @private
     */
    cAlter: function(e) {
        var me = this;
        if (!e) e = {};
        if (!me.fca && me.fcc) { //当前vframe触发过created才可以触发alter事件
            me.fcc = 0;
            var view = me.view;
            var mId = me.id;
            if (view) {
                me.fca = 1;
                view.fire(Alter, e);
                me.fire(Alter, e);
            }
            //var vom = me.owner;
            var p = RefVOM.get(me.pId);
            if (p && Has(p.rM, mId)) {
                p.rC--;
                delete p.rM[mId];
                if (!me._p) {
                    p.cAlter(e);
                }
            }
        }
    },
    /**
     * 通知当前vframe，地址栏发生变化
     * @private
     */
    locChged: function() {
        var me = this;
        var view = me.view;
        if (me.viewInited && view && view.sign > 0) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的window.location.href对象，对于销毁的也不需要广播

            var isChanged = view.olChg(RefChged);
            /**
             * 事件对象
             * @type {Object}
             * @ignore
             */
            var args = {
                location: RefLoc,
                changed: RefChged,
                /**
                 * 阻止向所有的子view传递
                 * @ignore
                 */
                prevent: function() {
                    this.cs = EmptyArr;
                },
                /**
                 * 向特定的子view传递
                 * @param  {Array} c 子view数组
                 * @ignore
                 */
                to: function(c) {
                    //c = c || EmptyArr;
                    if (Magix._s(c)) {
                        c = c.split(',');
                    }
                    this.cs = c || EmptyArr;
                }
            };
            if (isChanged) { //检测view所关注的相应的参数是否发生了变化
                view.render(args);
            }
            var cs = args.cs || Magix.keys(me.cM);
            //console.log(me.id,cs);
            for (var i = 0, j = cs.length, vf; i < j; i++) {
                vf = RefVOM.get(cs[i]);
                if (vf) {
                    vf.locChged();
                }
            }
        }
    }

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

    /**
     * view完成首次渲染(即primed事件触发)后触发
     * @name Vframe#viewMounted
     * @event
     * @param {Object} e
     */

    /**
     * view销毁时触发
     * @name Vframe#viewUnmounted
     * @event
     * @param {Object} e
     */
});

/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有cC(childrenCount)属性和cM(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和rM(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */