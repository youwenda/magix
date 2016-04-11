/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@inputmask.html',
    render: function() {
        var me = this;
        me.data.digest();
    }
});