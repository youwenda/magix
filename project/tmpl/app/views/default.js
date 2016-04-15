/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Router = Magix.Router;
module.exports = Magix.View.extend({
    tmpl: '@default.html',
    ctor: function() {
        var me = this;
        me.observe(null, true);
    },
    render: function() {
        var me = this;
        var loc = Router.parse();
        me.data.set({
            mainView: 'app/views' + loc.path
        }).digest();
        me.resize();
    },
    resize: function() {
        $('#inmain').css({
            width: $(window).width() - 200
        });
    },
    '$win<resize>': function() {
        this.resize();
    }
});