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
    Body.lib = function(node, type, remove, cb) {
        S.use('event', function(S, SE) {
            var flag = Unbubbles[type];
            if (flag == 1) {
                flag = remove ? 'detach' : 'on';
                SE[flag](node, type, cb);
            } else {
                flag = (remove ? 'un' : '') + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            }
        });
    };
    return Body;
}, {
    requires: ['magix/magix']
});