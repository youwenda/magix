define('magix', /*#if(!modules.naked){#*/['$'],/*#}#*/ require => {
    if (typeof DEBUG == 'undefined') window.DEBUG = true;
    /*#if(modules.naked){#*/
    let G_Type = (type) => o => Object.prototype.toString.call(o).slice(8, -1) == type;
    let G_IsObject = G_Type('Object');
    let G_IsArray = G_Type('Array');
    /*#}else{#*/
    let $ = require('$');
    let G_IsObject = $.isPlainObject;
    let G_IsArray = $.isArray;
    /*#}#*/
    Inc('../tmpl/variable');
    Inc('../tmpl/cache');
    /*#if(modules.defaultView){#*/
    let G_DefaultView;
    /*#}#*/
    let G_Require = (name, fn) => {
        if (name) {
            let a = [], n;
            /*#if(modules.defaultView){#*/
            if (MxGlobalView == name) {
                if (!G_DefaultView) {
                    G_DefaultView = View.extend(
                        /*#if(!modules.autoEndUpdate){#*/
                        {
                            render() {
                                this.endUpdate();
                            }
                        }
                        /*#}#*/
                    );
                }
                fn(G_DefaultView);
            } else /*#}#*/
                if (G_WINDOW.seajs) {
                    seajs.use(name, (...g) => {
                        for (let m of g) {
                            a.push(m && m.__esModule && m.default || m);
                        }
                        if (fn) fn(...a);
                    });
                } else {
                    if (!G_IsArray(name)) name = [name];
                    for (n of name) {
                        n = require(n);
                        a.push(n && n.__esModule && n.default || n);
                    }
                    if (fn) fn(...a);
                }
        } else {
            fn();
        }
    };
    Inc('../tmpl/extend');
    /*#if(modules.naked){#*/
    Inc('../tmpl/naked');
    /*#}else{#*/
    /*#if(modules.mxViewAttr){#*/
    let G_Trim = $.trim;
    /*#}#*/
    let G_SelectorEngine = $.find || $.zepto;
    let G_TargetMatchSelector = G_SelectorEngine.matchesSelector || G_SelectorEngine.matches;
    let G_DOMGlobalProcessor = (e, d) => {
        d = e.data;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    /*#if(modules.eventEnterLeave){#*/
    let Specials = {
        mouseenter: 1,
        mouseleave: 1,
        pointerenter: 1,
        pointerleave: 1
    };
    let G_DOMEventLibBind = (node, type, cb, remove, scope, selector) => {
        if (scope) {
            type += `.${scope.i}`;
        }
        selector = Specials[type] === 1 ? `[mx-${type}]` : G_EMPTY;
        if (remove) {
            $(node).off(type, selector, cb);
        } else {
            $(node).on(type, selector, scope, cb);
        }
    };
    /*#}else{#*/
    let G_DOMEventLibBind = (node, type, cb, remove, scope) => {
        if (scope) {
            type += `.${scope.i}`;
        }
        if (remove) {
            $(node).off(type, cb);
        } else {
            $(node).on(type, scope, cb);
        }
    };
    /*#}#*/
    /*#}#*/
    Inc('../tmpl/safeguard');
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.state){#*/
    Inc('../tmpl/state');
    /*#}#*/
    /*#if(modules.router){#*/
    //let G_IsFunction = $.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe&&!modules.naked){#*/
    $.fn.invokeView = function (name, args) {
        let l = this.length;
        if (l) {
            let e = this[0];
            let vf = e.vframe;
            if (args === undefined) {
                return vf && vf.invoke(name);
            } else {
                for (e of this) {
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
    /*#if(!modules.updaterVDOM&&!modules.updaterDOM){#*/
    Inc('../tmpl/tmpl');
    /*#}#*/
    /*#if(modules.updaterVDOM){#*/
    Inc('../tmpl/vdom');
    /*#}else if(modules.updaterDOM){#*/
    Inc('../tmpl/dom');
    /*#}else{#*/
    Inc('../tmpl/partial');
    /*#}#*/
    Inc('../tmpl/updater');
    /*#}#*/
    Inc('../tmpl/view');
    /*#if(modules.service){#*/
    let G_Type = $.type;
    let G_Now = $.now || Date.now;

    Inc('../tmpl/service');
    /*#}#*/
    Inc('../tmpl/base');
    /*#if(modules.naked){#*/
    Magix.trgger = G_Trigger;
    /*#}#*/
    Magix.default = Magix;
    return Magix;
});