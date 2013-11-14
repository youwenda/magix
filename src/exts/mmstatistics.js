/*
    author:xinglie.lkf@taobao.com
    接口请求统计插件
 */
KISSY.add('exts/mmstatistics', function(S, MM, AOP) {
    var MS = {

    };
    var OnInit = function(e) {
        MS[this.id][e.meta.name] = new Date();
    };
    var OnDone = function(e) {
        console.log(e, 'bbbbbbbbbbbbbbbbbbbbb');
        console.log(e.meta.name, new Date() - MS[this.id][e.meta.name]);
    };
    AOP.hook(MM, 'create', {
        after: function(mm) {
            MS[mm.id] = {

            };
            mm.on('inited', OnInit);
            mm.on('done', OnDone);
        }
    });
}, {
    requires: ['mxext/mmanager', 'exts/aop']
});