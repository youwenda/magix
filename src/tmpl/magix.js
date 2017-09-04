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
    /*#if(modules.router){#*/
    boot: function(cfg) {
        G_Mix(Magix_Cfg, cfg); //先放到配置信息中，供ini文件中使用
        /*#if(modules.configIni){#*/
        G_Require(Magix_Cfg.ini, function(I) {
            G_Mix(Magix_Cfg, I);
            G_Mix(Magix_Cfg, cfg);
            /*#}#*/
            G_Require(Magix_Cfg.exts, function() {
                Router.on('changed', Vframe_NotifyChange);
                /*#if(modules.state){#*/
                State.on('changed', Vframe_NotifyChange);
                /*#}#*/
                Router_Bind();
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
            /*#if(modules.state){#*/
            State.on('changed', Vframe_NotifyChange);
            /*#}#*/
        });
    },
    /*#}#*/
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
    /*#if(modules.style){#*/
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
    /*#}#*/
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