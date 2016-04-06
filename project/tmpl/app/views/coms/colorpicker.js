/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@colorpicker.html',
    render: function() {
        var me = this;
        me.data.digest();
    },
    'showPicker<click>': function(e) {
        e.preventDefault();
        var ipt = e.current;
        this.colorpicker({
            ownerNodeId: ipt.id || (ipt.id = Magix.guid('cp_')),
            dock: e.params.dock,
            color: ipt.innerHTML,
            picked: function(e) {
                ipt.innerHTML = e.color;
            }
        });
    }
});