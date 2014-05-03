/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define("magix/body", ["magix/magix"], function(require) {
    var Magix = require("magix/magix");
    eval(Magix.include('../tmpl/body'));
    var Delegates = {
        focus: 2,
        blur: 2,
        mouseenter: 2,
        mouseleave: 2
    };
    Body.lib = function(node, type, cb, remove, scope, direct) {
        var flag = Delegates[type];
        if (scope && !cb.$fn) {
            cb.$fn = function() {
                cb.apply(scope, arguments);
            };
        }
        if (cb.$fn) cb = cb.$fn;
        if (!direct && flag == 2) {
            $(node)[(remove ? 'un' : '') + 'delegate']('[mx-' + type + ']', type, cb);
        } else {
            $(node)[remove ? 'off' : 'on'](type, cb);
        }
    };
    return Body;
});