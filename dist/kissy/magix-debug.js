//#exclude(define,before);
/*!3.7.0 Licensed MIT*/
/*
author:kooboy_li@163.com
loader:kissy
enables:style,viewInit,service,ceach,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updater,updaterSetState,viewProtoMixins,base,defaultView,autoEndUpdate,linkage,state,updateTitleRouter,urlRewriteRouter

optionals:updaterIncrement,serviceCombine,tipLockUrlRouter,edgeRouter,forceEdgeRouter,cnum,collectView,layerVframe,share,mxViewAttr,keepHTML,eventShortCtrl,eventEnterLeave
*/
/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version edge
 **/
KISSY.add('magix', function(S, SE, DOM) {
    if (typeof DEBUG == 'undefined') DEBUG = true;

    var G_NOOP = S.noop;
    var $ = S.all;
    var G_IsObject = S.isObject;
    var G_IsArray = S.isArray;
    var G_COUNTER = 0;
var G_EMPTY = '';
var G_EMPTY_ARRAY = [];
var G_Slice = G_EMPTY_ARRAY.slice;
var G_COMMA = ',';
var G_NULL = null;
var G_WINDOW = window;
var G_DOCUMENT = document;
var G_DOC = $(G_DOCUMENT);
var G_HashKey = '#';

var JSONStringify = JSON.stringify;

var G_DOCBODY; //initilize at vframe_root
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
var G_SPLITER = '\x1e';
var Magix_StrObject = 'object';
var G_PROTOTYPE = 'prototype';
var G_PARAMS = 'params';
var G_PATH = 'path';
// var Magix_PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
// var Magix_PathTrimFileReg = /\/[^\/]*$/;
// var Magix_ProtocalReg = /^(?:https?:)?\/\//i;
var Magix_PathTrimParamsReg = /[#?].*$/;
var Magix_ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
var Magix_IsParam = /(?!^)=|&/;
var G_Id = function (prefix) {
    return (prefix || 'mx_') + G_COUNTER++;
};

var MxGlobalView = G_Id();

var Magix_Cfg = {
    rootId: G_Id(),
    
    defaultView: MxGlobalView,
    
    error: function (e) {
        throw e;
    }
};
var Magix_HasProp = Magix_Cfg.hasOwnProperty;

var G_GetById = function (id) {
    return typeof id == Magix_StrObject ? id : G_DOCUMENT.getElementById(id);
};

var G_IsPrimitive = function (args) {
    return !args || typeof args != Magix_StrObject;
};
var G_Set = function (newData, oldData, keys) {
    var changed = 0,
        now, old, p;
    for (p in newData) {
        now = newData[p];
        old = oldData[p];
        if (!G_IsPrimitive(now) || old != now) {
            keys[p] = 1;
            changed = 1;
        }
        oldData[p] = now;
    }
    return changed;
};

var G_NodeIn = function (a, b, r) {
    a = G_GetById(a);
    b = G_GetById(b);
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = b.contains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) { }
        }
    }
    return r;
};
var G_Mix = Object.assign || function (aim, src, p) {
    for (p in src) {
        aim[p] = src[p];
    }
    return aim;
};

var View_ApplyStyle = function (key, css) {
    if (css && !View_ApplyStyle[key]) {
        View_ApplyStyle[key] = 1;
        $('head').append('<style>' + css + '</style>');
    }
};


var G_ToTry = function (fns, args, context, i, r, e) {
    args = args || G_EMPTY_ARRAY;
    if (!G_IsArray(fns)) fns = [fns];
    if (!G_IsArray(args)) args = [args];
    for (i = 0; i < fns.length; i++) {
        e = fns[i];
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Magix_Cfg.error(x);
        }
    }
    return r;
};

var G_Has = function (owner, prop) {
    return owner && Magix_HasProp.call(owner, prop); //false 0 G_NULL '' undefined
};

var GSet_Params = function (updater, oldParams, newParams) {
    var p, val;
    for (p in oldParams) {
        val = oldParams[p];
        newParams[p] = (val + G_EMPTY).charAt(0) == G_SPLITER ? updater.get(val) : val;
    }
};

    var Magix_CacheSort = function (a, b) {
    return  b.f - a.f || b.t - a.t;
};
/**
 * Magix.Cache 类
 * @name Cache
 * @constructor
 * @param {Integer} [max] 缓存最大值，默认20
 * @param {Integer} [buffer] 缓冲区大小，默认5
 * @param {Function} [remove] 当缓存的元素被删除时调用
 * @example
 * var c = new Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
 * c.set('key1',{});//缓存
 * c.get('key1');//获取
 * c.del('key1');//删除
 * c.has('key1');//判断
 * //注意：缓存通常配合其它方法使用，在Magix中，对路径的解析等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
 */
var G_Cache = function (max, buffer, remove, me) {
    me = this;
    me.c = [];
    me.b = buffer | 0 || 5; //buffer先取整，如果为0则再默认5
    me.x = me.b + (max || 20);
    me.r = remove;
};

G_Mix(G_Cache[G_PROTOTYPE], {
    /**
     * @lends Cache#
     */
    /**
     * 获取缓存的值
     * @param  {String} key
     * @return {Object} 初始设置的缓存对象
     */
    get: function (key) {
        var me = this;
        var c = me.c;
        var r = c[G_SPLITER + key];
        if (r) {
            r.f++;
            r.t = G_COUNTER++;
            //console.log(r.f);
            r = r.v;
            //console.log('hit cache:'+key);
        }
        return r;
    },
    
    
    /**
     * 循环缓存
     * @param  {Function} cb 回调
     * @param  {Object} [ops] 回调时传递的额外参数
     * @beta
     * @module ceach|service
     */
    each: function (cb, ops, me, c, i) {
        me = this;
        c = me.c;
        for (i = c.length; i--;) {
            cb(c[i].v, ops, me);
        }
    },
    
    /**
     * 设置缓存
     * @param {String} key 缓存的key
     * @param {Object} value 缓存的对象
     */
    set: function (okey, value) {
        var me = this;
        var c = me.c;

        var key = G_SPLITER + okey;
        var r = c[key];
        var t = me.b,
            f;
        if (!r) {
            if (c.length >= me.x) {
                c.sort(Magix_CacheSort);
                while (t--) {
                    
                    r = c.pop();
                    
                    //为什么要判断r.f>0,考虑这样的情况：用户设置a,b，主动删除了a,重新设置a,数组中的a原来指向的对象残留在列表里，当排序删除时，如果不判断则会把新设置的删除，因为key都是a
                    //
                    if (r.f > 0) me.del(r.o); //如果没有引用，则删除
                    
                }
                
            }
            r = {
                
                o: okey
            };
            c.push(r);
            c[key] = r;
        }
        r.v = value;
        r.f = 1;
        r.t = G_COUNTER++;
    },
    /**
     * 删除缓存
     * @param  {String} key 缓存key
     */
    del: function (k) {
        k = G_SPLITER + k;
        var c = this.c;
        var r = c[k],
            m = this.r;
        if (r) {
            r.f = -1;
            r.v = G_EMPTY;
            delete c[k];
            if (m) {
                G_ToTry(m, r.o);
            }
        }
    },
    /**
     * 检测缓存中是否有给定的key
     * @param  {String} key 缓存key
     * @return {Boolean}
     */
    has: function (k) {
        return G_Has(this.c, G_SPLITER + k);
    }
});
    var G_Require = function(name, fn) {
        S.use(name && (name + G_EMPTY), function(S) {
            if (fn) {
                fn.apply(S, G_Slice.call(arguments, 1));
            }
        });
    };
    var G_Define = function(mId, value) {
        S.add(mId, function() {
            return value;
        });
    };
    var G_Extend = S.extend;
    var G_HTML = function(node, html, vId) {
        G_DOC.fireHandler('htmlchange', {
            vId: vId
        });
        S.one(node).html(html);
        G_DOC.fireHandler('htmlchanged', {
            vId: vId
        });
    };
    var G_TargetMatchSelector = DOM.test;
    var G_DOMGlobalProcessor = function(e, d) {
        d = this;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    
    var G_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            SE[(remove ? 'un' : G_EMPTY) + 'delegate'](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : Event_ON](node, type, cb, scope);
        }
    };
    

    if (DEBUG) {
    if (window.Proxy) {
        var Safeguard = function(data, allows, getter, setter) {
            var build = function(prefix, o) {
                if (o['\x1e_sf_\x1e']) {
                    return o;
                }
                return new Proxy(o, {
                    set: function(target, property, value) {
                        if (!setter &&
                            !G_Has(allows, property) &&
                            (!prefix || !G_Has(allows, prefix.slice(0, -1)))) {
                            setTimeout(function() {
                                throw new Error('avoid writeback,key: ' + prefix + property + ' value:' + value + ' more info: https://github.com/thx/magix/issues/38');
                            }, 0);
                        }
                        target[property] = value;
                        if (setter) {
                            setter(prefix + property, value);
                        }
                        return true;
                    },
                    get: function(target, property) {
                        if (property == '\x1e_sf_\x1e') {
                            return true;
                        }
                        var out = target[property];
                        if (!prefix && getter) {
                            getter(property);
                        }
                        if (G_Has(target, property) && (G_IsArray(out) || G_IsObject(out))) {
                            return build(prefix + property + '.', out);
                        }
                        return out;
                    }
                });
            };
            if (G_IsPrimitive(data)) {
                return data;
            }
            return build('', data);
        };
    } else {
        var Safeguard = function(data) {
            return data;
        };
    }
}
    var Magix_PathToObjCache = new G_Cache();
//var Magix_PathCache = new G_Cache();
var Magix_ParamsObjectTemp;
var Magix_ParamsFn = function(match, name, value) {
    try {
        value = decodeURIComponent(value);
    } catch (e) {

    }
    Magix_ParamsObjectTemp[name] = value;
};
/**
 * 路径
 * @param  {String} url  参考地址
 * @param  {String} part 相对参考地址的片断
 * @return {String}
 * @example
 * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
 * //g.cn/a.html
 */
/*var G_Path = function(url, part) {
    var key = url + G_SPLITER + part;
    var result = Magix_PathCache.get(key),
        domain = G_EMPTY,
        idx;
    if (!Magix_PathCache.has(key)) { //有可能结果为空，url='' path='';
        var m = url.match(Magix_ProtocalReg);
        if (m) {
            idx = url.indexOf(Magix_SLASH, m[0].length);
            if (idx < 0) idx = url.length;
            domain = url.slice(0, idx);
            url = url.slice(idx);
        }
        url = url.replace(Magix_PathTrimParamsReg, G_EMPTY).replace(Magix_PathTrimFileReg, Magix_SLASH);
        if (!part.indexOf(Magix_SLASH)) {
            url = G_EMPTY;
        }
        result = url + part;
        console.log('url', url, 'part', part, 'result', result);
        while (Magix_PathRelativeReg.test(result)) {
            result = result.replace(Magix_PathRelativeReg, Magix_SLASH);
        }
        Magix_PathCache.set(key, result = domain + result);
    }
    return result;
};*/

