/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version edge
 **/
KISSY.add('magix', function(S, SE, DOM) {
    if (typeof DEBUG == 'undefined') DEBUG = true;

    var G_NOOP = S.noop;
    var $ = S.all;
    var G_IsObject = S.isObject;
    var G_IsArray = S.isArray;
    Inc('../tmpl/variable');
    Inc('../tmpl/cache');
    var G_Require = function(name, fn) {
        S.use(name && (name + G_EMPTY), function(S) {
            if (fn) {
                fn.apply(S, G_Slice.call(arguments, 1));
            }
        });
    };
    var G_Define = function(mId, value) {
        S.add(mId, function() {
            return value;
        });
    };
    var G_Extend = S.extend;
    var G_HTML = function(node, html, vId) {
        G_DOC.fireHandler('htmlchange', {
            vId: vId
        });
        S.one(node).html(html);
        G_DOC.fireHandler('htmlchanged', {
            vId: vId
        });
    };
    var G_TargetMatchSelector = DOM.test;
    var G_DOMGlobalProcessor = function(e, d) {
        d = this;
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
        selector = Specials[type] === 1 ? '[mx-' + type + ']' : G_EMPTY;
        if (scope || selector) {
            SE[(remove ? 'un' : G_EMPTY) + 'delegate'](node, type, selector, cb, scope);
        } else {
            SE[remove ? 'detach' : Event_ON](node, type, cb, scope);
        }
    };
    /*#}else{#*/
    var G_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            SE[(remove ? 'un' : G_EMPTY) + 'delegate'](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : Event_ON](node, type, cb, scope);
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
    //var G_IsFunction = S.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
    /*#if(modules.mxViewAttr){#*/
    var G_Trim = S.trim;
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    DOM[G_PROTOTYPE].invokeView = function(name, args) {
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
        G_DOC.fireHandler('htmlchange', {
            target: node,
            vId: vId
        });
    };
    /*#}#*/
    Inc('../tmpl/partial');
    Inc('../tmpl/updater');
    /*#}#*/
    Inc('../tmpl/view');

    /*#if(modules.service){#*/
    var G_Type = S.type;
    var G_Proxy = S.bind;
    var G_Now = S.now;
    Inc('../tmpl/service');
    /*#}#*/
    Inc('../tmpl/base');
    /*#if(modules.defaultView){#*/
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