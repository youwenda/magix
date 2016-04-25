define('app/views/demos/partials/view-subs-float',['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */

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
return Magix.View.extend({
    tmpl: "<div class=\"mp-514-form-item\"><div class=\"mp-514-title\">弹出位置</div><div class=\"mp-514-content\" id=\"pos_<%=id%>\"></div></div>",
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
});