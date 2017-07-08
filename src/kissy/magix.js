/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version edge
 **/
KISSY.add('magix', function(S, SE, DOM) {
    if (typeof DEBUG == 'undefined') DEBUG = true;

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
    var G_HTML = function(node, html) {
        S.one(node).html(html);
        G_DOC.fireHandler('htmlchange', {
            target: node
        });
    };
    var G_TargetMatchSelector = DOM.test;
    var G_DOMGlobalProcessor = function(e, d) {
        d = this;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    };
    var G_DOMEventLibBind = function(node, type, cb, remove, scope) {
        if (scope) {
            SE[(remove ? 'un' : G_EMPTY) + 'delegate'](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : Event_ON](node, type, cb, scope);
        }
    };

    Inc('../tmpl/safeguard');
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.state){#*/
    Inc('../tmpl/state');
    /*#}#*/
    /*#if(modules.router){#*/
    var G_IsFunction = S.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
    /*#if(modules.mxViewAttr){#*/
    var G_Trim = S.trim;
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    DOM[G_PROTOTYPE].invokeView = function() {
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