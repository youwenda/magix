/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/index', function(S, View, MM, Crox, Magix) {
    return View.extend({
        render: function() {
            var me = this;
            var r = MM.fetchClassInfos(me);
            console.log(r);
            r.next(function(err, info) {
                if (err) {
                    me.setViewHTML(me.id, err.msg);
                } else {
                    r.fetchAll({
                        name: 'Class_List'
                    }, function(e, m) {
                        if (e) {
                            me.setViewHTML(me.id, e.msg);
                        } else {
                            var html = Crox.render(me.tmpl, {
                                coreList: m.get('coreList'),
                                extList: m.get('extList'),
                                infos: Magix.local('APIPathInfo'),
                                extInfo: function(name) {
                                    console.log(info, name, info.map[name]);
                                    var i = info.map[name];
                                    if (i) {
                                        return i.get('desc') || name;
                                    }
                                    return 'unfound';
                                }
                            });
                            me.setViewHTML(me.id, html);
                        }
                    });
                }
            });
        }
    });
}, {
    requires: ['magix/view', 'apiapp/models/manager', 'apiapp/helpers/crox', 'magix/magix']
});