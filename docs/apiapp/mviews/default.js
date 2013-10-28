/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/default', function(S, View, Magix, VOM) {
    var NonClass = {
        index: 1,
        search: 1
    };
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
            me.mountMainVframe();
        },
        mountMainVframe: function() {
            var pnReg = /\/([^\/]+)\/(\d+\.\d+)\/([^\/]+)/;
            var loc = this.location;
            var infos = loc.pathname.match(pnReg);
            var vf = VOM.get('magix_vf_main');
            if (infos) {
                Magix.local('APIPathInfo', {
                    loader: infos[1],
                    ver: infos[2],
                    action: infos[3]
                });
                var view = infos[3];
                if (!NonClass[view]) {
                    view = 'class';
                }
                vf.mountView('apiapp/mviews/partials/' + view);
            } else {
                vf.mountView('apiapp/mviews/partials/home');
            }
        },
        locationChange: function() {
            this.mountMainVframe();
        }
    });
}, {
    requires: ['magix/view', 'magix/magix', 'magix/vom']
});