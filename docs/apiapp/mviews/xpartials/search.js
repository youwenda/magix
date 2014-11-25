/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/xpartials/search', function(S, View, MM, Crox, Magix) {
    return View.extend({
        init: function(extra) {
            this.q = extra.q;
        },
        render: function() {
            var me = this;
            var val = me.q;
            if (val) {
                if (me.$lastSearch) {
                    me.$lastSearch.stop();
                }
                me.$lastSearch = MM.searchInfos(val, function(e, m) {
                    if (e) {
                        me.setViewHTML(me.id, e.msg);
                    } else {
                        console.log(m);
                        me.setViewHTML(me.id, Crox.render(me.tmpl, {
                            search: m,
                            infos: Magix.local('APIPathInfo')
                        }));
                    }
                }, me);
            } else {
                me.setViewHTML('多少搜点东西吧~');
            }
        },
        'to<click>': function(e) {
            var node = S.one('#' + e.params.to);
            if (node) {
                S.DOM.scrollTop(node.offset().top - 50);
                var cnt = node.parent('.list');
                cnt.css({
                    backgroundColor: '#fff'
                }).animate({
                    backgroundColor: '#FF8400'
                }, 0.3).animate({
                    backgroundColor: '#fff'
                }, 0.3).animate({
                    backgroundColor: '#FF8400'
                }, 0.3).animate({
                    backgroundColor: '#fff'
                }, 0.3);
            }
        }
    });
}, {
    requires: ['magix/view', 'apiapp/models/manager', 'apiapp/helpers/crox', 'magix/magix']
});