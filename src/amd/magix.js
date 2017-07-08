/*
    author:xinglie.lkf@taobao.com
 */
define('magix', ['$'], function($) {
    if (typeof DEBUG == 'undefined') DEBUG = true;

    var G_NOOP = function() {};
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
    Inc('../tmpl/extend');
    var G_IsObject = $.isPlainObject;
    var G_IsArray = $.isArray;
    var G_HTML = function(node, html) {
        $(node).html(html);
        G_DOC.triggerHandler({
            type: 'htmlchange',
            target: node
        });
    };

    var G_SelectorEngine = $.find || $.zepto;
    var G_TargetMatchSelector = G_SelectorEngine.matchesSelector || G_SelectorEngine.matches;
    var G_DOMGlobalProcessor = function(e, d) {
        d = e.data;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
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
    Inc('../tmpl/safeguard');
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.state){#*/
    Inc('../tmpl/state');
    /*#}#*/
    /*#if(modules.router){#*/
    var G_IsFunction = $.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
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
    Inc('../tmpl/body');
    /*#if(modules.updater){#*/
    Inc('../tmpl/tmpl');
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