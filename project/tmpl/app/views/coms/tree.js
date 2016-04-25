/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@tree.html',
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
        me.request().all(['list', 'code'], function(err, bag, code) {
            me.tree('tree_' + me.id, {
                list: bag.get('data', [])
            });
            me.tree('code_' + me.id, {
                list: code.get('data', []),
                id: 'keyCode',
                pId: 'parentCode',
                text: 'keyName'
            });
        });
    }
});