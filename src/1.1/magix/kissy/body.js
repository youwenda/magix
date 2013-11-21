/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/body', function(S, Magix) {
    eval(Magix.include('../tmpl/body'));
    Body.lib = function(remove, node, type) {
        S.use('event', function(S, SE) {
            var fn = remove ? SE.undelegate : SE.delegate;
            fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
        });
    };
    Body.special(Magix.listToMap('focusin,focusout,mouseenter,mouseleave,mousewheel'));
    return Body;
}, {
    requires: ['magix/magix']
});