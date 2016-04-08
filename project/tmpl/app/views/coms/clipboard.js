/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@../demos/editable.css');
var Clipboard = require('@coms/clipboard/index');
var Dialog = require('@coms/dialog/index');
module.exports = Magix.View.extend({
    tmpl: '@clipboard.html',
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    'copy<click>': function(e) {
        var me = this;
        var r = Clipboard.copy('cb' + e.params.id + '_' + me.id);
        Dialog.alert(me, r ? '成功' : '失败');
        me.clearSelection();
    }
});