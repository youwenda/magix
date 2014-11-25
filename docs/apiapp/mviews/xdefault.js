/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/xdefault', function(S, View, Magix, MM, Crox) {
    var CoreList = [{
        name: 'magix'
    }, {
        name: 'event'
    }, {
        name: 'router'
    }, {
        name: 'vom'
    }, {
        name: 'vframe'
    }, {
        name: 'view'
    }, {
        name: 'model'
    }, {
        name: 'manager'
    }, {
        name: 'request'
    }];

    var CoreListOld = [{
        name: 'magix'
    }, {
        name: 'event'
    }, {
        name: 'router'
    }, {
        name: 'vom'
    }, {
        name: 'vframe'
    }, {
        name: 'view'
    }, {
        name: 'mxview'
    }, {
        name: 'model'
    }, {
        name: 'mmanager'
    }, {
        name: 'mrequest'
    }];
    return View.extend({
        adjust: function() {
            var width = S.DOM.viewportWidth();
            if (width < 1020) {
                S.one('#sidebar').hide();
                S.one('#container').css('margin-left', 0);
            } else {
                S.one('#sidebar').show();
                S.one('#container').css('margin-left', 260);
            }
        },
        render: function() {
            var me = this;
            var pnReg = /\/([^\/]+)\/(\d+\.\d+)\/([^\/]+)/;
            var loc = me.location;
            var infos = loc.path.match(pnReg);
            if (infos) {
                Magix.local('APIPathInfo', {
                    loader: infos[1],
                    ver: infos[2],
                    action: infos[3]
                });
            }
            var r = MM.fetchClassInfos(me);
            console.log(r);
            r.next(function(err, info) {
                console.log(info);
                if (err) {
                    me.setViewHTML(me.id, err.msg);
                } else {
                    r.fetchAll({
                        name: 'Class_List'
                    }, function(e, m) {
                        console.log(m);
                        if (e) {
                            me.setViewHTML(me.id, e.msg);
                        } else {
                            var html = Crox.render(me.tmpl, {
                                coreList: parseFloat(infos[2]) < 1.2 ? CoreListOld : CoreList, // m.get('coreList'),
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
                            me.adjust();
                        }
                    });
                }
            });
        },
        'useOld<click>': function() {
            this.navigate({
                v: 'o'
            });
        },
        'search<keyup>': function(e) {
            var ipt = S.one('#' + e.currentId);
            var v = S.trim(ipt.val());
            var vf = this.vom.get('search');
            if (vf) {
                vf.mountView('apiapp/mviews/xpartials/search', {
                    q: v
                });
            }
        },
        'showSearch<focusin>': function() {
            var later = this.later;
            if (later) {
                later.cancel();
            }
            var node = S.one('#search');
            node.show();
        },
        'hideSearch<focusout>': function() {
            var node = S.one('#search');
            this.later = S.later(function() {
                node.hide();
            }, 150);
        },
        '$win<resize>': function() {
            this.adjust();
        }
    });
}, {
    requires: [
        'magix/view',
        'magix/magix',
        'apiapp/models/manager',
        'apiapp/helpers/crox'
    ]
});