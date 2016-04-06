var Magix = require('magix');
var Menu = require('./index');
var $ = require('$');
var Base = Menu.prototype;
module.exports = Menu.extend({
    update: function(ops) {
        var me = this;
        if (!ops) ops = {};
        ops.isChild = true;
        Base.update.call(me, ops);
        me.$shown = false;
    },
    hide: function() {
        var me = this;
        console.log('hide');
        Base.hide.call(me);
        if (me.$shown && !me.$pNode) {
            me.$shown = false;
            var node = $('#' + me.id + ' div');
            node.css({
                left: -10000
            });
        }
    }
}, {
    show: function(view, e) {
        var node = e.ownerNode;
        var id = node.id || (node.id = Magix.guid('ctx'));
        id = 'ctx_' + id;
        var vf = Magix.Vframe.get(id);
        if (vf) {
            vf.invoke('show', [e], true);
        } else {
            $('body').append('<div id="' + id + '" />');
            vf = view.owner.mountVframe(id, 'coms/menu/context');
            vf.invoke('update', [e], true);
            vf.invoke('show', [e], true);
        }
    }
});