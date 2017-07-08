module.exports = (function() {
    if (typeof DEBUG == 'undefined') DEBUG = true;

    var $ = require('$');
    var G_NOOP = function() {};
    var G_IsFunction = $.isFunction;
    /*#if(modules.defaultView){#*/
    var coreDefaultView;
    /*#}#*/
    var G_Require = function(name, fn) {
        var views = Magix_Cfg.views || G_NOOP;
        /*#if(modules.defaultView){#*/
        if (!views[MxGlobalView]) views[MxGlobalView] = coreDefaultView;
        /*#}#*/
        if (!name) {
            return fn();
        }
        if (!G_IsArray(name)) {
            name = [name];
        }
        var results = [],
            view;
        var promiseCount = 0;
        var checkCount = function() {
            if (!promiseCount) {
                fn.apply(Magix, results);
            }
        };
        var promise = function(p, idx, fn) {
            fn = function(v) {
                if (!results[idx]) {
                    promiseCount--;
                    results[idx] = v;
                    checkCount();
                }
            };
            p = p(fn);
            if (p.then) {
                p.then(fn);
            }
        };
        for (var i = 0; i < name.length; i++) {
            view = views[name[i]];
            if (G_IsFunction(view) && !view.extend) {
                promiseCount++;
                promise(view, i);
            } else {
                results[i] = views[name[i]];
            }
        }
        checkCount();
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
    /*#if(modules.defaultView){#*/
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