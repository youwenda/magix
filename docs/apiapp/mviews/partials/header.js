/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/header', function(S, View, Crox, MM, Magix) {
    return View.extend({
        init: function() {
            this.observeLocation({
                path: true,
                keys: 'q'
            });
        },
        updateUI: function(data) {
            var me = this;
            data.viewId = me.id;
            data.q = me.location.get('q');
            var html = Crox.render(me.template, data);
            me.setViewHTML(me.id, html);
        },
        render: function() {
            var me = this;
            var loc = me.location;
            var data = {};
            if (loc.path == '/home') {
                data.isHome = true;
                me.updateUI(data);
            } else if (S.endsWith(loc.path, '/index')) {
                data.isIndex = true;
                me.updateUI(data);
            } else {
                MM.fetchAll({
                    name: 'Class_List'
                }, function(e, m) {
                    if (e) {
                        me.setViewHTML(me.id, e.msg);
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
        'toggleMenu<click>': function(e) {
            var menu = S.one('.menu-extended');
            if (!menu) {
                this.$dropShown = false;
                return;
            }
            var height = menu.height();
            if (!height) {
                var h = (e.params.ver == '1.0' || e.params.ver == '1.1') ? 234 : 280;
                menu.animate({
                    height: h
                }, 0.4, 'easeOut');
                this.$dropShown = true;
            } else {
                menu.animate({
                    height: '0'
                }, 0.4, 'easeBoth');
                this.$dropShown = false;
            }
        },
        'search<click,keydown>': function(e) {
            if (e.type == 'keydown') {
                if (e.keyCode == 13) {
                    this.search();
                }
            } else {
                this.search();
            }
        },
        '$root<click>': function(e) {
            if (this.$dropShown && !this.inside(e.target)) {
                this['toggleMenu<click>']();
            }
        }
    });
}, {
    requires: ['magix/view', 'apiapp/helpers/crox', 'apiapp/models/manager', 'magix/magix']
});