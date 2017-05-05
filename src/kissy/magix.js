/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version edge
 **/
KISSY.add('magix', function(S, SE, DOM) {
    var G_NOOP = S.noop;
    var $ = S.all;
    var G_Require = function(name, fn) {
        S.use(name && (name + G_EMPTY), function(S) {
            if (fn) {
                fn.apply(S, G_Slice.call(arguments, 1));
            }
        });
    };
    var G_Extend = S.extend;
    var G_IsObject = S.isObject;
    var G_IsArray = S.isArray;
    var G_DOM = S.DOM;
    var G_HTML = function(node, html) {
        S.one(node).html(html);
        G_DOC.fireHandler('htmlchange', {
            target: node
        });
    };


    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    var Router_Edge;
    /*#if(modules.router||modules.updater){#*/
    var G_IsFunction = S.isFunction;
    /*#if(!modules.forceEdgeRouter){#*/
    var Win = S.one(G_WINDOW);
    var Router_Hashbang = G_HashKey + '!';
    var Router_UpdateHash = function(path, replace) {
        path = Router_Hashbang + path;
        if (replace) {
            Router_WinLoc.replace(path);
        } else {
            Router_WinLoc.hash = path;
        }
    };
    var Router_Update = function(path, params, loc, replace, lQuery) {
        path = G_ToUri(path, params, lQuery);
        if (path != loc.srcHash) {
            Router_UpdateHash(path, replace);
        }
    };
    /*#if(modules.tipRouter){#*/
    var Router_Bind = function() {
        var lastHash = Router_Parse().srcHash;
        var newHash, suspend;
        Win.on('hashchange', function(e, resolve) {
            if (suspend) {
                /*#if(modules.tipLockUrlRouter){#*/
                Router_UpdateHash(lastHash);
                /*#}#*/
                return;
            }
            newHash = Router_Parse().srcHash;
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
        Win.on('hashchange', Router_Diff);
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
        var Router_Update = function(path, params, loc, replace) {
            path = G_ToUri(path, params);
            if (path != loc.srcQuery) {
                Router_UpdateState(path, replace);
                Router_Diff();
            }
        };
        /*#if(modules.tipRouter){#*/
        var Router_Bind = function() {
            var initialURL = Router_WinLoc.href;
            var lastHref = initialURL;
            var newHref, suspend;
            Win.on('popstate', function(e, resolve) {
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
                        Router_UpdateState(lastHref = newHref);
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
            Win.on('popstate', function() {
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
    /*#}#*/

    Inc('../tmpl/router');
    Inc('../tmpl/vframe');
    var Body_TargetMatchSelector = DOM.test;
    var Body_DOMGlobalProcessor = function(e, d) {
        d = this;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    var Body_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            SE[(remove ? 'un' : G_EMPTY) + 'delegate'](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : Event_ON](node, type, cb, scope);
        }
    };
    Inc('../tmpl/body');
    Inc('../tmpl/tmpl');
    Inc('../tmpl/updater');
    Inc('../tmpl/view');

    /*#if(modules.service){#*/
    var G_Type = S.type;
    var G_Proxy = S.bind;
    var G_Now = S.now;

    /*#}#*/
    //!@vars service
    Inc('../tmpl/service');
    /*#if(modules.base){#*/
    var T_Extend = function(props, statics) {
        var me = this;
        var ctor = props && props.ctor;
        var X = function() {
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
     */
    Magix.Base = G_NOOP;
    /*#}#*/
    /*#if(modules.core){#*/
    S.add(MxGlobalView, function() {
        return View.extend(
            /*#if(!modules.autoEndUpdate){#*/
            {
                render: function() {
                    this.endUpdate();
                }
            }
            /*#}#*/
        );
    });
    /*#}#*/
    return Magix;
}, {
    requires: ['event', 'node', 'dom']
});