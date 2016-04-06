/*
    author:xinglie.lkf@taobao.com
 */
(function() {
    var Now = Date.now || function() {
        return new Date().getTime();
    };
    var KISSY = window.KISSY;
    var KISSYEnv = {
        isReady: function() {
            var mods = KISSY.Env.mods;
            var status = KISSY.Loader.Status;
            var magix = mods['magix/magix']; //旧版本
            if (magix) {
                var vom = mods['magix/vom'];
                return magix.status === status.ATTACHED && vom && vom.status === status.ATTACHED;
            } else {
                magix = mods.magix; //新版
                return magix && magix.status === status.ATTACHED;
            }
        },
        getRootVId: function() {
            var old = KISSY.Env.mods['magix/magix'];
            var magix;
            if (old) {
                magix = KISSY.require('magix/magix');
            } else {
                magix = KISSY.require('magix');
            }
            return magix.config('rootId');
        },
        getVOM: function() {
            var old = KISSY.Env.mods['magix/magix'];
            if (old) {
                return KISSY.require('magix/vom');
            }
            var magix = KISSY.require('magix');
            return magix.VOM || magix.Vframe;
        },
        getRouter: function() {
            var old = KISSY.Env.mods['magix/magix'];
            if (old) {
                return KISSY.require('magix/router');
            }
            var magix = KISSY.require('magix');
            return magix.Router;
        },
        hookAjax: function(callback) {
            var io = KISSY.IO || KISSY.Ajax;
            io.on('send', function(xhr) {
                xhr.ajaxConfig.__begin = Now();
            });
            io.on('success', function(xhr) {
                var duration = Now() - xhr.ajaxConfig.__begin;
                delete xhr.ajaxConfig.__begin;
                callback({
                    url: xhr.ajaxConfig.url,
                    duration: duration,
                    isJSONP: !!xhr.ajaxConfig.jsonp
                });
            });
        },
        hookAssets: function(callback) {
            var oldGetScript = KISSY.getScript;
            KISSY.getScript = function(url, success, charset) {
                var config = success,
                    puppetSuccess,
                    now = Now();
                if (KISSY.isPlainObject(config)) {
                    var bakSuccess = config.success;
                    config.success = function() {
                        callback({
                            url: url,
                            duration: Now() - now
                        });
                        if (bakSuccess) bakSuccess.apply(KISSY, arguments);
                    };
                    puppetSuccess = config;
                } else {
                    puppetSuccess = function() {
                        callback({
                            url: url,
                            duration: Now() - now
                        });
                        if (success) success.apply(KISSY, arguments);
                    };
                }
                return oldGetScript.call(KISSY, url, puppetSuccess, charset);
            };
        },
        domReady: function(fn) {
            KISSY.ready(fn);
        }
    };
    var Analysis = {
        getEnv: function() {
            var me = this;
            if (me.$env) return me.$env;
            if (window.KISSY) {
                return (me.$env = KISSYEnv);
            }
            throw new Error('Analysis unsupport current enviroment');
        },
        prepare: function(callback) {
            var me = this;
            var env = me.getEnv();
            var poll = function() {
                if (document.body) {
                    if (env.isReady()) {
                        callback();
                    } else {
                        setTimeout(poll, 500);
                    }
                } else {
                    setTimeout(poll, 500);
                }
            };
            poll();
        },
        beginHookAjax: function(key) {
            var me = this;
            var pool = me.$hookAjaxPool;
            if (!pool) {
                pool = me.$hookAjaxPool = [];
            }
            pool.push(key);
            pool['x' + key] = {
                time: Now(),
                count: 0,
                duration: 0
            };
        },
        endHookAjax: function(key) {
            var me = this;
            var pool = me.$hookAjaxPool;
            var n;
            if (pool && (n = pool['x' + key])) {
                var duration = n.duration;
                var count = n.count;
                delete pool['x' + key];
                for (var i = pool.length - 1; i >= 0; i--) {
                    if (pool[i] == key) {
                        pool.splice(i, 1);
                    }
                }
                return {
                    count: count,
                    duration: duration
                };
            }
            return {
                count: -1,
                duration: -1
            };
        },
        hookAjax: function() {
            var me = this;
            var env = me.getEnv();
            env.hookAjax(function(info) {
                info.type = 'request';
                me.log(info);
                var pool = me.$hookAjaxPool;
                if (pool) {
                    for (var i = pool.length - 1, n; i >= 0; i--) {
                        n = pool['x' + pool[i]];
                        n.duration += Now() - n.time;
                        n.time = Now();
                        n.count++;
                    }
                }
            });
        },
        beginHookAssets: function(key) {
            var me = this;
            var pool = me.$hookAssetsPool;
            if (!pool) {
                pool = me.$hookAssetsPool = [];
            }
            pool.push(key);
            pool['a' + key] = {
                time: Now(),
                count: 0,
                duration: 0
            };
        },
        endHookAssets: function(key) {
            var me = this;
            var pool = me.$hookAssetsPool;
            var n;
            if (pool && (n = pool['a' + key])) {
                var duration = n.duration;
                var count = n.count;
                delete pool['a' + key];
                for (var i = pool.length - 1; i >= 0; i--) {
                    if (pool[i] == key) {
                        pool.splice(i, 1);
                    }
                }
                return {
                    count: count,
                    duration: duration
                };
            }
            return {
                count: -1,
                duration: -1
            };
        },
        hookAssets: function() {
            var me = this;
            var env = me.getEnv();
            env.hookAssets(function(info) {
                info.type = 'assets';
                me.log(info);
                var pool = me.$hookAssetsPool;
                if (pool) {
                    for (var i = pool.length - 1, n; i >= 0; i--) {
                        n = pool['a' + pool[i]];
                        n.duration += Now() - n.time;
                        n.time = Now();
                        n.count++;
                    }
                }
            });
        },
        monitor: function(vf) {
            var me = this;
            var env = me.getEnv();
            var router = env.getRouter();
            var info;
            var now = Now();
            me.beginHookAjax('first');
            me.beginHookAssets('first');
            vf.on('created', function() {
                var refInfo = info; //保存info信息，为setTimeout使用
                info = null;
                var an, xn;
                setTimeout(function() { //ajax success比complete早触发，所以成功后整个VOM就created了，我们等待一下
                    if (refInfo) {
                        an = me.endHookAssets(refInfo.url);
                        xn = me.endHookAjax(refInfo.url);
                        refInfo.end = Now();
                        refInfo.duration = refInfo.end - refInfo.begin;
                        refInfo.apiDuration = xn.duration;
                        refInfo.apiCount = xn.count;
                        refInfo.assetsDuration = an.duration;
                        refInfo.assetsCount = an.count;
                        me.log(refInfo);
                    } else {
                        an = me.endHookAssets('first');
                        xn = me.endHookAjax('first');
                        if (an.count > -1) { //url参数改变引起的先忽略
                            var loc = router.parseQH ? router.parseQH() : router.parse();
                            me.log({
                                type: 'pageloaded',
                                duration: Now() - now,
                                url: loc.path || loc.pathname,
                                apiDuration: xn.duration,
                                apiCount: xn.count,
                                assetsDuration: an.duration,
                                assetsCount: an.count
                            });
                        }
                    }
                }, 0);
            });
            router.on('changed', function(e) {
                var changed = e.changed || e;
                if (info) {
                    info.action = 'discard';
                    info.end = Now();
                    info.duration = info.end - info.begin;
                    me.log(info);
                }
                var pathFnKey = 'isPath',
                    pathParamsKey = 'path';
                if (changed.isPathname) {
                    pathFnKey = 'isPathname';
                    pathParamsKey = 'pathname';
                }
                if (changed[pathFnKey]()) { //pathname改变
                    var pathParams = changed[pathParamsKey];
                    info = {
                        begin: Now(),
                        type: 'pathchanged',
                        from: pathParams.from,
                        to: pathParams.to,
                        url: pathParams.to
                    };
                    me.beginHookAjax(info.url);
                    me.beginHookAssets(info.url);
                } else { //参数改变
                    //和brix的局部刷新存在问题，异步请求局部刷新后并不会触发根vf的created事件
                    /*info = {
                        begin: Now(),
                        type: 'paramschanged',
                        url: e.location.path || e.location.pathname
                    };*/
                }
            });
        },
        start: function() {
            var now = Now();
            var me = this;
            var env = me.getEnv();
            env.domReady(function() {
                me.log({
                    type: 'domready',
                    duration: Now() - now
                });
            });
            // window.onload = function() {
            //     me.log({
            //         type: 'windowload',
            //         duration: Now() - now
            //     });
            // };
            me.prepare(function() {
                me.log({ //准备好的时间
                    type: 'prepareReady',
                    duration: Now() - now
                });
                //var env = me.getEnv();
                var vom = env.getVOM();
                var rootId = env.getRootVId();
                var rootVf = vom.get(rootId);
                me.hookAjax();
                me.hookAssets();
                if (rootVf) {
                    me.log({
                        type: 'rootVfReady',
                        duration: 0
                    });
                    me.monitor(rootVf);
                } else {
                    now = Now();
                    var vfAdd = function(e) {
                        if (e.vframe.id == rootId) {
                            me.log({
                                type: 'rootVfReady',
                                duration: Now() - now
                            });
                            vom.off('add', vfAdd);
                            me.monitor(e.vframe);
                        }
                    };
                    vom.on('add', vfAdd);
                }
            });
        },
        log: function(info) {
            //console.log(info);
            var fn = Log[info.type];
            if (fn) {
                fn(info);
            }
        }
    };
    var Log = {
        send: function(params) {
            //params.gmkey = 'zuanshi';
            var a = ['gmkey=zuanshi'];
            for (var p in params) {
                a.push(p + '=' + encodeURIComponent(params[p]));
            }
            //console.log(a.join('&'));
            new Image().src = 'https://gm.mmstat.com/alimama.12?' + a.join('&');
        },
        domReady: function(e) {
            Log.$ready = e.duration;
        },
        pageloaded: function(e) {
            var params = {
                is_whole_load: 1,
                logtype: 'page',
                url: e.url,
                timeconsuming: e.duration,
                apiCount: e.apiCount,
                assetsCount: e.assetsCount,
                apiDuration: e.apiDuration,
                assetsDuration: e.assetsDuration
            };
            if (Log.$ready) {
                params.domready_time = Log.$ready;
            }
            Log.send(params);
        },
        pathchanged: function(e) {
            var params = {
                is_whole_load: 0,
                logtype: 'page',
                url: e.url,
                from: e.from,
                timeconsuming: e.duration,
                apiCount: e.apiCount,
                assetsCount: e.assetsCount,
                apiDuration: e.apiDuration,
                assetsDuration: e.assetsDuration
            };
            if (e.action) {
                params.action = e.action;
            }
            Log.send(params);
        },
        request: function(e) {
            var params = {
                speed: e.duration,
                url: e.url,
                logtype: 'api'
            };
            Log.send(params);
        },
        assets: function(e) {
            var params = {
                speed: e.duration,
                url: e.url,
                logtype: 'assets'
            };
            Log.send(params);
        }
    };
    Analysis.start();
})();