/*
    源码级模块定制，更利于取舍功能
    固定的模块有magix,event,body,vframe,view
    可选的模块有router,service,base,fullstyle,style,cnum,ceach,resource,edgerouter,tiprouter,simplerouter
 */
var G_COUNTER = 0;
var G_EMPTY = '';
var G_EMPTY_ARRAY = [];
var G_Slice = G_EMPTY_ARRAY.slice;
var G_NOOP = function() {};
var G_COMMA = ',';
var G_NULL = null;
var G_WINDOW = window;
var G_DOCUMENT = document;
var G_HashKey = '#';
var G_DOCBODY; //initilize at vframe_root
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
var G_SPLITER = '\u001f';
var Magix_StrObject = 'object';
var G_PROTOTYPE = 'prototype';
// var Magix_PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
// var Magix_PathTrimFileReg = /\/[^\/]*$/;
// var Magix_ProtocalReg = /^(?:https?:)?\/\//i;
var Magix_SLASH = '/';
var Magix_PathTrimParamsReg = /[#?].*$/;
var Magix_ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
var Magix_IsParam = /(?!^)=|&/;
var G_Id = function(prefix) {
    return (prefix || 'mx_') + G_COUNTER++;
};
/*#if(modules.style){#*/
var MxStyleGlobalId = G_Id();
/*#}#*/
var MxGlobalView = G_Id();
var Magix_Cfg = {
    rootId: G_Id(),
    defaultView: MxGlobalView,
    error: function(e) {
        throw e;
    }
};
var Magix_HasProp = Magix_Cfg.hasOwnProperty;

var G_GetById = function(id) {
    return typeof id == Magix_StrObject ? id : G_DOCUMENT.getElementById(id);
};
var G_NodeIn = function(a, b, r) {
    a = G_GetById(a);
    b = G_GetById(b);
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = b.contains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) {}
        }
    }
    return r;
};
var G_Mix = function(aim, src, p) {
    for (p in src) {
        aim[p] = src[p];
    }
    return aim;
};

var G_ToTry = function(fns, args, context, i, r, e) {
    if (!G_IsArray(fns)) fns = [fns];
    if (!G_IsArray(args)) args = [args];
    for (i = 0; e = fns[i]; i++) {
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Magix_Cfg.error(x);
        }
    }
    return r;
};

var G_Has = function(owner, prop) {
    return owner && Magix_HasProp.call(owner, prop); //false 0 G_NULL '' undefined
};
var Magix_CacheSort = function(a, b) {
    return /*#if(modules.cnum||modules.fullstyle){#*/ b.n - a.n || /*#}#*/ b.f - a.f || b.t - a.t;
};
/**
 * Magix.Cache 类
 * @name Cache
 * @constructor
 * @param {Integer} max 最大值
 * @param {Integer} buffer 缓冲区大小
 * @param {Function} remove 当缓存的元素被删除时调用
 * @example
 * var c=Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
 * c.set('key1',{});//缓存
 * c.get('key1');//获取
 * c.del('key1');//删除
 * c.has('key1');//判断
 * //注意：缓存通常配合其它方法使用，在Magix中，对路径的解析等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
 */
