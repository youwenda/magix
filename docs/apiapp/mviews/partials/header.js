/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/header', function(S, View, Crox, MM, Magix) {
    return View.extend({
        init: function() {
            this.observeLocation({
                pathname: true,
                keys: 'q'
            });
        },
        updateUI: function(data) {
            var me = this;
            data.viewId = me.id;
            data.q = me.location.get('q');
            var html = Crox.render(me.template, data);
            me.setViewHTML(html);
        },
        render: function() {
            var me = this;
            var loc = me.location;
            var data = {};
            if (loc.pathname == '/home') {
                data.isHome = true;
                me.updateUI(data);
            } else if (S.endsWith(loc.pathname, '/index')) {
                data.isIndex = true;
                me.updateUI(data);
            } else {
                MM.fetchAll({
                    name: 'Class_List'
                }, function(e, m) {
                    if (e) {
                        me.setViewHTML(e.msg);
                    } else {
                        me.updateUI({
                            coreList: m.get('coreList'),
                            extList: m.get('extList'),
                            infos: Magix.local('APIPathInfo')
                        });
                    }
                }, me);
            }
        },
        search: function() {
            var val = S.one('#' + this.id + '_sipt').val();
            var infos = Magix.local('APIPathInfo');
            this.navigate(['', infos.loader, infos.ver, 'search'].join('/'), {
                q: val
            });
        },
        'toggleMenu<click>': function() {
            var menu = S.one('.menu-extended');
            var height = menu.height();
            if (!height) {
                menu.animate({
                    height: '234px'
                }, 0.4, 'easeOut');
            } else {
                menu.animate({
                    height: '0'
                }, 0.4, 'easeBoth');
            }
        },
        'search<click,keydown>': function(e) {
            if (e.type == 'keydown') {
                if (e.domEvent.keyCode == 13) {
                    this.search();
                }
            } else {
                this.search();
            }
        }
    });
}, {
    requires: ['mxext/view', 'apiapp/helpers/crox', 'apiapp/models/manager', 'magix/magix']
});