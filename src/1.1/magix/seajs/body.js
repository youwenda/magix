/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define("magix/body", ["magix/magix"], function(require) {
    var Magix = require("magix/magix");
    eval(Magix.include('../tmpl/body'));
    var Unbubbles = {
        focus: 2,
        blur: 2,
        mouseenter: 2,
        mouseleave: 2
    };
    Body.special(Unbubbles);
    Body.lib = function(node, type, remove, cb) {
        var flag = Unbubbles[type];
        if (flag == 1) {
            $(node)[remove ? 'off' : 'on'](type, cb);
        } else {
            $(node)[(remove ? 'un' : '') + 'delegate']('[mx-' + type + ']', type, cb);
        }
    };
    return Body;
});