/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/body", ["magix/magix"], function(Magix) {
    eval(Magix.include('../tmpl/body'));
    var Unbubbles = {
        focus: 2,
        blur: 2,
        mouseenter: 2,
        mouseleave: 2
    };
    Body.special(Unbubbles);
    Body.lib = function(node, type, remove, cb) {
        $(node)[(remove ? 'un' : '') + 'delegate']('[mx-' + type + ']', type, cb);
    };
    return Body;
});