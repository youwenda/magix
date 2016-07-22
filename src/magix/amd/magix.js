/*
    author:xinglie.lkf@taobao.com
 */
define('magix', ['$'], function($) {
    var G_Require = function(name, fn) {
        if (name) {
            if (!G_IsArray(name)) {
                name = [name];
            }
            require(name, fn);
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
    Inc('../tmpl/router');
    /*#if(modules.router){#*/
    /*#if(modules.tiprouter){#*/
    Router.bind = function() {
        var lastHash = Router.parse().srcHash;
        var newHash;
        $(G_WINDOW).on('hashchange', function(e, loc) {
            loc = Router.parse();
            newHash = loc.srcHash;
            if (newHash != lastHash) {
                e = {
                    backward: function() {
                        e.p = 1;
                        Router_WinLoc.hash = '#!' + lastHash;
                    },
                    forward: function() {
                        e.p = 1;
                        lastHash = newHash;
                        Router.diff();
                    },
                    prevent: function() {
                        e.p = 1;
                    },
                    location: loc
                };
                Router.fire('change', e);
                if (!e.p) {
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
    Router.bind = function() {
        $(G_WINDOW).on('hashchange', Router.diff);
        Router.diff();
    };
    /*#}#*/
    /*#if(modules.edgerouter){#*/
    var WinHistory = G_WINDOW.history;
    if (WinHistory.pushState) {
        Router.edge = 1;
        Router.update = function(path, params, loc, replace) {
            path = G_ToUri(path, params);
            if (path != loc.srcQuery) {
                WinHistory[replace ? 'replaceState' : 'pushState'](G_NULL, G_NULL, path);
                Router.diff();
                Router.did = 1;
            }
        };
        /*#if(modules.tiprouter){#*/
        Router.bind = function() {
            var initialURL = Router_WinLoc.href;
            var lastHref = initialURL;
            var newHref;
            $(G_WINDOW).on('popstate', function(e) {
                newHref = Router_WinLoc.href;
                var equal = newHref == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                if (newHref != lastHref) {
                    e = {
                        backward: function() {
                            e.p = 1;
                            history.replaceState(G_NULL, G_NULL, lastHref);
                        },
                        forward: function() {
                            e.p = 1;
                            lastHref = newHref;
                            Router.diff();
                        },
                        prevent: function() {
                            e.p = 1;
                        },
                        location: Router.parse()
                    };
                    Router.fire('change', e);
                    if (!e.p) {
                        e.forward();
                    }
                }
            });
        };
        /*#}else{#*/
        Router.bind = function() {
            var initialURL = Router_WinLoc.href;
            $(G_WINDOW).on('popstate', function() {
                var equal = Router_WinLoc.href == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                Router.diff();
            });
            Router.diff();
        };
        /*#}#*/
    }
    /*#}#*/
    /*#}#*/
    Inc('../tmpl/vframe');
    // var Body_DOMGlobalProcessor = function(e, d) {
    //     d = e.data;
    //     G_ToTry(d.f, e, d.v);
    // };
    var Body_DOMEventLibBind = function(node, type, cb, remove) {
        /*if (remove) {
            $(node).off(type, selector, cb);
        } else {
            $(node).on(type, selector, scope, cb);
        }*/
        $(node)[remove ? 'off' : Event_ON](type, cb);
    };
    Inc('../tmpl/body');
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
     */
    Magix.Base = G_NOOP;
    /*#}#*/
    /*#if(modules.core){#*/
    define(MxGlobalView, function() {
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
});