/**
 * 把路径字符串转换成对象
 * @param  {String} path 路径字符串
 * @return {Object} 解析后的对象
 * @example
 * var obj = Magix.parseUri('/xxx/?a=b&c=d');
 * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
 */
var G_ParseUri = function(path) {
    //把形如 /xxx/?a=b&c=d 转换成对象 {path:'/xxx/',params:{a:'b',c:'d'}}
    //1. /xxx/a.b.c.html?a=b&c=d  path /xxx/a.b.c.html
    //2. /xxx/?a=b&c=d  path /xxx/
    //3. /xxx/#?a=b => path /xxx/
    //4. /xxx/index.html# => path /xxx/index.html
    //5. /xxx/index.html  => path /xxx/index.html
    //6. /xxx/#           => path /xxx/
    //7. a=b&c=d          => path ''
    //8. /s?src=b#        => path /s params:{src:'b'}
    //9. a=YT3O0sPH1No=   => path '' params:{a:'YT3O0sPH1No='}
    //10.a=YT3O0sPH1No===&b=c => path '' params:{a:'YT3O0sPH1No===',b:'c'}
    //11. ab?a&b          => path ab  params:{a:'',b:''}
    //12. a=b&c           => path '' params:{a:'b',c:''}
    //13. =abc            => path '=abc'
    //14. ab=             => path '' params:{ab:''}
    //15. a&b             => path '' params:{a:'',b:''}
    var r = Magix_PathToObjCache.get(path),
        pathname;
    if (!r) {
        Magix_ParamsObjectTemp = {};
        pathname = path.replace(Magix_PathTrimParamsReg, G_EMPTY);
        if (path == pathname && Magix_IsParam.test(pathname)) pathname = G_EMPTY; //考虑 YT3O0sPH1No= base64后的pathname
        path.replace(pathname, G_EMPTY).replace(Magix_ParamsReg, Magix_ParamsFn);
        Magix_PathToObjCache.set(path, r = {
            a: pathname,
            b: Magix_ParamsObjectTemp
        });
    }
    return {
        path: r.a,
        params: G_Mix({}, r.b)
    };
};
/**
 * 转换成字符串路径
 * @param  {String} path 路径
 * @param {Object} params 参数对象
 * @param {Object} [keo] 保留空白值的对象
 * @return {String} 字符串路径
 * @example
 * var str = Magix.toUri('/xxx/',{a:'b',c:'d'});
 * // str == /xxx/?a=b&c=d
 *
 * var str = Magix.toUri('/xxx/',{a:'',c:2});
 *
 * // str == /xxx/?a=&c=2
 *
 * var str = Magix.toUri('/xxx/',{a:'',c:2},{c:1});
 *
 * // str == /xxx/?c=2
 * var str = Magix.toUri('/xxx/',{a:'',c:2},{a:1,c:1});
 *
 * // str == /xxx/?a=&c=2
 */
var G_ToUri = function(path, params, keo) {
    var arr = [];
    var v, p, f;
    for (p in params) {
        v = params[p] + G_EMPTY;
        if (!keo || v || G_Has(keo, p)) {
            v = encodeURIComponent(v);
            arr.push(f = p + '=' + v);
        }
    }
    if (f) {
        path += (path && (~path.indexOf('?') ? '&' : '?')) + arr.join('&');
    }
    return path;
};
var G_ToMap = function(list, key) {
    var i, e, map = {},
        l;
    if (list && (l = list.length)) {
        for (i = 0; i < l; i++) {
            e = list[i];
            map[(key && e) ? e[key] : e] = key ? e : (map[e] | 0) + 1; //对于简单数组，采用累加的方式，以方便知道有多少个相同的元素
        }
    }
    return map;
};
var G_Keys = Object.keys || function(obj, keys, p) {
    keys = [];
    for (p in obj) {
        if (G_Has(obj, p)) {
            keys.push(p);
        }
    }
    return keys;
};
/**
 * Magix对象，提供常用方法
 * @name Magix
 * @namespace
 */
var Magix = {
    /**
     * @lends Magix
     */
    /**
     * 设置或获取配置信息
     * @param  {Object} cfg 初始化配置参数对象
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPath 当无法从地址栏取到path时的默认值。比如使用hash保存路由信息，而初始进入时并没有hash,此时defaultPath会起作用
     * @param {Object} cfg.routes path与view映射关系表
     * @param {String} cfg.unmatchView 在routes里找不到匹配时使用的view，比如显示404
     * @param {String} cfg.rootId 根view的id
     * @param {Array} cfg.exts 需要加载的扩展
     * @param {Function} cfg.error 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
     * @example
     * Magix.config({
     *      rootId:'J_app_main',
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPath:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     *
     *
     * var config = Magix.config();
     *
     * console.log(config.rootId);
     *
     * // 可以多次调用该方法，除内置的配置项外，您也可以缓存一些数据，如
     * Magix.config({
     *     user:'彳刂'
     * });
     *
     * console.log(Magix.config('user'));
     */
    config: function(cfg, r) {
        r = Magix_Cfg;
        if (cfg) {
            if (G_IsObject(cfg)) {
                r = G_Mix(r, cfg);
            } else {
                r = r[cfg];
            }
        }
        return r;
    },

    /**
     * 应用初始化入口
     * @function
     * @param {Object} [cfg] 配置信息对象,更多信息请参考Magix.config方法
     * @return {Object} 配置信息对象
     * @example
     * Magix.boot({
     *      rootId:'J_app_main'
     * });
     *
     */
    
    boot: function(cfg) {
        G_Mix(Magix_Cfg, cfg); //先放到配置信息中，供ini文件中使用
        
        G_Require(Magix_Cfg.ini, function(I) {
            G_Mix(Magix_Cfg, I);
            G_Mix(Magix_Cfg, cfg);
            
            G_Require(Magix_Cfg.exts, function() {
                Router.on('changed', Vframe_NotifyChange);
                
                State.on('changed', Vframe_NotifyChange);
                
                Router_Bind();
            });
            
        });
        
    },
    
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} [key]  以数组中对象的哪个key的value做为hash的key
     * @return {Object}
     * @example
     * var map = Magix.toMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * var map = Magix.toMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     *
     * console.log(map['30']);//=> {id:30}
     * //转成对象后不需要每次都遍历数组查询
     */
    toMap: G_ToMap,
    /**
     * 以try cache方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} [args]    参数数组
     * @param  {Object} [context] 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
     * @example
     * var result = Magix.toTry(function(){
     *     return true
     * });
     *
     * // result == true
     *
     * var result = Magix.toTry(function(){
     *     throw new Error('test');
     * });
     *
     * // result == undefined
     *
     * var result = Magix.toTry([function(){
     *     throw new Error('test');
     * },function(){
     *     return true;
     * }]);
     *
     * // result == true
     *
     * //异常的方法执行时，可以通过Magix.config中的error来捕获，如
     *
     * Magix.config({
     *     error:function(e){
     *         console.log(e);//在这里可以进行错误上报
     *     }
     * });
     *
     * var result = Magix.toTry(function(a1,a2){
     *     return a1 + a2;
     * },[1,2]);
     *
     * // result == 3
     * var o={
     *     title:'test'
     * };
     * var result = Magix.toTry(function(){
     *     return this.title;
     * },null,o);
     *
     * // result == 'test'
     */
    toTry: G_ToTry,
    /**
     * 转换成字符串路径
     * @function
     * @param  {String} path 路径
     * @param {Object} params 参数对象
     * @param {Object} [keo] 保留空白值的对象
     * @return {String} 字符串路径
     * @example
     * var str = Magix.toUrl('/xxx/',{a:'b',c:'d'});
     * // str == /xxx/?a=b&c=d
     *
     * var str = Magix.toUrl('/xxx/',{a:'',c:2});
     *
     * // str==/xxx/?a=&c=2
     *
     * var str = Magix.toUrl('/xxx/',{a:'',c:2},{c:1});
     *
     * // str == /xxx/?c=2
     * var str = Magix.toUrl('/xxx/',{a:'',c:2},{a:1,c:1});
     *
     * // str == /xxx/?a=&c=2
     */
    toUrl: G_ToUri,
    /**
     * 把路径字符串转换成对象
     * @function
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * var obj = Magix.parseUrl('/xxx/?a=b&c=d');
     * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
     */
    parseUrl: G_ParseUri,
    /*
     * 路径
     * @function
     * @param  {String} url  参考地址
     * @param  {String} part 相对参考地址的片断
     * @return {String}
     * @example
     * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
     */
    //path: G_Path,
    /**
     * 把src对象的值混入到aim对象上
     * @function
     * @param  {Object} aim    要mix的目标对象
     * @param  {Object} src    mix的来源对象
     * @example
     * var o1={
     *     a:10
     * };
     * var o2={
     *     b:20,
     *     c:30
     * };
     *
     * Magix.mix(o1,o2);//{a:10,b:20,c:30}
     *
     *
     * @return {Object}
     */
    mix: G_Mix,
    /**
     * 检测某个对象是否拥有某个属性
     * @function
     * @param  {Object}  owner 检测对象
     * @param  {String}  prop  属性
     * @example
     * var obj={
     *     key1:undefined,
     *     key2:0
     * }
     *
     * Magix.has(obj,'key1');//true
     * Magix.has(obj,'key2');//true
     * Magix.has(obj,'key3');//false
     *
     *
     * @return {Boolean} 是否拥有prop属性
     */
    has: G_Has,
    /**
     * 获取对象的keys
     * @param {Object} object 获取key的对象
     * @type {Array}
     * @beta
     * @module linkage|router
     * @example
     * var o = {
     *     a:1,
     *     b:2,
     *     test:3
     * };
     * var keys = Magix.keys(o);
     *
     * // keys == ['a','b','test']
     * @return {Array}
     */
    keys: G_Keys,
    /**
     * 判断一个节点是否在另外一个节点内，如果比较的2个节点是同一个节点，也返回true
     * @function
     * @param {String|HTMLElement} node节点或节点id
     * @param {String|HTMLElement} container 容器
     * @example
     * var root = $('html');
     * var body = $('body');
     *
     * var r = Magix.inside(body[0],root[0]);
     *
     * // r == true
     *
     * var r = Magix.inside(root[0],body[0]);
     *
     * // r == false
     *
     * var r = Magix.inside(root[0],root[0]);
     *
     * // r == true
     *
     * @return {Boolean}
     */
    inside: G_NodeIn,
    /**
     * document.getElementById的简写
     * @param {String} id
     * @return {HTMLElement|Null}
     * @example
     * // html
     * // <div id="root"></div>
     *
     * var node = Magix.node('root');
     *
     * // node => div[id='root']
     *
     * // node是document.getElementById的简写
     */
    node: G_GetById,
    
    /**
     * 应用样式
     * @beta
     * @module style
     * @param {String} prefix 样式的名称前缀
     * @param {String} css 样式字符串
     * @example
     * // 该方法配合magix-combine工具使用
     * // 更多信息可参考magix-combine工具：https://github.com/thx/magix-combine
     * // 样式问题可查阅这里：https://github.com/thx/magix-combine/issues/6
     *
     */
    applyStyle: View_ApplyStyle,
    
    /**
     * 返回全局唯一ID
     * @function
     * @param {String} [prefix] 前缀
     * @return {String}
     * @example
     *
     * var id = Magix.guid('mx-');
     * // id maybe mx-7
     */
    guid: G_Id,
    Cache: G_Cache,
    /**
     * 获取模块，调用如requirejs或seajs的require的实现
     * @function
     */
    use: G_Require,
    /**
     * 定义一个模块
     * @param {string} moduleId 模块id
     * @param {any} value 值
     */
    define: G_Define
};
    /**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event_ON = 'on';
var Event = {
    /**
     * @lends Event
     */
    /**
     * 触发事件
     * @param {String} name 事件名称
     * @param {Object} data 事件对象
     * @param {Boolean} [remove] 事件触发完成后是否移除这个事件的所有监听
     * @param {Boolean} [lastToFirst] 是否从后向前触发事件的监听列表
     */
    fire: function (name, data, remove, lastToFirst) {
        var key = G_SPLITER + name,
            me = this,
            list = me[key],
            end, len, idx, t;
        if (!data) data = {};
        if (!data.type) data.type = name;
        if (list) {
            end = list.length;
            len = end - 1;
            while (end--) {
                idx = lastToFirst ? end : len - end;
                t = list[idx];
                if (t.f) {
                    t.x = 1;
                    G_ToTry(t.f, data, me);
                    t.x = G_EMPTY;
                } else if (!t.x) {
                    list.splice(idx, 1);
                    len--;
                }
            }
        }
        list = me[Event_ON + name];
        if (list) G_ToTry(list, data, me);
        if (remove) me.off(name);
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件处理函数
     * @example
     * var T = Magix.mix({},Magix.Event);
     * T.on('done',function(e){
     *     alert(1);
     * });
     * T.on('done',function(e){
     *     alert(2);
     *     T.off('done',arguments.callee);
     * });

     * T.fire('done',{data:'test'});
     * T.fire('done',{data:'test2'});
     */
    on: function (name, fn) {
        var me = this;
        var key = G_SPLITER + name;
        var list = me[key] || (me[key] = []);
        list.push({
            f: fn
        });
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} [fn] 事件处理函数
     */
    off: function (name, fn) {
        var key = G_SPLITER + name,
            me = this,
            list = me[key],
            i, t;
        if (fn) {
            if (list) {
                i = list.length;
                while (i--) {
                    t = list[i];
                    if (t.f == fn) {
                        t.f = G_EMPTY;
                        break;
                    }
                }
            }
        } else {
            delete me[key];
            delete me[Event_ON + name];
        }
    }
};
Magix.Event = Event;
    
    var State_AppData = {};
