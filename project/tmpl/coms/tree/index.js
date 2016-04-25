/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@index.css');
module.exports = Magix.View.extend({
    tmpl: '@index.html',
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    update: function(ops) {
        var me = this;
        var info = me.listToTree(ops.list, ops.id, ops.pId);
        me.$info = info;
        me.owner.mountVframe('tree_' + me.id, '@./branch', {
            id: ops.id || 'id',
            pId: ops.pId || 'pId',
            text: (ops.text || 'text')
        });
    },
    getList: function() {
        return this.$info.list;
    }
});