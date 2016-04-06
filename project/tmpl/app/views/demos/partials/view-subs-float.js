/*
    author:xinglie.lkf@taobao.com
 */
'ref@../view-subs.css';
var Magix = require('magix');
var Types = [{
    id: 'left',
    text: '左边'
}, {
    id: 'top',
    text: '上边'
}, {
    id: 'right',
    text: '右边'
}, {
    id: 'bottom',
    text: '下边'
}];
module.exports = Magix.View.extend({
    tmpl: '@view-subs-float.html',
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
        me.dropdown('pos_' + me.id, {
            list: Types,
            width: 210,
            picked: function(e) {
                console.log(e);
                me.renderByType(e.id);
            }
        });
    }
});