var State_AppDataKeyRef = {};
var State_ChangedKeys = {};
var State_DataIsChanged = 0;

if (DEBUG) {
    var State_DataWhereSet = {};
}

var State_IsObserveChanged = function(view, keys, r) {
    var oKeys = view.$os;
    if (oKeys) {
        for (var i = oKeys.length; i--;) {
            var ok = oKeys[i];
            r = G_Has(keys, ok);
            if (r) break;
        }
    }
    return r;
};
var SetupKeysRef = function(keys) {
    keys = (keys + G_EMPTY).split(',');
    for (var i = 0, key; i < keys.length; i++) {
        key = keys[i];
        if (G_Has(State_AppDataKeyRef, key)) {
            State_AppDataKeyRef[key]++;
        } else {
            State_AppDataKeyRef[key] = 1;
        }
    }
    return keys;
};
var TeardownKeysRef = function(keys) {
    for (var i = 0, key, v; i < keys.length; i++) {
        key = keys[i];
        if (G_Has(State_AppDataKeyRef, key)) {
            v = --State_AppDataKeyRef[key];
            if (!v) {
                delete State_AppDataKeyRef[key];
                delete State_AppData[key];
                
                if (DEBUG) {
                    delete State_DataWhereSet[key];
                }
                
            }
        }
    }
};

if (DEBUG) {
    setTimeout(function() {
        Router.on('changed', function() {
            setTimeout(function() {
                var keys = [];
                var cls = [];
                for (var p in State_DataWhereSet) {
                    if (!State_AppDataKeyRef[p]) {
                        cls.push(p);
                        keys.push('key:"' + p + '" set by page:"' + State_DataWhereSet[p] + '"');
                    }
                }
                if (keys.length) {
                    console.warn('beware! Remember to clean ' + keys + ' in {Magix.State}   Clean use view.mixins like mixins:[Magix.State.clean("' + cls + '")]');
                }
            }, 200);
        });
    }, 0);
}

/**
 * 可观察的内存数据对象
 * @name State
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
var State = G_Mix({
    /**
     * @lends State
     */
    /**
     * 从Magix.State中获取数据
     * @param {String} [key] 数据key
     * @return {Object}
     */
    get: function(key) {
        var r = key ? State_AppData[key] : State_AppData;
        if (DEBUG) {
            
            if (key) {
                var loc = Router.parse();
                if (G_Has(State_DataWhereSet, key) && State_DataWhereSet[key] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + key + '" where it set by page:' + State_DataWhereSet[key]);
                }
            }
            
            r = Safeguard(r, null, function(dataKey) {
                
                var loc = Router.parse();
                if (G_Has(State_DataWhereSet, dataKey) && State_DataWhereSet[dataKey] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + dataKey + '" where it set by page:' + State_DataWhereSet[dataKey]);
                }
                
            }, function(path, value) {
                var sub = key ? key : path;
                console.warn('beware! You direct set "{Magix.State}.' + sub + '" a new value  You should call Magix.State.set() and Magix.State.digest() to notify other views {Magix.State} changed');
                if (G_IsPrimitive(value) && !/\./.test(sub)) {
                    console.warn('beware! Never set a primitive value ' + JSON.stringify(value) + ' to "{Magix.State}.' + sub + '" This may will not trigger "changed" event');
                }
            });
        }
        return r;
    },
    /**
     * 设置数据
     * @param {Object} data 数据对象
     */
    set: function(data) {
        State_DataIsChanged = G_Set(data, State_AppData, State_ChangedKeys) || State_DataIsChanged;
        
        if (DEBUG) {
            var loc = Router.parse();
            for (var p in data) {
                State_DataWhereSet[p] = loc.path;
            }
        }
        
        return this;
    },
    /**
     * 检测数据变化，如果有变化则派发changed事件
     * @param  {Object} data 数据对象
     */
    digest: function(data) {
        if (data) {
            State.set(data);
        }
        if (State_DataIsChanged) {
            this.fire('changed', {
                keys: State_ChangedKeys
            });
            State_DataIsChanged = 0;
            State_ChangedKeys = {};
        }
    },
    /**
     * 获取当前数据与上一次数据有哪些变化
     * @return {Object}
     */
    diff: function() {
        return State_ChangedKeys;
    },
    /**
     * 清除数据，该方法需要与view绑定，写在view的mixins中，如mixins:[Magix.Sate.clean('user,permission')]
     * @param  {String} keys 数据key
     */
    clean: function(keys) {
        if (DEBUG) {
            var called = false;
            setTimeout(function() {
                if (!called) {
                    throw new Error('Magix.State.clean only used in View.mixins like mixins:[Magix.State.clean("p1,p2,p3")]');
                }
            }, 1000);
        }
        if (DEBUG) {
            return {
                '\x1e': keys,
                ctor: function() {
                    var me = this;
                    called = true;
                    keys = SetupKeysRef(keys);
                    me.on('destroy', function() {
                        TeardownKeysRef(keys);
                    });
                }
            };
        }
        return {
            ctor: function() {
                var me = this;
                keys = SetupKeysRef(keys);
                me.on('destroy', function() {
                    TeardownKeysRef(keys);
                });
            }
        };
    }
    /**
     * 当State中的数据有改变化后触发
     * @name State.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.keys  包含哪些数据变化的key集合
     */
}, Event);
Magix.State = State;
    
    
    //var G_IsFunction = S.isFunction;
    var Router_VIEW = 'view';
