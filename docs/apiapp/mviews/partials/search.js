/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/search', function(S, View, MM, Crox, Magix) {
    return View.extend({
        init: function() {
            this.observeLocation('q');
        },
        render: function() {
            var me = this;
            var loc = me.location;
            var val = loc.get('q');
            if (val) {
                if (me.$lastSearch) {
                    me.$lastSearch.stop();
                }
                me.$lastSearch = MM.searchInfos(val, function(e, m) {
                    if (e) {
                        me.setViewHTML(me.id, e.msg);
                    } else {
                        me.setViewHTML(me.id, Crox.render(me.template, {
                            search: m,
                            infos: Magix.local('APIPathInfo')
                        }));
                    }
                }, me);
            } else {
                me.setViewHTML('多少搜点东西吧~');
            }
        }
    });
}, {
    requires: ['magix/view', 'apiapp/models/manager', 'apiapp/helpers/crox', 'magix/magix']
});