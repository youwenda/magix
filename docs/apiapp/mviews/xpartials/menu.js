/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/xpartials/menu', function(S, View, MM, Crox) {
    return View.extend({
        init: function(extra) {
            var me = this;
            me.name = extra.name;
        },
        render: function() {
            var me = this;
            var r = MM.fetchClassInfos(me);
            r.next(function(e, i) {
                if (e) {
                    me.setViewHTML(me.id, e.msg);
                } else {
                    var m = i.map[me.name];
                    if (m) {
                        var html = Crox.render(me.tmpl, m.get());
                        me.setViewHTML(me.id, html);
                    }
                }
            });
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
    requires: [
        'magix/view',
        'apiapp/models/manager',
        'apiapp/helpers/crox'
    ]
});