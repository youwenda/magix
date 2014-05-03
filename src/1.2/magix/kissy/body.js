/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add('magix/body', function(S, Magix) {
    eval(Magix.include('../tmpl/body'));
    var Delegates = {
        mouseenter: 2,
        mouseleave: 2
    };
    Body.lib = function(node, type, cb, remove, scope, direct) {
        S.use('event', function(S, SE) {
            var flag = Delegates[type];
            if (!direct && flag == 2) {
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