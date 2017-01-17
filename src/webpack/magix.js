module.exports = (function() {
    var $ = require('$');
    var G_NOOP = $.noop;
    /*#if(modules.core){#*/
    var coreDefaultView;
    /*#}#*/
    var G_Require = function(name, fn) {
        var views = Magix_Cfg.views;
        /*#if(modules.core){#*/
        if (!views[MxGlobalView]) views[MxGlobalView] = coreDefaultView;
        /*#}#*/
        fn(views[name]);
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
    };
    /*#if(modules.style){#*/
    var View_ApplyStyle = function(key, css, node, sheet) {
        if (css && !View_ApplyStyle[key]) {
            View_ApplyStyle[key] = 1;
            node = $(G_HashKey + MxStyleGlobalId);
            if (node.length) {
                sheet = node.prop('styleSheet');
                if (sheet) {
                    sheet.cssText += css;
                } else {
                    node.append(css);
                }
            } else {
                $('head').append('<style id="' + MxStyleGlobalId + '">' + css + '</style>');
            }
        }
    };
    /*#}#*/
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    var Router_Edge;
    /*#if(modules.router){#*/
    var G_IsFunction = $.isFunction;
    /*#if(!modules.forceEdgeRouter){#*/
    var Router_Hashbang = G_HashKey + '!';
    var Router_Update = function(path, params, loc, replace, lQuery) {
        path = G_ToUri(path, params, lQuery);
        if (path != loc.srcHash) {
            path = Router_Hashbang + path;
            if (replace) {
                Router_WinLoc.replace(path);
            } else {
                Router_WinLoc.hash = path;
            }
        }
    };
    /*#if(modules.tiprouter){#*/
    var Router_Bind = function() {
        var lastHash = Router.parse().srcHash;
        var newHash, suspend;
        $(G_WINDOW).on('hashchange', function(e, loc) {
            if (suspend) return;
            loc = Router.parse();
            newHash = loc.srcHash;
            if (newHash != lastHash) {
                e = {
                    backward: function() {
                        suspend = G_EMPTY;
                        Router_WinLoc.hash = Router_Hashbang + lastHash;
                    },
                    forward: function() {
                        lastHash = newHash;
                        suspend = G_EMPTY;
                        Router.diff();
                    },
                    prevent: function() {
                        suspend = 1;
                    }
                };
                Router.fire('change', e);
                if (!suspend) {
                    e.forward();
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
        Router.diff();
    };
    /*#}else{#*/
    var Router_Bind = function() {
        $(G_WINDOW).on('hashchange', Router.diff);
        Router.diff();
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
        var Router_Update = function(path, params, loc, replace) {
            path = G_ToUri(path, params);
            if (path != loc.srcQuery) {
                WinHistory[replace ? 'replaceState' : 'pushState'](G_NULL, G_NULL, path);
                Router.diff();
            }
        };
        /*#if(modules.tiprouter){#*/
        var Router_Bind = function() {
            var initialURL = Router_WinLoc.href;
            var lastHref = initialURL;
            var newHref, suspend;
            $(G_WINDOW).on('popstate', function(e) {
                newHref = Router_WinLoc.href;
                var initPop = !Router_DidUpdate && newHref == initialURL;
                Router_DidUpdate = 1;
                if (initPop || suspend) return;
                if (newHref != lastHref) {
                    e = {
                        backward: function() {
                            suspend = G_EMPTY;
                            history.replaceState(G_NULL, G_NULL, lastHref);
                        },
                        forward: function() {
                            lastHref = newHref;
                            suspend = G_EMPTY;
                            Router.diff();
                        },
                        prevent: function() {
                            suspend = 1;
                        }
                    };
                    Router.fire('change', e);
                    if (!suspend) {
                        e.forward();
                    }
                }
            });
        };
        /*#}else{#*/
        var Router_Bind = function() {
            var initialURL = Router_WinLoc.href;
            $(G_WINDOW).on('popstate', function() {
                var initPop = !Router_DidUpdate && Router_WinLoc.href == initialURL;
                Router_DidUpdate = 1;
                if (initPop) return;
                Router.diff();
            });
            Router.diff();
        };
        /*#}#*/
        /*#if(!modules.forceEdgeRouter){#*/
    }
    /*#}#*/
    /*#}#*/
    /*#}#*/
    Inc('../tmpl/router');
    Inc('../tmpl/vframe');
    var Body_DOMGlobalProcessor = function(e, d) {
        d = e.data;
        G_ToTry(d.f, e, d.v);
    };
    var Body_DOMEventLibBind = function(node, type, cb, remove, selector, scope) {
        if (remove) {
            $(node).off(type, selector, cb);
        } else {
            $(node).on(type, selector, scope, cb);
        }
    };
    Inc('../tmpl/body');
    Inc('../tmpl/tmpl');
    Inc('../tmpl/updater');
    /*#if(modules.fullstyle){#*/
    var View_Style_Cache = new G_Cache(15, 5, function(key) {
        $(G_HashKey + key).remove();
    });
    var View_ApplyStyle = function(key, css) {
        if (css) {
            if (!View_Style_Cache.has(key)) {
                $('head').append('<style id="' + key + '">' + css + '</style>');
            }
            View_Style_Cache.num(key, 1);
            //$(node).addClass(key);
        }
    };
    var View_RemoveStyle = function(key) {
        if (key) {
            //$(node).removeClass(key);
            View_Style_Cache.num(key);
        }
    };
    /*#}#*/

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
    /*#if(modules.core){#*/
    coreDefaultView = View.extend(
        /*#if(!modules.autoEndUpdate){#*/
        {
            render: function() {
                this.endUpdate();
            }
        }
        /*#}#*/
    );
    /*#}#*/
    return Magix;
})();