var G_Cache = function(max, buffer, remove, me) {
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
    get: function(key) {
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
    /*#if(modules.cnum||modules.fullstyle){#*/
    /**
     * 获取引用值，仅启动cnum模块时该方法才存在
     * @param  {String} key 缓存key
     * @param  {Boolean} increase 是否是增长
     * @beta
     * @module cnum
     */
    num: function(key, increase) {
        var me = this,
            c = me.c,
            k = G_SPLITER + key;
        if (increase && !c[k]) {
            me.set(key, G_NULL);
        }
        var o = c[k];
        if (o) {
            if (increase) {
                o.n++;
            } else if (o.n > 0) {
                o.n--;
            }
            o.f++;
        }
    },
    /*#}#*/
    /*#if(modules.ceach||modules.service){#*/
    /**
     * 循环缓存 需启用ceach或service模块
     * @param  {Function} cb 回调
     * @param  {Object} ops 回调时传递的额外参数
     * @beta
     * @module ceach|service
     */
    each: function(cb, ops, me, c, i) {
        me = this;
        c = me.c;
        for (i = c.length - 1; i > -1; i--) {
            cb(c[i].v, ops, me);
        }
    },
    /*#}#*/
    /**
     * 设置缓存
     * @param {String} key 缓存的key
     * @param {Object} value 缓存的对象
     */
    set: function(okey, value) {
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
                    /*#if(modules.cnum||modules.fullstyle){#*/
                    r = c[c.length - 1]; //弹出最后一个
                    if (r.n) { //如果有引用
                        break; //直接跳出循环
                    }
                    c.pop();
                    /*#}else{#*/
                    r = c.pop();
                    /*#}#*/
                    //为什么要判断r.f>0,考虑这样的情况：用户设置a,b，主动删除了a,重新设置a,数组中的a原来指向的对象残留在列表里，当排序删除时，如果不判断则会把新设置的删除，因为key都是a
                    //
                    if (r.f > 0) me.del(r.o); //如果没有引用，则删除
                    /*#if(modules.cnum||modules.fullstyle){#*/
                    f = 1; //标记无引用
                    /*#}#*/
                }
                /*#if(modules.cnum||modules.fullstyle){#*/
                if (!f) { //auto increase
                    me.x += me.b;
                }
                /*#}#*/
            }
            r = {
                /*#if(modules.cnum||modules.fullstyle){#*/
                n: 0,
                /*#}#*/
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
    del: function(k) {
        k = G_SPLITER + k;
        var c = this.c;
        var r = c[k],
            m = this.r;
        if (r) {
            r.f = -1;
            r.v = G_EMPTY;
            delete c[k];
            if (m) {
                G_ToTry(m, r.o, r);
            }
        }
    },
    /**
     * 检测缓存中是否有给定的key
     * @param  {String} key 缓存key
     * @return {Boolean}
     */
    has: function(k) {
        return G_Has(this.c, G_SPLITER + k);
    }
});


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
 * var obj=Magix.parseUri('/xxx/?a=b&c=d');
 * //obj={path:'/xxx/',params:{a:'b',c:'d'}}
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
 * var str=Magix.toUri('/xxx/',{a:'b',c:'d'});
 * //str==/xxx/?a=b&c=d
 *
 * var str=Magix.toUri('/xxx/',{a:'',c:2});
 *
 * //str==/xxx/?a=&c=2
 *
 * var str=Magix.toUri('/xxx/',{a:'',c:2},{c:1});
 *
 * //str==/xxx/?c=2
 * var str=Magix.toUri('/xxx/',{a:'',c:2},{a:1,c:1});
 *
 * //str==/xxx/?a=&c=2
 */
