var Router_SLASH = '/';
var Router_PATH = 'path';
var Router_VIEW = 'view';
var Router_PARAMS = 'params';
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
    params = this[Router_PARAMS];
    return params[key] || G_EMPTY;
};
var Router_Edge;
/*#if(!modules.forceEdgeRouter){#*/
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
/*#if(modules.tipRouter){#*/
var Router_Bind = function() {
    var lastHash = Router_Parse().srcHash;
    var newHash, suspend;
    G_DOMEventLibBind(G_WINDOW, 'hashchange', function(e, loc, resolve) {
        if (suspend) {
            /*#if(modules.tipLockUrlRouter){#*/
            Router_UpdateHash(lastHash);
            /*#}#*/
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
                    /*#if(!modules.tipLockUrlRouter){#*/
                    Router_UpdateHash(lastHash);
                    /*#}#*/
                },
                resolve: resolve,
                prevent: function() {
                    suspend = 1;
                    /*#if(modules.tipLockUrlRouter){#*/
                    Router_UpdateHash(lastHash);
                    /*#}#*/
                }
            };
            Router.fire('change', e);
            if (!suspend && !e.p) {
                resolve();
            }
        }
    });
    G_WINDOW.onbeforeunload = function(e) {
        e = e || G_WINDOW.event;
        var te = {};
        Router.fire('pageunload', te);
        if (te.msg) {
            if (e) e.returnValue = te.msg;
            return te.msg;
        }
    };
    Router_Diff();
};
/*#}else{#*/
var Router_Bind = function() {
    G_DOMEventLibBind(G_WINDOW, 'hashchange', Router_Diff);
    Router_Diff();
};
/*#}#*/
/*#}#*/
/*#if(modules.edgeRouter||modules.forceEdgeRouter){#*/
var WinHistory = G_WINDOW.history;
/*#if(!modules.forceEdgeRouter){#*/
if (WinHistory.pushState) {
    /*#}#*/
    Router_Edge = 1;
    var Router_DidUpdate;
    var Router_UpdateState = function(path, replace) {
        WinHistory[replace ? 'replaceState' : 'pushState'](G_NULL, G_NULL, path);
    };
    var Router_Popstate;
    var Router_Update = function(path, params, loc, replace, silent) {
        path = G_ToUri(path, params);
        if (path != loc.srcQuery) {
            Router_Silent = silent;
            Router_UpdateState(path, replace);
            if (Router_Popstate) {
                Router_Popstate(1);
            } else {
                Router_Diff();
            }
        }
    };
    /*#if(modules.tipRouter){#*/
    var Router_Bind = function() {
        var initialURL = Router_WinLoc.href;
        var lastHref = initialURL;
        var newHref, suspend;
        G_DOMEventLibBind(G_WINDOW, 'popstate', Router_Popstate = function(f, e, resolve) {
            newHref = Router_WinLoc.href;
            var initPop = !Router_DidUpdate && newHref == initialURL;
            Router_DidUpdate = 1;
            if (initPop) return;
            if (suspend) {
                /*#if(modules.tipLockUrlRouter){#*/
                Router_UpdateState(lastHref);
                /*#}#*/
                return;
            }
            if (newHref != lastHref) {
                resolve = function() {
                    e.p = 1;
                    suspend = G_EMPTY;
                    if (!f) Router_UpdateState(lastHref = newHref);
                    Router_Diff();
                };
                e = {
                    reject: function() {
                        suspend = G_EMPTY;
                        e.p = 1;
                        /*#if(!modules.tipLockUrlRouter){#*/
                        Router_UpdateState(lastHref);
                        /*#}#*/
                    },
                    resolve: resolve,
                    prevent: function() {
                        suspend = 1;
                        /*#if(modules.tipLockUrlRouter){#*/
                        Router_UpdateState(lastHref);
                        /*#}#*/
                    }
                };
                Router.fire('change', e);
                if (!suspend && !e.p) {
                    resolve();
                }
            }
        });
        G_WINDOW.onbeforeunload = function(e) {
            e = e || G_WINDOW.event;
            var te = {};
            Router.fire('pageunload', te);
            if (te.msg) {
                if (e) e.returnValue = te.msg;
                return te.msg;
            }
        };
        Router_Diff();
    };
    /*#}else{#*/
    var Router_Bind = function() {
        var initialURL = Router_WinLoc.href;
        G_DOMEventLibBind(G_WINDOW, 'popstate', function() {
            var initPop = !Router_DidUpdate && Router_WinLoc.href == initialURL;
            Router_DidUpdate = 1;
            if (initPop) return;
            Router_Diff();
        });
        Router_Diff();
    };
    /*#}#*/
    /*#if(!modules.forceEdgeRouter){#*/
}
/*#}#*/
/*#}#*/

var Router_PNR_Routers, Router_PNR_UnmatchView, Router_PNR_IsFun,
    Router_PNR_DefaultView, Router_PNR_DefaultPath;
var Router_AttachViewAndPath = function(loc, view) {
    //var result;
    if (!Router_PNR_Routers) {
        Router_PNR_Routers = Magix_Cfg.routes || {};
        Router_PNR_UnmatchView = Magix_Cfg.unmatchView;
        Router_PNR_DefaultView = Magix_Cfg.defaultView;
        Router_PNR_DefaultPath = Magix_Cfg.defaultPath || Router_SLASH;
        Router_PNR_IsFun = G_IsFunction(Router_PNR_Routers);
        if (!Router_PNR_IsFun && !Router_PNR_Routers[Router_PNR_DefaultPath]) {
            Router_PNR_Routers[Router_PNR_DefaultPath] = Router_PNR_DefaultView;
        }
    }
    if (!loc[Router_VIEW]) {
        /*#if(modules.forceEdgeRouter){#*/
        var path = loc.query[Router_PATH] || Router_PNR_DefaultPath;
        /*#}else{#*/
        var path = loc.hash[Router_PATH] || (Router_Edge && loc.query[Router_PATH]) || Router_PNR_DefaultPath;
        /*#}#*/

        if (Router_PNR_IsFun) {
            view = Router_PNR_Routers.call(Magix_Cfg, path, loc);
        } else {
            view = Router_PNR_Routers[path] || Router_PNR_UnmatchView || Router_PNR_DefaultView;
        }
        loc[Router_PATH] = path;
        loc[Router_VIEW] = view;
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
        //result[Router_PATH] = to;
        result[Router_PARAMS] = rps = {};

        var oldParams = oldLocation[Router_PARAMS],
            newParams = newLocation[Router_PARAMS];
        var tArr = [Router_PATH, Router_VIEW].concat(G_Keys(oldParams), G_Keys(newParams)),
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
        params = G_Mix({}, queryObj[Router_PARAMS]);
        /*#if(!modules.forceEdgeRouter){#*/
        G_Mix(params, hashObj[Router_PARAMS]);
        /*#}#*/
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
        result = Safeguard(result, {
            path: 1
        });
    }
    return result;
};
var Router_Diff = function() {
    var location = Router_Parse();
    var changed = Router_GetChged(Router_LLoc, Router_LLoc = location);
    if (!Router_Silent && changed.a) {
        Router.fire('changed', Router_LastChanged = changed.b);
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
        var tParams = temp[Router_PARAMS];
        var tPath = temp[Router_PATH];
        var lPath = Router_LLoc[Router_PATH]; //历史路径
        var lParams = Router_LLoc[Router_PARAMS];
        var lQuery = Router_LLoc.query[Router_PARAMS];
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