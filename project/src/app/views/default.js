define('app/views/default',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Router = Magix.Router;
var ShrinkCSS = 'mp-286-shrink';
return Magix.View.extend({
    tmpl: "<div mx-view=\"app/views/partials/header\" mx-togglesidebar=\"resizeMain()\"></div><div class=\"inmain\" id=\"inmain\"><div mx-guid=\"xd971-\u001f\" mx-view=\"<%=mainView%>\" t=\"<%=mainView%>\"><div class=\"loading\"><span></span></div></div></div>",
tmplData:[{"keys":["mainView"],"selector":"div[mx-guid=\"xd971-\u001f\"]","attrs":[{"n":"t","v":"<%=mainView%>"}],"view":"<%=mainView%>"}],
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
    },
    resize: function() {
        var main = $('#inmain');
        var left = $('#inmain').hasClass(ShrinkCSS) ? 200 : 0;
        main.css({
            width: $(window).width() - left
        });
    },
    'resizeMain<toggleSidebar>': function(e) {
        this.resize();
    },
    '$win<resize>': function() {
        this.resize();
    }
});
});