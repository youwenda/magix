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
        me.data.digest();
        me.mountMain();
        me.resize();
    },
    resize: function() {
        $('#inmain').css({
            width: $(window).width() - 200
        });
    },
    mountMain: function() {
        console.log('mountMain');
        var vf = Magix.Vframe.get('magix_vf_main');
        var loc = Router.parse();
        vf.mountView('app/views' + loc.path);
    },
    '$win<resize>': function() {
        this.resize();
    }
});