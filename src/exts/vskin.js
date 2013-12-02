/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vskin', function(S, View) {
    var oldLoad = View.prototype.load;
    return View.extend({
        load: function() {
            var me = this;
            var skin = Magix.config('skin');
            var curViewName = me.path.split('/').pop();
            var curViewCss = curViewName + '.css';
            if (me.supportSkins) { //有一些view本身是不需要再额外加载css的，所以我们只处理可能要单独加载css的这一部分
                skin = S.inArray(skin, me.supportSkins) ? skin : 'default';
                S.use('app/theme/' + skin + '/' + curViewCss, function() {
                    oldLoad.call(me);
                });
            } else {
                oldLoad.call(me);
            }
        }
    });
}, {
    requires: ['magix/view']
});