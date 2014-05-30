/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define("magix/body", function(require) {
    var Magix = require("./magix");
    eval(Magix.include('../tmpl/body'));
    var Delegates = {
        focus: 2,
        blur: 2,
        mouseenter: 2,
        mouseleave: 2
    };
    var G = $.now();
    Body.lib = function(node, type, cb, remove, scope, direct) {
        var flag = Delegates[type];
        if (scope) {
            if (!cb.$n) cb.$n = G--;
            var key = '_$' + cb.$n;
            if (!scope[key]) {
                scope[key] = function() {
                    cb.apply(scope, arguments);
                };
            }
            cb = scope[key];
        }
        if (!direct && flag == 2) {
            $(node)[(remove ? 'un' : EMPTY) + 'delegate']('[mx-' + type + ']', type, cb);
        } else {
            $(node)[remove ? 'off' : On](type, cb);
        }
    };
    return Body;
});