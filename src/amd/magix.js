/*
    author:xinglie.lkf@taobao.com
 */
define('magix', ['$'], function($) {
    if (typeof DEBUG == 'undefined') DEBUG = true;
    var G_IsObject = $.isPlainObject;
    var G_IsArray = $.isArray;
    var G_NOOP = function() {};
    Inc('../tmpl/variable');
    Inc('../tmpl/cache');
    /*#if(modules.defaultView){#*/
    var G_DefaultView;
    /*#}#*/
    var G_Require = function(name, fn) {
        if (name) {
            /*#if(modules.defaultView){#*/
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
    var G_Define = function(mId, value) {
        define(mId, function() {
            return value;
        });
    };
    Inc('../tmpl/extend');
    var G_HTML = function(node, html, vId) {
        G_DOC.triggerHandler({
            type: 'htmlchange',
            vId: vId
        });
        $(node).html(html);
        G_DOC.triggerHandler({
            type: 'htmlchanged',
            vId: vId
        });
    };

    var G_SelectorEngine = $.find || $.zepto;
    var G_TargetMatchSelector = G_SelectorEngine.matchesSelector || G_SelectorEngine.matches;
    var G_DOMGlobalProcessor = function(e, d) {
        d = e.data;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    /*#if(modules.eventEnterLeave){#*/
    var Specials = {
        mouseenter: 1,
        mouseleave: 1,
        pointerenter: 1,
        pointerleave: 1
    };
    var G_DOMEventLibBind = function(node, type, cb, remove, scope, selector) {
        if (scope) {
            type += '.' + scope.i;
        }
        selector = Specials[type] === 1 ? '[mx-' + type + ']' : G_EMPTY;
        if (remove) {
            $(node).off(type, selector, cb);
        } else {
            $(node).on(type, selector, scope, cb);
        }
    };
    /*#}else{#*/
    var G_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            type += '.' + scope.i;
        }
        if (remove) {
            $(node).off(type, cb);
        } else {
            $(node).on(type, scope, cb);
        }
    };
    /*#}#*/
    Inc('../tmpl/safeguard');
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.state){#*/
    Inc('../tmpl/state');
    /*#}#*/
    /*#if(modules.router){#*/
    //var G_IsFunction = $.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
    /*#if(modules.mxViewAttr){#*/
    var G_Trim = $.trim;
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    $.fn.invokeView = function(name, args) {
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
    /*#}#*/
    Inc('../tmpl/body');
    /*#if(modules.updater){#*/
    Inc('../tmpl/tmpl');
    /*#if(modules.updaterIncrement){#*/
    Inc('../tmpl/increment');
    var Updater_Increment = function(node, html, vId) {
        Increment(node, html);
        G_DOC.triggerHandler({
            vId: vId,
            type: 'htmlchange',
            target: node
        });
    };
    /*#}#*/
    Inc('../tmpl/partial');
    Inc('../tmpl/updater');
    /*#}#*/
    Inc('../tmpl/view');
    /*#if(modules.service){#*/
    var G_Type = $.type;
    var G_Proxy = $.proxy;
    var G_Now = $.now || Date.now;
    Inc('../tmpl/service');
    /*#}#*/
    Inc('../tmpl/base');
    return Magix;
});