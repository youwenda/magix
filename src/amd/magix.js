/*
    author:xinglie.lkf@taobao.com
 */
define('magix', ['$'], function($) {
    var G_NOOP = function() {};
    /*#if(modules.hasDefaultView){#*/
    var G_DefaultView;
    /*#}#*/
    var G_Require = function(name, fn) {
        if (name) {
            /*#if(modules.hasDefaultView){#*/
            if (MxGlobalView == name) {
                if (!G_DefaultView) {
                    G_DefaultView = View.extend(
                        /*#if(!modules.autoEndUpdate){#*/
                        {
                            render: function() {
                                this.endUpdate();
                            }
                        }
                        /*#}#*/
                    );
                }
                fn(G_DefaultView);
            } else /*#}#*/
                if (G_IsArray(name)) {
                    require(name, fn);
                } else {
                    try {
                        fn(require(name)); //获取过的直接返回
                    } catch (e) {
                        require([name], fn);
                    }
                }
        } else if (fn) {
            fn();
        }
    };
    var T = function() {};
    var G_Extend = function(ctor, base, props, statics, cProto) {
        //bProto.constructor = base;
        T[G_PROTOTYPE] = base[G_PROTOTYPE];
        cProto = new T();
        G_Mix(cProto, props);
        G_Mix(ctor, statics);
        cProto.constructor = ctor;
        ctor[G_PROTOTYPE] = cProto;
        return ctor;
    };
    var G_IsObject = $.isPlainObject;
    var G_IsArray = $.isArray;
    var G_HTML = function(node, html) {
        $(node).html(html);
        G_DOC.triggerHandler({
            type: 'htmlchange',
            target: node
        });
    };
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.router){#*/
    var Router_Edge;
    var G_IsFunction = $.isFunction;
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
        $(G_WINDOW).on('hashchange', function(e, loc, resolve) {
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
        $(G_WINDOW).on('hashchange', Router_Diff);
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
            $(G_WINDOW).on('popstate', function(e, resolve) {
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
            $(G_WINDOW).on('popstate', function() {
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
    /*#if(modules.mxViewAttr){#*/
    var G_Trim = $.trim;
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    $.fn.invokeView = function() {
        var vf = this.prop('vframe'),
            returned;
        if (vf) {
            returned = vf.invoke.apply(vf, arguments);
        }
        return returned;
    };
    /*#}#*/
    var Body_SelectorEngine = $.find || $.zepto;
    var Body_TargetMatchSelector = Body_SelectorEngine.matchesSelector || Body_SelectorEngine.matches;
    var Body_DOMGlobalProcessor = function(e, d) {
        d = e.data;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    var Body_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            type += '.' + scope.i;
        }
        if (remove) {
            $(node).off(type, cb);
        } else {
            $(node).on(type, scope, cb);
        }
    };
    Inc('../tmpl/body');
    Inc('../tmpl/tmpl');
    Inc('../tmpl/updater');

    Inc('../tmpl/view');
    /*#if(modules.service){#*/
    var G_Type = $.type;
    var G_Proxy = $.proxy;
    var G_Now = $.now || Date.now;
    /*#}#*/
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
    /*#}#*/
    return Magix;
});