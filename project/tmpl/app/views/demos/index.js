/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@index.css');
module.exports = Magix.View.extend({
    tmpl: '@index.html',
    render: function() {
        var me = this;
        me.update();
    },
    update: function() {
        var width = $(window).width();
        var data = this.data;
        if (width > 500) {
            data.set({
                cls: '@index.css:w900'
            });
        } else {
            data.set({
                cls: '@index.css:w500'
            });
        }
        data.digest();
    },
    '$win<resize>': function() {
        this.update();
    }
});