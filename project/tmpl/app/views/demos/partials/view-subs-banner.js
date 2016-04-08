/*
    author:xinglie.lkf@taobao.com
 */
'ref@../view-subs.css';
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@view-subs-banner.html',
    render: function() {
        var me = this;
        setTimeout(function(){
            me.data.digest();
        },10000);
    }
});