var Router_HrefCache = new G_Cache();
var Router_ChgdCache = new G_Cache();
var Router_WinLoc = G_WINDOW.location;
var Router_LastChanged;
var Router_Silent = 0;
var Router_LLoc = {
    query: {},
    params: {},
    href: G_EMPTY
};
var Router_TrimHashReg = /(?:^.*\/\/[^\/]+|#.*$)/gi;
var Router_TrimQueryReg = /^[^#]*#?!?/;
var GetParam = function(key, params) {
    params = this[G_PARAMS];
    return params[key] || G_EMPTY;
};
var Router_Edge;

var Router_Hashbang = G_HashKey + '!';
var Router_UpdateHash = function(path, replace) {
    path = Router_Hashbang + path;
    if (replace) {
        Router_WinLoc.replace(path);
    } else {
        Router_WinLoc.hash = path;
    }
};
var Router_Update = function(path, params, loc, replace, silent, lQuery) {
    path = G_ToUri(path, params, lQuery);
    if (path != loc.srcHash) {
        Router_Silent = silent;
        Router_UpdateHash(path, replace);
    }
};

var Router_Bind = function() {
    var lastHash = Router_Parse().srcHash;
    var newHash, suspend;
    G_DOMEventLibBind(G_WINDOW, 'hashchange', function(e, loc, resolve) {
        if (suspend) {
            
            return;
        }
        loc = Router_Parse();
        newHash = loc.srcHash;
        if (newHash != lastHash) {
            resolve = function() {
                e.p = 1;
                lastHash = newHash;
                suspend = G_EMPTY;
                Router_UpdateHash(newHash);
                Router_Diff();
            };
            e = {
                reject: function() {
                    e.p = 1;
                    suspend = G_EMPTY;
                    
                    Router_UpdateHash(lastHash);
                    
                },
                resolve: resolve,
                prevent: function() {
                    suspend = 1;
                    
                }
            };
            Router.fire('change', e);
            if (!suspend && !e.p) {
                resolve();
            }
        }
    });
    G_WINDOW.onbeforeunload = function(e, te, msg) {
        e = e || G_WINDOW.event;
        te = {};
        Router.fire('pageunload', te);
        if ((msg = te.msg)) {
            if (e) e.returnValue = msg;
            return msg;
        }
    };
    Router_Diff();
};




var Router_PNR_Routers, Router_PNR_UnmatchView, /*Router_PNR_IsFun,*/
    Router_PNR_DefaultView, Router_PNR_DefaultPath;


var Router_PNR_Rewrite;


var DefaultTitle = G_DOCUMENT.title;

var Router_AttachViewAndPath = function(loc, view) {
    if (!Router_PNR_Routers) {
        Router_PNR_Routers = Magix_Cfg.routes || {};
        Router_PNR_UnmatchView = Magix_Cfg.unmatchView;
        Router_PNR_DefaultView = Magix_Cfg.defaultView;
        Router_PNR_DefaultPath = Magix_Cfg.defaultPath || '/';
        //Router_PNR_IsFun = G_IsFunction(Router_PNR_Routers);
        //if (!Router_PNR_IsFun && !Router_PNR_Routers[Router_PNR_DefaultPath]) {
        //    Router_PNR_Routers[Router_PNR_DefaultPath] = Router_PNR_DefaultView;
        //}
        
        Router_PNR_Rewrite = Magix_Cfg.rewrite;
        //if (!G_IsFunction(Router_PNR_Rewrite)) {
        //    Router_PNR_Rewrite = G_NULL;
        //}
        
    }
    if (!loc[Router_VIEW]) {
        
        var path = loc.hash[G_PATH] || (Router_Edge && loc.query[G_PATH]) || Router_PNR_DefaultPath;
        

        
        if (Router_PNR_Rewrite) {
            path = Router_PNR_Rewrite(path, loc[G_PARAMS], Router_PNR_Routers);
        }
        

        //if (Router_PNR_IsFun) {
        //    view = Router_PNR_Routers.call(Magix_Cfg, path, loc);
        //} else {
        view = Router_PNR_Routers[path] || Router_PNR_UnmatchView || Router_PNR_DefaultView;
        //}
        loc[G_PATH] = path;
        loc[Router_VIEW] = view;
        
        if (G_IsObject(view)) {
            if (DEBUG) {
                if (!view.view) {
                    console.error(path, ' config missing view!', view);
                }
            }
            G_Mix(loc, view);
        }
        
    }
};

var Router_GetChged = function(oldLocation, newLocation) {
    var oKey = oldLocation.href;
    var nKey = newLocation.href;
    var tKey = oKey + G_SPLITER + nKey;
    var result = Router_ChgdCache.get(tKey);
    if (!result) {
        var hasChanged, from, to, rps;
        result = {
            //isParam: Router_IsParam,
            //location: newLocation,
            force: !oKey //是否强制触发的changed，对于首次加载会强制触发一次
        };
        //result[Router_VIEW] = to;
        //result[G_PATH] = to;
        result[G_PARAMS] = rps = {};

        var oldParams = oldLocation[G_PARAMS],
            newParams = newLocation[G_PARAMS];
        var tArr = [G_PATH, Router_VIEW].concat(G_Keys(oldParams), G_Keys(newParams)),
            idx, key;
        for (idx = tArr.length; idx--;) {
            key = tArr[idx];
            if (idx == 1) {
                oldParams = oldLocation;
                newParams = newLocation;
                rps = result;
            }
            from = oldParams[key];
            to = newParams[key];
            if (from != to) {
                rps[key] = {
                    from: from,
                    to: to
                };
                hasChanged = 1;
            }
        }
        Router_ChgdCache.set(tKey, result = {
            a: hasChanged,
            b: result
        });
    }
    return result;
};
var Router_Parse = function(href) {
    href = href || Router_WinLoc.href;

    var result = Router_HrefCache.get(href),
        query, hash, queryObj, hashObj, params;
    if (!result) {
        query = href.replace(Router_TrimHashReg, G_EMPTY);
        hash = href.replace(Router_TrimQueryReg, G_EMPTY);
        queryObj = G_ParseUri(query);
        hashObj = G_ParseUri(hash);
        params = G_Mix({}, queryObj[G_PARAMS]);
        
        G_Mix(params, hashObj[G_PARAMS]);
        
        result = {
            get: GetParam,
            href: href,
            srcQuery: query,
            srcHash: hash,
            query: queryObj,
            hash: hashObj,
            params: params
        };
        Router_AttachViewAndPath(result);
        Router_HrefCache.set(href, result);
    }
    if (DEBUG) {
        result = Safeguard(result);
    }
    return result;
};
var Router_Diff = function() {
    var location = Router_Parse();
    var changed = Router_GetChged(Router_LLoc, Router_LLoc = location);
    if (!Router_Silent && changed.a) {
        
        Router_LastChanged = changed.b;
        if (Router_LastChanged.path) {
            G_DOCUMENT.title = location.title || DefaultTitle;
        }
        
        Router.fire('changed',  Router_LastChanged  );
    }
    Router_Silent = 0;
    if (DEBUG) {
        Router_LastChanged = Safeguard(Router_LastChanged);
    }
    return Router_LastChanged;
};
//var PathTrimFileParamsReg=/(\/)?[^\/]*[=#]$/;//).replace(,'$1').replace(,EMPTY);
//var PathTrimSearch=/\?.*$/;
/**
 * 路由对象，操作URL
 * @name Router
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
var Router = G_Mix({
    /**
     * @lends Router
     */
    /**
     * 解析href的query和hash，默认href为location.href
     * @param {String} [href] href
     * @return {Object} 解析的对象
     */
    parse: Router_Parse,
    /**
     * 根据location.href路由并派发相应的事件,同时返回当前href与上一个href差异对象
     * @example
     * var diff = Magix.Router.diff();
     * if(diff.params.page || diff.params.rows){
     *     console.log('page or rows changed');
     * }
     */
    diff: Router_Diff,
    /**
     * 导航到新的地址
     * @param  {Object|String} pn path或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * var R = Magix.Router;
     * R.to('/list?page=2&rows=20');//改变path和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     * R.to('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     * R.to({//通过对象修改参数，地址栏上的其它参数会保留
     *     page:2,
     *     rows:20
     * });
     * R.to('/list',{//改变path和相关参数，丢弃地址栏上原有的其它参数
     *     page:2,
     *     rows:20
     * });
     *
     * //凡是带path的修改地址栏，都会把原来地址栏中的参数丢弃
     */
    to: function(pn, params, replace, silent) {
        if (!params && G_IsObject(pn)) {
            params = pn;
            pn = G_EMPTY;
        }
        var temp = G_ParseUri(pn);
        var tParams = temp[G_PARAMS];
        var tPath = temp[G_PATH];
        var lPath = Router_LLoc[G_PATH]; //历史路径
        var lParams = Router_LLoc[G_PARAMS];
        var lQuery = Router_LLoc.query[G_PARAMS];
        G_Mix(tParams, params); //把路径中解析出来的参数与用户传递的参数进行合并

        if (tPath) { //设置路径带参数的形式，如:/abc?q=b&c=e或不带参数 /abc
            //tPath = G_Path(lPath, tPath);
            if (!Router_Edge) { //pushState不用处理
                for (lPath in lQuery) { //未出现在query中的参数设置为空
                    if (!G_Has(tParams, lPath)) tParams[lPath] = G_EMPTY;
                }
            }
        } else if (lParams) { //只有参数，如:a=b&c=d
            tPath = lPath; //使用历史路径
            tParams = G_Mix(G_Mix({}, lParams), tParams); //复制原来的参数，合并新的参数
        }
        Router_Update(tPath, tParams, Router_LLoc, replace, silent, lQuery);
    }

    /**
     * 当location.href有改变化后触发
     * @name Router.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.path  如果path发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.view 如果view发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.params 如果参数发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Boolean} e.force 标识是否是第一次强制触发的changed，对于首次加载完Magix，会强制触发一次changed
     */
}, Event);
Magix.Router = Router;
    
    
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
        
        id = G_GetById(id);
        if (id) id.vframe = vf;
        
    }
};

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

var Vframe_RemoveVframe = function(id, fcc, vf) {
    vf = Vframe_Vframes[id];
    if (vf) {
        delete Vframe_Vframes[id];
        Vframe.fire('remove', {
            vframe: vf,
            fcc: fcc //fireChildrenCreated
        });
        
        id = G_GetById(id);
        if (id) id.vframe = G_NULL;
        
    }
};

var Vframe_UpdateTag;
/**
 * 通知当前vframe，地址栏发生变化
 * @param {Vframe} vframe vframe对象
 * @private
 */
