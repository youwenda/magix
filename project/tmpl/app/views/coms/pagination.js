/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@pagination.html',
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
        me.pagination('p1_' + me.id, {
            size: 10,
            total: 300,
            index: 9,
            step:11,
            picked:function(e){
                console.log(e);
            }
        });
    }
});