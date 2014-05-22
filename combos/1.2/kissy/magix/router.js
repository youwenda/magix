/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.1
 */
KISSY.add('magix/router', function(S, Magix, Event, SE) {
    var EMPTY = '';
var PATH = 'path';
var VIEW = 'view';

var Has = Magix.has;
var Mix = Magix.mix;

var OKeys = Magix.keys;
var MxConfig = Magix.config();
var HrefCache = Magix.cache();
var ChgdCache = Magix.cache(40);
var WinLoc = window.location;
var WinHistory = window.history;
var TLoc, LLoc = {
    params: {},
    href: EMPTY
}, Pnr;
var TrimHashReg = /#.*$/,
    TrimQueryReg = /^[^#]*#?!?/;
var PARAMS = 'params';
var UseEdgeHistory;
var SupportState, HashAsNativeHistory, ReadLocSrc;

var IsParam = function(params, r, ps) {
    if (params) {
        ps = this[PARAMS];
        params = (params + EMPTY).split(',');
        for (var i = 0; i < params.length; i++) {
            r = Has(ps, params[i]);
            if (r) break;
        }
    }
    return r;
};
var IsPath = function() {
    return this[PATH];
};
var IsView = function() {
    return this[VIEW];
};


var GetSetParam = function(key, value, me, params) {
    me = this;
    params = me[PARAMS];
    return arguments.length > 1 ? params[key] = value : params[key];
};


var Path = function(path) {
    var o = Magix.toObject(path);
    var pn = o[PATH];
    if (pn && HashAsNativeHistory) { //如果不是以/开头的并且要使用history state,当前浏览器又不支持history state则放hash中的path要进行处理
        o[PATH] = Magix.path(WinLoc.pathname, pn);
    }
    return o;
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
 * @borrows Event.once as once
 * @borrows Event.rely as rely
 */
var Router = Mix({
    /**
     * @lends Router
     */
    /**
     * 使用history state做为改变url的方式来保存当前页面的状态
     * @function
     * @private
     */
    useState: Magix.unimpl,
    /**
     * 使用hash做为改变url的方式来保存当前页面的状态
     * @function
     * @private
     */
    useHash: Magix.unimpl,
    /**
     * 根据地址栏中的path获取对应的前端view
     * @param  {String} path 形如/list/index这样的path
     * @param {Object} loc 内部临时使用的对象
     * @return {Object} 返回形如{view:'app/views/default',path:'/home'}这样的对象
     * @private
     */
    viewInfo: function(path, loc) {
        var r, result;
        if (!Pnr) {
            Pnr = {
                rs: MxConfig.routes || {},
                nf: MxConfig.unfoundView
            };
            //var home=pathCfg.defaultView;//处理默认加载的view
            //var dPathname=pathCfg.defaultPath||EMPTY;
            var defaultView = MxConfig.defaultView;
            /*if (!defaultView) {
                throw new Error('unset defaultView');
            }*/
            Pnr.dv = defaultView;
            var defaultPath = MxConfig.defaultPath || EMPTY;
            //if(!Magix.isFunction(temp.rs)){
            r = Pnr.rs;
            Pnr.f = Magix._f(r);
            if (!Pnr.f && !r[defaultPath] && defaultView) {
                r[defaultPath] = defaultView;
            }
            Pnr[PATH] = defaultPath;
        }

        if (!path) path = Pnr[PATH];

        r = Pnr.rs;
        if (Pnr.f) {
            result = r.call(MxConfig, path, loc);
        } else {
            result = r[path]; //简单的在映射表中找
        }
        return {
            view: result || Pnr.nf || Pnr.dv,
            path: path
        };
    },
    /**
     * 开始路由工作
     * @private
     */
    start: function() {
        /*
        尽可能的延迟配置，防止被依赖时，配置信息不正确
         */
        UseEdgeHistory = MxConfig.edge;

        SupportState = UseEdgeHistory && WinHistory.pushState;
        HashAsNativeHistory = UseEdgeHistory && !SupportState;

        ReadLocSrc = SupportState ? 'srcQuery' : 'srcHash';

        if (SupportState) {
            Router.useState();
        } else {
            Router.useHash();
        }
        Router.route(); //页面首次加载，初始化整个页面
    },

    /**
     * 解析href的query和hash，默认href为window.location.href
     * @param {String} [href] href
     * @return {Object} 解析的对象
     */
    parseQH: function(href, inner) {
        href = href || WinLoc.href;
        /*var cfg=Magix.config();
        if(!cfg.originalHREF){
            try{
                href=DECODE(href);//解码有问题 http://fashion.s.etao.com/search?q=%CF%CA%BB%A8&initiative_id=setao_20120529&tbpm=t => error:URIError: malformed URI sequence
            }catch(ignore){

            }
        }*/
        var result = HrefCache.get(href);
        if (!result) {
            var query = href.replace(TrimHashReg, EMPTY);
            //
            //var query=tPathname+params.replace(/^([^#]+).*$/g,'$1');
            var hash = href.replace(TrimQueryReg, EMPTY); //原始hash
            //
            var queryObj = Path(query);
            //
            var hashObj = Path(hash); //去掉可能的！开始符号
            //
            var comObj = {}; //把query和hash解析的参数进行合并，用于hash和pushState之间的过度
            Mix(comObj, queryObj[PARAMS]);
            Mix(comObj, hashObj[PARAMS]);
            result = {
                get: GetSetParam,
                set: GetSetParam,
                href: href,
                refHref: LLoc.href,
                srcQuery: query,
                srcHash: hash,
                query: queryObj,
                hash: hashObj,
                params: comObj
            };
            HrefCache.set(href, result);
        }
        if (inner && !result[VIEW]) {
            //
            var tempPathname;
            /*
                1.在选择path时，不能简单的把hash中的覆盖query中的。有可能是从不支持history state浏览器上拷贝链接到支持的浏览器上，分情况而定：
                如果hash中存在path则使用hash中的，否则用query中的

                2.如果指定不用history state则直接使用hash中的path

                以下是对第1条带hash的讨论
                // http://etao.com/list/?a=b#!/home?page=2&rows=20
                //  /list/index
                //  /home
                //   http://etao.com/list?page=3#!/home?page=2;
                // 情形A. path不变 http://etao.com/list?page=3#!/list?page=2 到支持history state的浏览器上 参数合并;
                // 情形B .path有变化 http://etao.com/list?page=3#!/home?page=2 到支持history state的浏览器上 参数合并,path以hash中的为准;
            */
            //if (UseEdgeHistory) { //指定使用history state
            /*
                if(Router.supportState()){//当前浏览器也支持
                    if(hashObj[PATH]){//优先使用hash中的，理由见上1
                        tempPathname=hashObj[PATH];
                    }else{
                        tempPathname=queryObj[PATH];
                    }
                }else{//指定使用history 但浏览器不支持 说明服务器支持这个路径，规则同上
                    if(hashObj[PATH]){//优先使用hash中的，理由见上1
                        tempPathname=hashObj[PATH];
                    }else{
                        tempPathname=queryObj[PATH];
                    }
                }
                合并后如下：
                */
            //
            // tempPathname = result.hash[PATH] || result.query[PATH];
            //} else { //指定不用history state ，那咱还能说什么呢，直接用hash
            //tempPathname = result.hash[PATH];
            //}
            //上述if else简写成以下形式，方便压缩
            tempPathname = result.hash[PATH] || (UseEdgeHistory && result.query[PATH]);
            var view = Router.viewInfo(tempPathname, result);
            Mix(result, view);
        }
        return result;
    },
    /**
     * 获取2个location对象之间的差异部分
     * @param  {Object} oldLocation 原始的location对象
     * @param  {Object} newLocation 当前的location对象
     * @return {Object} 返回包含差异信息的对象
     * @private
     */
    getChged: function(oldLocation, newLocation) {
        var oKey = oldLocation.href;
        var nKey = newLocation.href;
        var tKey = oKey + '\u001a' + nKey;
        var result = ChgdCache.get(tKey);
        if (!result) {
            var hasChanged, from, to, rps;
            result = {
                isParam: IsParam,
                isPath: IsPath,
                isView: IsView
            };
            result[VIEW] = to;
            result[PATH] = to;
            result[PARAMS] = rps = {};

            var oldParams = oldLocation[PARAMS],
                newParams = newLocation[PARAMS];
            var tArr = [PATH, VIEW].concat(OKeys(oldParams), OKeys(newParams)),
                idx, key;
            for (idx = tArr.length - 1; idx >= 0; idx--) {
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
            result.occur = hasChanged;
            ChgdCache.set(tKey, result);
        }
        return result;
    },
    /**
     * 根据window.location.href路由并派发相应的事件
     */
    route: function() {
        var location = Router.parseQH(0, 1);
        var firstFire = !LLoc.get; //是否强制触发的changed，对于首次加载会强制触发一次
        var changed = Router.getChged(LLoc, location);
        LLoc = location;
        if (changed.occur) {
            TLoc = location;
            Router.fire('changed', {
                location: location,
                changed: changed,
                force: firstFire
            });
        }
    },
    /**
     * 导航到新的地址
     * @param  {Object|String} pn path或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * Magix.use('magix/router',function(S,R){
     *      R.navigate('/list?page=2&rows=20');//改变path和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     *      R.navigate('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     *      R.navigate({//通过对象修改参数，地址栏上的其它参数会保留
     *          page:2,
     *          rows:20
     *      });
     *      R.navigate('/list',{//改变path和相关参数，丢弃地址栏上原有的其它参数
     *          page:2,
     *          rows:20
     *      });
     *
     *      //凡是带path的修改地址栏，都会把原来地址栏中的参数丢弃
     *
     * });
     */
    navigate: function(pn, params, replace) {

        if (!params && Magix._o(pn)) {
            params = pn;
            pn = EMPTY;
        }
        if (params) {
            pn = Magix.toUrl(pn, params);
        }
        //TLoc引用
        //pathObj引用
        //
        //temp={params:{},path:{}}
        //
        //Mix(temp,TLoc,temp);
        //
        //

        if (pn && TLoc) {

            /*var pathObj = Path(pn);
            var temp = {};
            temp[PARAMS] = Mix({}, pathObj[PARAMS]);
            temp[PATH] = pathObj[PATH];*/
            var temp = Path(pn);
            var querys = TLoc.query[PARAMS];

            if (temp[PATH]) { //设置路径带参数的形式，如:/abc?q=b&c=e
                if (HashAsNativeHistory) { //指定使用history state但浏览器不支持，需要把query中的存在的参数以空格替换掉
                    for (var p in querys) {
                        if (Has(querys, p) && !Has(temp[PARAMS], p)) {
                            temp[PARAMS][p] = EMPTY;
                        }
                    }
                }
            } else { //只有参数，如:a=b&c=d
                var ps = Mix({}, TLoc[PARAMS]); //复制原来的参数
                // Mix(temp[PARAMS], TLoc[PARAMS], temp[PARAMS]);
                temp[PARAMS] = Mix(ps, temp[PARAMS]); //覆盖原来的参数
                temp[PATH] = TLoc[PATH]; //使用原来的路径
            }
            var tempPath = Magix.toUrl(temp[PATH], temp[PARAMS], UseEdgeHistory ? PATH : querys); //hash需要保留query中的空白值参数
            var navigate;

            navigate = tempPath != TLoc[ReadLocSrc];

            if (navigate) {

                if (SupportState) { //如果使用pushState
                    Router.poped = 1;
                    WinHistory[replace ? 'replaceState' : 'pushState'](EMPTY, EMPTY, tempPath);
                    Router.route();
                } else {
                    Mix(temp, TLoc, temp);
                    temp.srcHash = tempPath;
                    /*temp.hash = {
                        params: temp[PARAMS],
                        path: temp[PATH]
                    };*/
                    /*
                        window.onhashchange=function(e){
                        };
                        (function(){
                            location.hash='a';
                            location.hash='b';
                            location.hash='c';
                        }());


                     */
                    Router.fire('!ul', {
                        loc: TLoc = temp
                    }); //hack 更新view的location属性
                    tempPath = '#!' + tempPath;
                    if (replace) {
                        WinLoc.replace(tempPath);
                    } else {
                        WinLoc.hash = tempPath;
                    }
                }
            }
        }
    }

    /**
     * 当window.location.href有改变化后触发
     * @name Router.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.location 地址解析出来的对象，包括query hash 以及 query和hash合并出来的params等
     * @param {Object} e.changed 有哪些值发生改变的对象，可通过读取该对象下面的path,view或params，来识别值是从(from)什么值变成(to)什么值
     * @param {Boolean} e.force 标识是否是第一次强制触发的changed，对于首次加载完Magix，会强制触发一次changed
     */

}, Event);
    Router.useState = function() {
        var initialURL = location.href;
        SE.on(window, 'popstate', function(e) {
            var equal = location.href == initialURL;
            if (!Router.poped && equal) return;
            Router.poped = 1;
            Router.route();
        });
    };
    Router.useHash = function() { //extension impl change event
        SE.on(window, 'hashchange', Router.route);
    };
    return Router;
}, {
    requires: ["magix/magix", "magix/event", "event"]
});