var Vframe_Update = function(vframe,  stateKeys,  view) {
    if (vframe && vframe.$g != Vframe_UpdateTag && (view = vframe.$v) && view.$s > 0) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的G_WINDOW.location.href对象，对于销毁的也不需要广播
        
        var isChanged = stateKeys ? State_IsObserveChanged(view, stateKeys) : View_IsObserveChanged(view);
        
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
            Vframe_Update(Vframe_Vframes[cs[i++]]  , stateKeys  );
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
        Vframe_Update(vf  , e.keys  );
    }
};

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
            if (me.id && me.pId) {
                var parent = Vframe_Vframes[pId];
                if (id != Magix_Cfg.rootId && (!pId || !parent || !parent.$c[id])) {
                    console.error('beware! Avoid use new Magix.Vframe() outside');
                }
            }
        }, 50);
    }
    //me.vId=id+'_v';
    me.$c = {}; //childrenMap
    me.$cc = 0; //childrenCount
    me.$rc = 0; //readyCount
    me.$s = 1; //signature
    me.$r = {}; //readyMap
    
    me.$il = []; //invokeList
    
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
            po, sign, view, params  , ctors   , pId, parent, p, val  ;
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
            params = po[G_PARAMS];
            
            pId = me.pId;
            
            parent = Vframe_Vframes[pId];
            parent = parent && parent.$v;
            parent = parent && parent.$u;
            if (parent && viewPath.indexOf(G_SPLITER) > 0) {
                GSet_Params(parent, params, params);
            }
            
            
            G_Mix(params, viewInitParams);
            G_Require(view, function(TView) {
                if (sign == me.$s) { //有可能在view载入后，vframe已经卸载了
                    if (!TView) {
                        return Magix_Cfg.error(Error('id:' + id + ' cannot load:' + view));
                    }
                    
                    ctors = View_Prepare(TView);
                    
                    view = new TView({
                        owner: me,
                        id: id
                    }, params  , ctors  );
                    me.$v = view;
                    
                    me.$g = Vframe_UpdateTag;
                    
                    View_DelegateEvents(view);
                    
                        
                        view.init(params);
                        
                        view.render();
                        
                    
                    if (!view.$t) { //无模板
                        me.$a = 0; //不会修改节点，因此销毁时不还原
                        if (!view.$p) {
                            view.endUpdate();
                        }
                    }
                    
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
            node, reset,
            vfId = me.id;
        
        me.$il = []; //invokeList 销毁当前view时，连同调用列表一起销毁
        
        if (view) {
            if (!Vframe_GlobalAlter) {
                reset = 1;
                Vframe_GlobalAlter = {
                    id: vfId
                };
            }
            me.$d = 1; //用于标记当前vframe处于view销毁状态，在当前vframe上再调用unmountZone时不派发created事件
            me.unmountZone(0, 1);
            Vframe_NotifyAlter(me, Vframe_GlobalAlter);

            me.$v = 0; //unmountView时，尽可能早的删除vframe上的view对象，防止view销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            if (view.$s > 0) {
                view.$s = 0;
                view.fire('destroy', 0, 1, 1);
                
                View_DestroyAllResources(view, 1);
                
                View_DelegateEvents(view, 1);
            }
            view.$s--;
            view.owner = G_NULL;
            node = G_GetById(vfId);
            if (node && me.$a /*&&!keepPreHTML*/ ) { //如果view本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且view有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即view安装前什么样，销毁后把节点恢复到安装前的情况
                
                G_HTML(node, me.$t, vfId);
                
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
                
                me.$cl = G_EMPTY; //childrenList 清空缓存的子列表
                
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
        
        
        for (i = 0; i < vframes.length; i++) {
            vf = vframes[i];
            id = vf.id || (vf.id = G_Id());
            
                if (!vf.$m) { //防止嵌套的情况下深层的view被反复实例化
                    vf.$m = 1;
                    vfs.push([id, vf.getAttribute('mx-view')]);
                }
                
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
                
                vf.$cl = G_EMPTY;
                
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
    }  ,
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
                o.r = args === o.a; //参数一样，则忽略上次的
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
    
    DOM[G_PROTOTYPE].invokeView = function(name, args) {
        var l = this.length;
        if (l) {
            var e = this[0];
            var vf = e.vframe;
            if (args === undefined) {
                return vf && vf.invoke(name);
            } else {
                for (var i = 0; i < l; i++) {
                    e = this[i];
                    vf = e.vframe;
                    if (vf) {
                        vf.invoke(name, args);
                    }
                }
            }
        }
    };
    

    /*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+view.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.current)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
 */
var Body_MagixPrefix = 'mx-';
var Body_EvtInfoCache = new G_Cache(30, 10);

var Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;

var Body_RootEvents = {};
var Body_SearchSelectorEvents = {};
var Body_FindVframeInfo = function(current, eventType) {
    var vf, tempId, selectorObject, eventSelector, names = [],
        begin = current,
        info = current.getAttribute(Body_MagixPrefix + eventType),
        match, view,
        vfs = [],
        selectorVfId;
    if (info) {
        match = Body_EvtInfoCache.get(info);
        if (!match) {
            match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
            
            match = {
                v: match[1],
                n: match[2],
                i: match[3]
            };
            
            /*jshint evil: true*/
            match.p = match.i && G_ToTry(Function('return ' + match.i), G_EMPTY_ARRAY, current);
            Body_EvtInfoCache.set(info, match);
        }
        match = {
            r: info,
            //如果事件已经存在处理的vframe或节点上通过mx-owner指定处理的vframe
            v: match.v  ,
            p: match.p,
            i: match.i,
            
            n: match.n
        };
        if (DEBUG) {
            match = Safeguard(match, {
                v: 1
            });
        }
        names.push(match);
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        selectorVfId = current.$v; //如果节点有缓存，则使用缓存
        if (!selectorVfId) { //先找最近的vframe
            vfs.push(begin);
            while (begin != G_DOCBODY && (begin = begin.parentNode)) { //找最近的vframe,且节点上没有mx-autonomy属性
                if ((Vframe_Vframes[tempId = begin.id] || (tempId = begin.$v))) {
                    selectorVfId = tempId;
                    break;
                }
                vfs.push(begin);
            }
        }

        if (selectorVfId) { //从最近的vframe向上查找带有选择器事件的view
            while ((info = vfs.pop())) {
                info.$v = selectorVfId;
            }
            
            do {
                vf = Vframe_Vframes[selectorVfId];
                if (vf && (view = vf.$v)) {
                    selectorObject = view.$so;
                    eventSelector = selectorObject[eventType];
                    for (tempId in eventSelector) {
                        if (G_TargetMatchSelector(current, tempId)) {
                            names.push({
                                r: tempId,
                                v: selectorVfId,
                                n: tempId
                            });
                        }
                    }
                    //防止跨view选中，到带模板的view时就中止或未指定
                    
                    if (view.$t) {
                        
                        if (match && !match.v) match.v = selectorVfId;
                        
                        break; //带界面的中止
                    }
                }
            }
            while (vf && (selectorVfId = vf.pId));
        }
    }
    return names;
};

var Body_DOMEventProcessor = function(e) {
    var current = e.target;
    var eventType = e.type;
    var info, names;
    var ignore;
    var arr = [];
    var vframe, view, name, fn;
    
    
    var params;
    
    while (current != G_DOCBODY) { //找事件附近有mx-[a-z]+事件的DOM节点,考虑在向上遍历的过程中，节点被删除，所以需要判断nodeType,主要是IE
        names = Body_FindVframeInfo(current, eventType);
        if (names.length) {
            arr = [];
            while ((info = names.shift())) {
                if (!info.v) {
                    return Magix_Cfg.error(Error('bad ' + eventType + ':' + info.r));
                }
                
                
                
                vframe = Vframe_Vframes[info.v];
                view = vframe && vframe.$v;
                if (view) {
                    name = info.n + G_SPLITER + eventType;
                    fn = view[name];
                    if (fn) {
                        e.eventTarget = current;
                        
                        params = info.p || {};
                        if (info.i && info.i.indexOf(G_SPLITER) > 0) {
                            GSet_Params(view.$u, params, params = {});
                            if (DEBUG) {
                                params = Safeguard(params);
                            }
                        }
                        e[G_PARAMS] = params;
                        
                        G_ToTry(fn, e, view);
                    }
                    if (DEBUG) {
                        if (!fn) { //检测为什么找不到处理函数
                            if (name.charAt(0) == '\u001f') {
                                console.error('use view.setHTML　to update ui or use view.wrapEvent to wrap your html');
                            } else {
                                console.error('can not find event processor:' + info.n + '<' + eventType + '> from view:' + vframe.path);
                            }
                        }
                    }
                }
                if (DEBUG) {
                    if (!view && view !== 0) { //销毁
                        console.error('can not find vframe:' + info.v);
                    }
                }
            }
        }
        /*|| e.mxStop */
        if ((ignore = current.$) &&
            ignore[eventType] ||
            e.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            break;
        } else {
            arr.push(current);
        }
        current = current.parentNode || G_DOCBODY;
        // if (current.id == vId) { //经过vframe时，target为vframe节点
        //     e.target = current;
        // }
    }
    while ((current = arr.pop())) {
        ignore = current.$ || (current.$ = {});
        ignore[eventType] = 1;
    }
};
var Body_DOMEventBind = function(type, searchSelector, remove) {
    var counter = Body_RootEvents[type] | 0;
    var offset = (remove ? -1 : 1);
    if (!counter || remove === counter) { // remove=1  counter=1
        G_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + offset;
    if (searchSelector) { //记录需要搜索选择器的事件
        Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
    }
};
    
    var Tmpl_EscapeSlashRegExp = /\\|'/g;
var Tmpl_EscapeBreakReturnRegExp = /\r|\n/g;
var Tmpl_Mathcer = /<%([@=!])?([\s\S]*?)%>|$/g;
var Tmpl_Compiler = function(text) {
    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "$p+='";
    text.replace(Tmpl_Mathcer, function(match, operate, content, offset) {
        source += text.slice(index, offset).replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
        index = offset + match.length;
        if (DEBUG) {
            var expr = text.slice(index - match.length, index).replace(/\${2}\./, "").replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
            if (operate == "@") {
                source += "';$expr='" + expr + "';$p+=$i(" + content + ");$p+='";
            } else if (operate == "=") {
                source += "'+($expr='" + expr + "',$e(" + content + "))+'";
            } else if (operate == "!") {
                source += "'+($expr='" + expr + "',$n(" + content + "))+'";
            } else if (content) {
                source += "';$expr='" + expr + "';" + content + ";$p+='";
            }
        } else {
            if (operate == "@") {
                source += "';$p+=$i(" + content + ");$p+='";
            } else if (operate == "=") {
                source += "'+$e(" + content + ")+'";
            } else if (operate == "!") {
                source += "'+$n(" + content + ")+'";
            } else if (content) {
                source += "';" + content + ";$p+='";
            }
        }
        // Adobe VMs need the match returned to produce the correct offset.
        return match;
    });
    source += "';";

    if (DEBUG) {
        source = "var $expr;try{" + source + "}catch(ex){$throw(ex,$expr)}";
    }
    // If a variable is not specified, place data values in local scope.
    //source = "with($mx){\n" + source + "}\n";
    source = "var $t,$p='',$em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&#34;','\\'':'&#39;','`':'&#96;'},$er=/[&<>\"'`]/g,$n=function(v){return v==null?'':''+v},$ef=function(m){return $em[m]},$e=function(v){return $n(v).replace($er,$ef)},$i=function(v,k,f){for(f=$$[$g];--f;)if($$[k=$g+f]===v)return k;$$[k=$g+$$[$g]++]=v;return k},$um={'!':'%21','\\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=function(m){return $um[m]},$uq=/[!')(*]/g,$eu=function(v){return encodeURIComponent($n(v)).replace($uq,$uf)},$qr=/[\\\\'\"]/g,$eq=function(v){return $n(v).replace($qr,'\\\\$&')};" + source + "return $p";
    if (DEBUG) {
        /*jshint evil: true*/
        return Function("$g", "$$", "$throw", source);
    }
    /*jshint evil: true*/
    return Function("$g", "$$", source);
};
var Tmpl_Cache = new G_Cache();
var Tmpl = function(text, data) {
    var fn = Tmpl_Cache.get(text);
    if (!fn) {
        fn = Tmpl_Compiler(text);
        Tmpl_Cache.set(text, fn);
    }
    return fn.call(data, G_SPLITER, data);
};
if (DEBUG) {
    var Tmpl = function(text, data, file) {
        var fn = Tmpl_Cache.get(text);
        if (!fn) {
            fn = Tmpl_Compiler(text);
            Tmpl_Cache.set(text, fn);
        }
        return fn.call(data, G_SPLITER, data, function(ex, expr) {
            setTimeout(function() {
                if (file) {
                    throw "tmpl exec error:" + ex.message + "\r\n\texpr " + expr + "\r\n\tfile " + file;
                } else {
                    throw new Error("tmpl exec error:" + ex.message + "\r\n\texpr " + expr);
                }
            }, 0);
        });
    };
}
    
    var Partial_ContentReg = /\d+\x1d/g;
var Partial_AttrReg = /([\w\-]+)(?:="([\s\S]*?)")?/g;
var Partial_UnescapeMap = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    '#34': '"',
    '#39': '\'',
    '#96': '`'
};
var Partial_UnescapeReg = /&([^;]+);/g;
var Partial_Unescape = function (m, name) {
    return Partial_UnescapeMap[name] || m;
};

var Partial_UpdateNode = function (node, view, one, renderData, updateAttrs, updateTmpl, viewId) {
    var id = node.id || (node.id = G_Id());

    var hasMagixView, viewValue, vf = view.owner;
    if (updateAttrs) {
        if (DEBUG) {
            var attr = View_SetEventOwner(Tmpl(one.attr, renderData, arguments[arguments.length - 1]), viewId);
            var nowAttrs = {};
            attr.replace(Partial_AttrReg, function (match, name, value) {
                nowAttrs[name] = value;
            });
            for (var i = one.attrs.length, a, n, old, now, exist, f; i--;) {
                a = one.attrs[i];
                n = a.n;
                f = a.f;
                if (a.v) {
                    hasMagixView = 1;
                    viewValue = nowAttrs[n];
                } else {
                    exist = G_Has(nowAttrs, n);
                    old = a.p ? node[f || n] : node.getAttribute(n);
                    now = a.b ? exist : nowAttrs[n] || G_EMPTY;
                    if (old !== now) {
                        if (a.p) {
                            //decode html
                            if (a.q) now.replace(Partial_UnescapeReg, Partial_Unescape);
                            node[f || n] = now;
                        } else if (exist) {
                            node.setAttribute(n, now);
                        } else {
                            node.removeAttribute(n);
                        }
                    }
                }
            }
        } else {
            var attr = View_SetEventOwner(Tmpl(one.attr, renderData), viewId);
            var nowAttrs = {};
            attr.replace(Partial_AttrReg, function (match, name, value) {
                nowAttrs[name] = value;
            });
            for (var i = one.attrs.length, a, n, old, now, exist, f; i--;) {
                a = one.attrs[i];
                n = a.n;
                f = a.f;
                if (a.v) {
                    hasMagixView = 1;
                    viewValue = nowAttrs[n];
                } else {
                    exist = G_Has(nowAttrs, n);
                    old = a.p ? node[f || n] : node.getAttribute(n);
                    now = a.b ? exist : nowAttrs[n] || G_EMPTY;
                    if (old !== now) {
                        if (a.p) {
                            //decode html
                            if (a.q) now.replace(Partial_UnescapeReg, Partial_Unescape);
                            node[f || n] = now;
                        } else if (exist) {
                            node.setAttribute(n, now);
                        } else {
                            node.removeAttribute(n);
                        }
                    }
                }
            }
        }
    }
    var nVf = Vframe_Vframes[id], mount, po, nPo, params;
    if (hasMagixView && !updateTmpl && nVf) {
        po = G_ParseUri(viewValue);
        params = po[G_PARAMS];
        nPo = G_ParseUri(nVf[G_PATH]);
        if (nPo[G_PATH] == po[G_PATH]) {
            if (viewValue.indexOf(G_SPLITER) > 0) {
                GSet_Params(view.$u, params, params);
            }
            nVf[G_PATH] = viewValue;
            mount = nVf.invoke('assign', params);
            if (mount) nVf.invoke('render');
        }
    }
    if (!mount) {
        if (hasMagixView) {
            vf.unmountVframe(id, viewValue);
        }
        if (updateTmpl) {
            
            if (DEBUG) {
                view.setHTML(id, Tmpl(one.tmpl, renderData, arguments[arguments.length - 1]));
            } else {

                view.setHTML(id, Tmpl(one.tmpl, renderData));
            }
            
        }
        if (hasMagixView && viewValue) {
            vf.mountVframe(id, viewValue);
        }
    }
};
var Partial_UpdateDOM = function (updater, changedKeys, renderData) {
    var selfId = updater.$i;
    var vf = Vframe_Vframes[selfId];
    var view = vf && vf.$v,
        tmplObject;
    if (!view || !(tmplObject = view.tmpl)) return;
    var tmpl = tmplObject.html;
    var list = tmplObject.subs;
    if (updater.$rd && changedKeys) {
        var keys, one, updateTmpl, updateAttrs;

        for (var i = list.length, update, q, mask, m; i--;) { //keys
            updateTmpl = 0;
            updateAttrs = 0;
            one = list[i];
            update = 1;
            mask = one.mask;
            keys = one.pKeys;
            if (keys) {
                for (q = keys.length; q--;) {
                    if (G_Has(changedKeys, keys[q])) {
                        update = 0;
                        break;
                    }
                }
            }
            if (update) {
                update = 0;
                keys = one.keys;
                for (q = keys.length; q--;) {
                    if (G_Has(changedKeys, keys[q])) {
                        update = 1;
                        if (!mask || (updateTmpl && updateAttrs)) {
                            updateTmpl = one.tmpl;
                            updateAttrs = one.attr;
                            break;
                        }
                        m = mask.charAt(q);
                        updateTmpl = updateTmpl || m & 1;
                        updateAttrs = updateAttrs || m & 2;
                    }
                }
                if (update) {
                    var nodes = $(View_SetEventOwner(one.path, selfId));
                    q = 0;
                    while (q < nodes.length) {
                        if (DEBUG) {
                            Partial_UpdateNode(nodes[q++], view, one, renderData, updateAttrs, updateTmpl, selfId, tmplObject.file);
                        } else {
                            Partial_UpdateNode(nodes[q++], view, one, renderData, updateAttrs, updateTmpl, selfId);
                        }
                    }
                }
            }
        }
    } else {
        if (!tmplObject[G_SPLITER]) {
            tmplObject[G_SPLITER] = 1;
            var map = {},
                tmplment = function (guid) {
                    return map[guid].tmpl;
                },
                x, s;
            for (x = list.length; x--;) {
                s = list[x];
                if (s.s) {
                    map[s.s] = s;
                    s.tmpl = s.tmpl.replace(Partial_ContentReg, tmplment);
                }
            }
            tmpl = tmplObject.html = tmpl.replace(Partial_ContentReg, tmplment);
        }
        updater.$rd = 1;
        if (DEBUG) {
            view.setHTML(updater.$t, Tmpl(tmpl, renderData, tmplObject.file));
        } else {
            view.setHTML(updater.$t, Tmpl(tmpl, renderData));
        }
    }
};
    /**
 * 使用mx-keys进行局部刷新的类
 * @constructor
 * @name Updater
 * @class
 * @beta
 * @module updater
 * @param {String} viewId Magix.View对象Id
 */
var Updater = function(viewId) {
    var me = this;
    me.$i = viewId;
    me.$t = viewId;
    me.$data = {
        '\x1e': 1
    };
    
    me.$keys = {};
    
};
var UP = Updater.prototype;
G_Mix(UP, {
    /**
     * @lends Updater#
     */
    to: function(id, me) {
        me = this;
        me.$t = id;
        return me;
    },
    /**
     * 获取放入的数据
     * @param  {String} [key] key
     * @return {Object} 返回对应的数据，当key未传递时，返回整个数据对象
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    get: function(key) {
        var result = this.$data;
        if (key) {
            result = result[key];
        }
        return result;
    },
    /**
     * 通过path获取值
     * @param  {String} path 点分割的路径
     * @return {Object}
     */
    gain: function(path) {
        var result = this.$data;
        var ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },
    /**
     * 获取放入的数据
     * @param  {Object} obj 待放入的数据
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    set: function(obj) {
        var me = this,
            data = me.$data,
            keys = me.$keys;
        
        G_Set(obj, data, keys);
        
        return me;
    },
    /**
     * 检测数据变化，更新界面，放入数据后需要显式调用该方法才可以把数据更新到界面
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     }).digest();
     * }
     */
    digest: function(data) {
        var me = this;
        if (data) {
            me.set(data);
        }
        data = me.$data;
        
        var keys = me.$keys;
        
        
        me.$keys = {};
        
        Partial_UpdateDOM(me, keys, data); //render
        return me;
    },
    /**
     * 获取当前数据状态的快照，配合altered方法可获得数据是否有变化
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    snapshot: function() {
        var me = this;
        me.$ss = JSONStringify(me.$data);
        return me;
    },
    /**
     * 检测数据是否有变动
     * @return {Boolean} 是否变动
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    altered: function() {
        var me = this;
        if (me.$ss) {
            return me.$ss != JSONStringify(me.$data);
        }
    }
});
    
    var View_EvtMethodReg = /^(\$?)([^<]+?)<([^>]+)>$/;
var View_ScopeReg = /\x1f/g;
var View_SetEventOwner = function(str, id) {
    return (str + G_EMPTY).replace(View_ScopeReg, id || this.id);
};

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

//var View_MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;

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

var View_WrapRender = function(prop, fn, me) {
    fn = prop.render;
    prop.render = function() {
        me = this;
        if (me.$s > 0) { //signature
            me.$s++;
            me.fire('rendercall');
            
            View_DestroyAllResources(me);
            
            
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

var View_Ctors = [];

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
        oView[G_SPLITER] =  []  ;
        var prop = oView[G_PROTOTYPE],
            currentFn, matches, selectorOrCallback, events, eventsObject = {},
            eventsList = [],
            selectorObject = {},
            node, isSelector, p, item, mask  , temp = {}  ;

        
        matches = prop.mixins;
        item = 0;
        if (matches) {
            mask = matches.length;
            while (item < mask) {
                node = matches[item++];
                for (p in node) {
                    currentFn = node[p];
                    selectorOrCallback = temp[p];
                    if (p == 'ctor') {
                        oView[G_SPLITER].push(currentFn);
                        continue;
                    } else if (View_EvtMethodReg.test(p)) {
                        if (selectorOrCallback) {
                            currentFn = processMixinsSameEvent(selectorOrCallback, currentFn);
                        } else {
                            currentFn.$m = 1;
                        }
                    } else if (DEBUG && selectorOrCallback && p != 'extend' && p != G_SPLITER) { //只在开发中提示
                        Magix_Cfg.error(Error('mixins duplicate:' + p));
                    }
                    temp[p] = currentFn;
                }
            }
            for (p in temp) {
                if (!G_Has(prop, p)) {
                    prop[p] = temp[p];
                }
            }
        }
        
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
    
    return oView[G_SPLITER];
    
};

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
            res = Router_LastChanged[G_PATH];
        }
        if (!res) {
            res = View_IsParamsChanged(loc.k, Router_LastChanged[G_PARAMS]);
        }
        // if (res && loc.c) {
        //     loc.c.call(view);
        // }
    }
    return res;
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
    
    me.$l = {
        k: []
    };
    
    
    me.$r = {};
    
    me.$s = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    
    me.updater = me.$u = new Updater(me.id);
    
    
    G_ToTry(View_Ctors, ops, me);
    
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
    
    merge: function(props, ctor) {
        ctor = props && props.ctor;
        if (ctor) View_Ctors.push(ctor);
        G_Mix(ViewProto, props);
    },
    
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
        
        var ctors = [];
        if (ctor) ctors.push(ctor);
        
        var NView = function(a, b  , c  ) {
            me.call(this, a, b);
            
            G_ToTry(ctors.concat(c), b, this);
            
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
    
    /**
     * 初始化调用的方法
     * @beta
     * @module viewInit
     * @param {Object} extra 外部传递的数据对象
     */
    init: G_NOOP,
    
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
    endUpdate: function(id, me  , o, f  ) {
        me = this;
        if (me.$s > 0) {
            id = id || me.id;
            me.fire('rendered', {
                id: id
            });
            
            f = me.$p;
            
            me.$p = 1;
            
            o = me.owner;
            o.mountZone(id);
            if (!f) {
                setTimeout(me.wrapAsync(function() {
                    Vframe_RunInvokes(o);
                }), 0);
            }
            
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
            params = params[G_PARAMS];
        }
        //if (isObservePath) {
        loc.p = isObservePath;
        //}
        if (params) {
            loc.k = (params + G_EMPTY).split(G_COMMA);
        }
    },
    
    
    /**
     * 监视Magix.State中的数据变化
     * @param  {String|Array} keys 数据对象的key
     */
    observeState: function(keys) {
        this.$os = (keys + G_EMPTY).split(G_COMMA);
    },
    
    
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
                    console.warn('beware! May be you should set destroyWhenCallRender = true');
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
            n, i = me.id;
        me.beginUpdate(id);
        if (me.$s > 0) {
            n = G_GetById(id);
            if (n) G_HTML(n, View_SetEventOwner(html, i), i);
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

    
    var G_Type = S.type;
    var G_Proxy = S.bind;
    var G_Now = S.now;
    /*
    一个请求send后，应该取消吗？
    参见xmlhttprequest的实现
        https://chromium.googlesource.com/chromium/blink/+/master/Source/core
        https://chromium.googlesource.com/chromium/blink/+/master/Source/core/xmlhttprequest/XMLHttpService.cpp
    当请求发出，服务器接受到之前取消才有用，否则连接已经建立，数据开始传递，中止只会浪费。
    但我们很难在合适的时间点abort，而且像jsonp的，我们根本无法abort掉，只能任数据返回

    然后我们在自已的代码中再去判断、决定回调是否调用

    那我们是否可以这样做：
        1. 不取消请求
        2. 请求返回后尽可能的处理保留数据，比如缓存。处理完成后才去决定是否调用回调（Service_Send中的Done实现）

    除此之外，我们还要考虑
        1. 跨请求对象对同一个缓存的接口进行请求，而某一个销毁了。
            Service.add([{
                name:'Test',
                url:'/test',
                cache:20000
            }]);

            var r1=new Service();
            r1.all('Test',function(e,m){

            });

            var r2=new Service();
            r2.all('Test',function(e,m){

            });

            r1.destroy();

            如上代码，我们在实现时：
            r2在请求Test时，此时Test是可缓存的，并且Test已经处于r1请求中了，我们不应该再次发起新的请求，只需要把回调排队到r1的Test请求中即可。参见代码：Service_Send中的for,Service.cached。

            当r1进行销毁时，并不能贸然销毁r1上的所有请求，如Test请求不能销毁，只能从回调中标识r1的回调不能再被调用。r1的Test还要继续，参考上面讨论的请求应该取消吗。就算能取消，也需要查看Test的请求中，除了r1外是否还有别的请求要用，我们示例中是r2，所以仍然继续请求。参考Service#.destroy


 */
/**
 * Bag类
 * @name Bag
 * @beta
 * @module service
 * @constructor
 * @property {String} id bag唯一标识
 */

var Bag = function() {
    this.id = G_Id('b');
    this.$ = {};
};
G_Mix(Bag[G_PROTOTYPE], {
    /**
     * @lends Bag#
     */
    /**
     * 获取属性
     * @param {String} [key] 要获取数据的key
     * @param {Object} [dValue] 当根据key取到的值为falsy时，使用默认值替代，防止代码出错
     * @return {Object}
     * @example
     * new Serice().one({
     *     name:'Test'
     * },function(error,bag){
     *     var obj=bag.get();//获取所有数据
     *
     *     var list=bag.get('list',[]);//获取list数据，如果不存在list则使用空数组
     *
     *     var count=bag.get('data.info.count',0);//获取data下面info下count的值，您无须关心data下是否有info属性
     *     console.log(list);
     * });
     */
    get: function(key, dValue, udfd) {
        var me = this;
        //var alen = arguments.length;
        /*
            目前只处理了key中不包含.的情况，如果key中包含.则下面的简单的通过split('.')的方案就不行了，需要改为：

            var reg=/[^\[\]]+(?=\])|[^.\[\]]+/g;
            var a=['a.b.c','a[b.c].d','a[0][2].e','a[b.c.d][eg].a.b.c','[e.g.d]','a.b[c.d.fff]'];

            for(var i=0,one;i<a.length;i++){
              one=a[i];
              console.log(one.match(reg))
            }

            但考虑到key中有.的情况非常少，则优先使用性能较高的方案

            或者key本身就是数组
         */
        var hasDValue = dValue != udfd;
        var $attrs = me.$;
        var attrs = $attrs;
        if (key) {
            var tks = G_IsArray(key) ? G_Slice.call(key) : (key + G_EMPTY).split('.'),
                tk;
            while ((tk = tks.shift()) && attrs) {
                attrs = attrs[tk];
            }
            if (tk) {
                attrs = udfd;
            }
        }
        var type;
        if (hasDValue && (type = G_Type(dValue)) != G_Type(attrs)) {
            if (DEBUG) {
                Magix_Cfg.error(Error('type neq:' + key + ' is not a(n) ' + type));
            }
            attrs = dValue;
        }
        if (DEBUG && me.$m && me.$m.k) { //缓存中的接口不让修改数据
            attrs = Safeguard(attrs);
        }
        return attrs;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set: function(key, val) {
        var me = this,
            t;
        if (!G_IsObject(key)) {
            t = {};
            t[key] = val;
            key = t;
        }
        G_Mix(me.$, key);
    }
});
var Service_FetchFlags_ONE = 1;
var Service_FetchFlags_ALL = 2;
var Service_CacheDone = function(cacheKey, err, fns) {
    fns = this[cacheKey]; //取出当前的缓存信息
    if (fns) {
        delete this[cacheKey]; //先删除掉信息
        G_ToTry(fns, err, fns.e); //执行所有的回调
    }
};
var Service_Task = function(done, host, service, total, flag, bagCache) {
    var doneArr = [];
    var errorArgs = G_NULL;
    var currentDoneCount = 0;

    return function(idx, err) {
        var bag = this;
        var newBag;
        currentDoneCount++; //当前完成加1
        var mm = bag.$m;
        var cacheKey = mm.k;
        doneArr[idx + 1] = bag; //完成的bag
        var dispach = {
            bag: bag,
            error: err
        };
        if (err) { //出错
            errorArgs = err;
            //errorArgs[idx] = err; //记录相应下标的错误信息
            //G_Mix(errorArgs, err);
            host.fire('fail', dispach);
            newBag = 1; //标记当前是一个新完成的bag,尽管出错了
        } else if (!bagCache.has(cacheKey)) { //如果缓存对象中不存在，则处理。注意在开始请求时，缓存与非缓存的都会调用当前函数，所以需要在该函数内部做判断处理
            if (cacheKey) { //需要缓存
                bagCache.set(cacheKey, bag); //缓存
            }
            //bag.set(data);
            mm.t = G_Now(); //记录当前完成的时间
            var after = mm.a;
            if (after) { //有after
                G_ToTry(after, bag, bag);
            }
            if (mm.x) { //需要清理
                host.clear(mm.x);
            }
            host.fire('done', dispach);
            newBag = 1;
        }
        if (!service.$o) { //service.$o 当前请求被销毁
            var finish = currentDoneCount == total;
            if (finish) {
                service.$b = 0;
                if (flag == Service_FetchFlags_ALL) { //all
                    doneArr[0] = errorArgs;
                    G_ToTry(done, doneArr, service);
                }
            }
            if (flag == Service_FetchFlags_ONE) { //如果是其中一个成功，则每次成功回调一次
                G_ToTry(done, [err ? err : G_NULL, bag, finish, idx], service);
            }
        }
        if (newBag) { //不管当前request或回调是否销毁，均派发end事件，就像前面缓存一样，尽量让请求处理完成，该缓存的缓存，该派发事件派发事件。
            host.fire('end', dispach);
        }
    };
};
/**
 * 获取attrs，该用缓存的用缓存，该发起请求的请求
 * @private
 * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
 * @param {Function} done   完成时的回调
 * @param {Integer} flag   获取哪种类型的attrs
 * @param {Boolean} save 是否是保存的动作
 * @return {Service}
 */
var Service_Send = function(me, attrs, done, flag, save) {
    if (me.$o) return me; //如果已销毁，返回
    if (me.$b) { //繁忙，后续请求入队
        return me.enqueue(function() {
            Service_Send(this, attrs, done, flag, save);
        });
    }
    me.$b = 1; //标志繁忙
    var host = me.constructor;
    //var bagCache = host.$c; //存放bag的Cache对象
    var bagCacheKeys = host.$r; //可缓存的bag key

    if (!G_IsArray(attrs)) {
        attrs = [attrs];
    }
    var total = attrs.length;
    var remoteComplete = Service_Task(done, host, me, total, flag, host.$c);
    
    for (var i = 0, bag; i < total; i++) {
        bag = attrs[i];
        if (bag) {
            var bagInfo = host.get(bag, save); //获取bag信息

            var bagEntity = bagInfo.e;
            var cacheKey = bagEntity.$m.k; //从实体上获取缓存key

            var complete = G_Proxy(remoteComplete, bagEntity, i); //包装当前的完成回调
            var cacheList;

            if (cacheKey && bagCacheKeys[cacheKey]) { //如果需要缓存，并且请求已发出
                bagCacheKeys[cacheKey].push(complete); //放到队列中
            } else if (bagInfo.u) { //需要更新
                if (cacheKey) { //需要缓存
                    cacheList = [complete];
                    cacheList.e = bagEntity;
                    bagCacheKeys[cacheKey] = cacheList;
                    complete = G_Proxy(Service_CacheDone, bagCacheKeys, cacheKey); //替换回调，详见Service_CacheDone
                }
                
                host.$s(bagEntity, complete);
                
            } else { //不需要更新时，直接回调
                complete();
            }
        }
    }
    
    return me;
};
/**
 * 接口请求服务类
 * @name Service
 * @constructor
 * @beta
 * @module service
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @example
 * var S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data)//设置数据
 *             callback();//通知内部完成数据请求
 *         },
 *         error:function(msg){
 *             callback(msg);//出错
 *         }
 *     })
 * });
 * // 添加接口
 * S.add({
 *     name:'test',
 *     url:'/test',
 *     cache:1000*60 //缓存一分钟
 * });
 * // 使用接口
 * var s=new S();
 * s.all('test',function(err,bag){
 *     console.log(err,bag);
 * });
 */
var Service = function() {
    var me = this;
    me.id = G_Id('s');
    if (DEBUG) {
        me.id = G_Id('\x1es');
        setTimeout(function() {
            if (!me.$c) {
                console.warn('beware! You should use view.capture to connect Service and View');
            }
        }, 1000);
    }
    me.$q = [];
};

G_Mix(Service[G_PROTOTYPE], {
    /**
     * @lends Service#
     */
    /**
     * 获取attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * new Service().all([{
     *     name:'Test1'
     * },{
     *     name:'Test2'
     * }],function(err,bag1,bag2){
     *     console.log(arguments);
     * });
     */
    all: function(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL);
    },
    /**
     * 保存attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 保存attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * // 同all,但与all不同的是，当指定接口缓存时，all方法会优先使用缓存，而save方法则每次都会发送请求到服务器，忽略掉缓存。同时save更语义化
     */
    save: function(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL, 1);
    },
    /**
     * 获取attrs，其中任意一个成功均立即回调，回调会被调用多次。注：当使用promise时，不存在该方法。
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @beta
     * @return {Service}
     * @example
     *  //代码片断：
     * var s = new Service().one([
     *     {name:'M1'},
     *     {name:'M2'},
     *     {name:'M3'}
     * ],function(err,bag){//m1,m2,m3，谁快先调用谁，且被调用三次
     *     if(err){
     *         alert(err.msg);
     *     }else{
     *         alert(bag.get('name'));
     *     }
     * });
     */
    one: function(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ONE);
    },
    /**
     * 前一个all,one或save任务做完后的下一个任务
     * @param  {Function} callback 当前面的任务完成后调用该回调
     * @return {Service}
     * @beta
     * @example
     * var r = new Service().all([
     *     {name:'M1'},
     *     {name:'M2'}
     * ],function(err,bag1,bag2){
     *     r.dequeue(['args1','args2']);
     * });
     * r.enqueue(function(args1,args2){
     *     alert([args1,args2]);
     * });
     */
    enqueue: function(callback) {
        var me = this;
        if (!me.$o) {
            me.$q.push(callback);
            me.dequeue(me.$a);
        }
        return me;
    },
    /**
     * 做下一个任务
     * @param {Array} preArgs 传递的参数
     * @beta
     * @example
     * var r = new Service();
     * r.all('Name',function(e,bag){
     *     r.dequeue([e,bag]);
     * });
     * r.enqueue(function(e,result){//result为m
     *     r.all('NextName',function(e,bag){
     *         r.dequeue([e,bag]);
     *     });
     * });
     *
     * r.enqueue(function(e,bag){//m===queue m;
     *     console.log(e,bag);
     *     r.dequeue([e,bag]);
     * });
     *
     * r.enqueue(function(e,bag){
     *     console.log(e,bag);
     * });
     *
     * //当出错时，e为出错的信息
     */
    dequeue: function() {
        var me = this,
            a = G_Slice.call(arguments);
        if (!me.$b && !me.$o) {
            me.$b = 1;
            setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                me.$b = 0;
                if (!me.$o) { //不清除setTimeout,但在回调中识别是否调用了destroy方法
                    var one = me.$q.shift();
                    if (one) {
                        G_ToTry(one, me.$a = a, me);
                    }
                }
            }, 0);
        }
    },
    /**
     * 销毁当前请求，不可以继续发起新请求，而且不再调用相应的回调
     */
    destroy: function(me) {
        me = this;
        me.$o = 1; //只需要标记及清理即可，其它的不需要
        me.$q = 0;
    }
    /**
     * 当Service发送请求前触发
     * @name Service.begin
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @example
     * var S = Magix.Service.extend({
     *     //codes
     * });
     *
     * S.on('begin',function(e){//监听所有的开始请求事件
     *     console.log(e);
     * });
     */
    /**
     * 当Service结束请求时触发(成功或失败均触发)
     * @name Service.end
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求失败时触发
     * @name Service.fail
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求成功时触发
     * @name Service.done
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     */
});

var Manager_DefaultCacheKey = function(meta, attrs, arr) {
    arr = [JSONStringify(attrs), JSONStringify(meta)];
    return arr.join(G_SPLITER);
};
var Manager_ClearCache = function(v, ns, cache, mm) {
    mm = v && v.$m;
    if (mm && ns[mm.n]) {
        cache.del(mm.k);
    }
};
var Service_Manager = G_Mix({
    /**
     * @lends Service
     */
    /**
     * 添加元信息
     * @param {Object} attrs 信息属性
     */
    add: function(attrs) {
        var me = this;
        var metas = me.$m;
        if (!G_IsArray(attrs)) {
            attrs = [attrs];
        }
        for (var i = attrs.length, bag, name; i--;) {
            bag = attrs[i];
            if (bag) {
                name = bag.name;
                bag.cache = bag.cache | 0;
                metas[name] = bag;
            }
        }
    },
    /**
     * 创建bag对象
     * @param {Object} attrs           bag描述信息对象
     * @return {Bag}
     */
    create: function(attrs) {
        var me = this;
        var meta = me.meta(attrs);
        var cache = (attrs.cache | 0) || meta.cache;
        var entity = new Bag();
        entity.set(meta);
        entity.$m = {
            n: meta.name,
            a: meta.after,
            x: meta.cleans,
            k: cache && Manager_DefaultCacheKey(meta, attrs)
        };

        if (G_IsObject(attrs)) {
            entity.set(attrs);
        }
        var before = meta.before;
        if (before) {
            G_ToTry(before, entity, entity);
        }
        me.fire('begin', {
            bag: entity
        });
        return entity;
    },
    /**
     * 获取bag注册时的元信息
     * @param  {String|Object} attrs 名称
     * @return {Object}
     * @example
     * var S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test'
     * });
     *
     * console.log(S.meta('test'),S.meta({name:'test'}));//这2种方式都可以拿到add时的对象信息
     */
    meta: function(attrs) {
        var me = this;
        var metas = me.$m;
        var name = attrs.name || attrs;
        var meta = metas[name];
        return meta || attrs;
    },
    /**
     * 获取bag对象，优先从缓存中获取
     * @param {Object} attrs           bag描述信息对象
     * @param {Boolean} createNew 是否是创建新的Bag对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    get: function(attrs, createNew) {
        var me = this;
        var entity, update;
        if (!createNew) {
            entity = me.cached(attrs);
        }

        if (!entity) {
            entity = me.create(attrs);
            update = 1;
        }
        return {
            e: entity,
            u: update
        };
    },
    /**
     * 根据name清除缓存的attrs
     * @param  {String|Array} names 字符串或数组
     * @example
     * var S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test',
     *     cache:1000*60
     * });
     *
     * var s = new Service();
     * s.all('test');
     * s.all('test');//from cache
     * S.clear('test');
     * s.all('test');//fetch from server
     */
    clear: function(names) {
        this.$c.each(Manager_ClearCache, G_ToMap((names + G_EMPTY).split(G_COMMA)));
    },
    /**
     * 从缓存中获取bag对象
     * @param  {Object} attrs
     * @return {Bag}
     * @example
     * var S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test',
     *     cache:1000*60
     * });
     *
     * S.cached('test');//尝试从缓存中获取bag对象
     */
    cached: function(attrs) {
        var me = this;
        var bagCache = me.$c;
        var entity;
        var cacheKey;
        var meta = me.meta(attrs);
        var cache = (attrs.cache | 0) || meta.cache;

        if (cache) {
            cacheKey = Manager_DefaultCacheKey(meta, attrs);
        }

        if (cacheKey) {
            var requestCacheKeys = me.$r;
            var info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info.e;
            } else { //缓存
                entity = bagCache.get(cacheKey);
                if (entity && G_Now() - entity.$m.t > cache) {
                    bagCache.del(cacheKey);
                    entity = 0;
                }
            }
        }
        return entity;
    }
}, Event);
/**
 * 继承
 * @lends Service
 * @param  {Function} sync 接口服务同步数据方法
 * @param  {Integer} [cacheMax] 最大缓存数，默认20
 * @param  {Integer} [cacheBuffer] 缓存缓冲区大小，默认5
 * @return {Function} 返回新的接口类
 * @example
 * var S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data);
 *             callback();
 *         },
 *         error:function(msg){
 *             callback({message:msg});
 *         }
 *     })
 * },10,2);//最大缓存10个接口数据，缓冲区2个
 */
Service.extend = function(sync, cacheMax, cacheBuffer) {
    var me = this;
    var NService = function() {
        me.call(this);
    };
    NService.$s = sync;
    NService.$c = new G_Cache(cacheMax, cacheBuffer);
    NService.$r = {};
    NService.$m = {};
    return G_Extend(NService, me, G_NULL, Service_Manager);
};
Magix.Service = Service;
    
    
var T_Extend = function (props, statics) {
    var me = this;
    var ctor = props && props.ctor;
    var X = function () {
        var t = this,
            a = arguments;
        me.apply(t, a);
        if (ctor) ctor.apply(t, a);
    };
    X.extend = T_Extend;
    return G_Extend(X, me, props, statics);
};
G_Mix(G_NOOP[G_PROTOTYPE], Event);
G_NOOP.extend = T_Extend;
/**
 * 组件基类
 * @name Base
 * @constructor
 * @borrows Event.fire as #fire
 * @borrows Event.on as #on
 * @borrows Event.off as #off
 * @beta
 * @module base
 * @example
 * var T = Magix.Base.extend({
 *     hi:function(){
 *         this.fire('hi');
 *     }
 * });
 * var t = new T();
 * t.onhi=function(e){
 *     console.log(e);
 * };
 * t.hi();
 */
Magix.Base = G_NOOP;

    
    S.add(MxGlobalView, function() {
        return View.extend(
            
        );
    });
    
    return Magix;
}, {
    requires: ['event', 'node', 'dom']
});