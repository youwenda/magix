/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@menu.html',
    render: function(name) {
        var me = this;
        me.request('render').all(name || 'list', function(err, bag) {
            if (err) {
                me.setHTML(me.id, err.msg);
            } else {
                me.$list = bag.get('data', []);
                me.data.set({
                    id: me.id
                });
                me.data.digest();
                me.menu('m1_' + me.id, {
                    list: bag.get('data', []),
                    width: name ? 360 : 300,
                    picked: function(e) {
                        console.log('menu1', e);
                    }
                });
                me.menu('m2_' + me.id, {
                    width: name ? 300 : 130,
                    list: me.$list = bag.get('data', []),
                    picked: function(e) {
                        console.log('menu1', e);
                    }
                });
            }
        });
    },
    'showContextMenu<contextmenu>': function(e) {
        e.preventDefault();
        this.contextmenu({
            ownerNode: e.current,
            width: 400,
            list: this.$list,
            pageX: e.pageX,
            pageY: e.pageY,
            picked: function(e) {
                console.log('contextmenu', e);
            }
        });
    },
    'changeService<click>': function() {
        this.render('list1');
    }
});