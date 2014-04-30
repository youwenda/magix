/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add('magix/body', function(S, Magix) {
    eval(Magix.include('../tmpl/body'));
    var Unbubbles = {
        change: 1,
        submit: 1,
        focusin: 1,
        focusout: 1,
        mouseenter: 2,
        mouseleave: 2,
        mousewheel: 1
    };
    Body.special(Unbubbles);
    Body.lib = function(node, type, cb, remove, scope) {
        S.use('event', function(S, SE) {
            var flag = Unbubbles[type];
            if (flag == 2) {
                flag = (remove ? 'un' : '') + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            } else {
                flag = remove ? 'detach' : 'on';
                SE[flag](node, type, cb, scope);
            }
        });
    };
    return Body;
}, {
    requires: ['magix/magix']
});