var G_ToUri = function(path, params, keo) { //上个方法的逆向
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
/*#if(modules.linkage||modules.router){#*/
var G_Keys = Object.keys || function(obj, keys, p) {
    keys = [];
    for (p in obj) {
        if (G_Has(obj, p)) {
            keys.push(p);
        }
    }
    return keys;
};
/*#}#*/
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
     * @function
     * @param {Object} [cfg] 配置信息对象,更多信息请参考Magix.boot方法
     * @return {Object} 配置信息对象
     * @example
     * Magix.config({
     *      rootId:'J_app_main'
     * });
     *
     * var config=Magix.config();
     *
     * S.log(config.rootId);
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
     * @param  {Object} cfg 初始化配置参数对象
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPath 当无法从地址栏取到path时的默认值。比如使用hash保存路由信息，而初始进入时并没有hash,此时defaultPath会起作用
     * @param {String} cfg.unfoundView 404时加载的view
     * @param {Object} cfg.routes pathname与view映射关系表
     * @param {String} cfg.rootId 根view的id
     * @param {Array} cfg.exts 需要加载的扩展
     * @param {Boolean} cfg.coded 是否对地址栏中的参数进行编码或解码，默认true
     * @param {Function} cfg.error 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
     * @example
     * Magix.boot({
     *      rootId:'J_app_main',】
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPath:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     */
    /*#if(modules.router){#*/
    boot: function(cfg) {
        G_Mix(Magix_Cfg, cfg); //先放到配置信息中，供ini文件中使用
        /*#if(modules.configIni){#*/
        G_Require(Magix_Cfg.ini, function(I) {
            G_Mix(Magix_Cfg, I);
            G_Mix(Magix_Cfg, cfg);
            /*#}#*/
            G_Require(Magix_Cfg.exts, function() {
                Router.on('changed', Vframe_NotifyLocationChange);
                Router.bind();
            });
            /*#if(modules.configIni){#*/
        });
        /*#}#*/
    },
    /*#}else{#*/
    boot: function(cfg) {
        G_Mix(Magix_Cfg, cfg);
        G_Require(Magix_Cfg.exts, function() {
            Vframe_Root().mountView(Magix_Cfg.defaultView);
        });
    },
    /*#}#*/
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} key  以数组中对象的哪个key的value做为hahs的key
     * @return {Object}
     * @example
     * var map=Magix.toMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * var map=Magix.toMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     */
    toMap: G_ToMap,
    /**
     * 以try cache方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} args    参数数组
     * @param  {Object} context 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
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
     * var str=Magix.toUrl('/xxx/',{a:'b',c:'d'});
     * //str==/xxx/?a=b&c=d
     *
     * var str=Magix.toUrl('/xxx/',{a:'',c:2});
     *
     * //str==/xxx/?a=&c=2
     *
     * var str=Magix.toUrl('/xxx/',{a:'',c:2},{c:1});
     *
     * //str==/xxx/?c=2
     * var str=Magix.toUrl('/xxx/',{a:'',c:2},{a:1,c:1});
     *
     * //str==/xxx/?a=&c=2
     */
    toUrl: G_ToUri,
    /**
     * 把路径字符串转换成对象
     * @function
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * var obj=Magix.parseUrl('/xxx/?a=b&c=d');
     * //obj={path:'/xxx/',params:{a:'b',c:'d'}}
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
     *   var o1={
     *       a:10
     *   };
     *   var o2={
     *       b:20,
     *       c:30
     *   };
     *
     *   Magix.mix(o1,o2);//{a:10,b:20,c:30}
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
     *   var obj={
     *       key1:undefined,
     *       key2:0
     *   }
     *
     *   Magix.has(obj,'key1');//true
     *   Magix.has(obj,'key2');//true
     *   Magix.has(obj,'key3');//false
     *
     *
     * @return {Boolean} 是否拥有prop属性
     */
    has: G_Has,
    /*#if(modules.linkage||modules.router){#*/
    /**
     * 获取对象的keys
     * @type {Array}
     * @beta
     * @module linkage|router
     */
    keys: G_Keys,
    /*#}#*/
    /**
     * 判断一个节点是否在另外一个节点内，如果比较的2个节点是同一个节点，也返回true
     * @function
     * @param {String|HTMLElement} node节点或节点id
     * @param {String|HTMLElement} container 容器
     * @return {Boolean}
     */
    inside: G_NodeIn,
    /**
     * document.getElementById的简写
     * @param {String} id
     * @return {HTMLElement|Null}
     */
    node: G_GetById,
    /*#if(modules.style){#*/
    /**
     * 应用样式
     * @param {String} prefix 样式的名称前缀
     * @param {String} css 样式字符串
     */
    applyStyle: View_ApplyStyle,
    /*#}#*/
    /**
     * 返回全局唯一ID
     * @function
     * @param {String} [prefix] 前缀
     * @return {String}
     */
    guid: G_Id,
    Cache: G_Cache
};