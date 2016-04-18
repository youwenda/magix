define("app/views/default",['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Router = Magix.Router;
return Magix.View.extend({
    tmpl: "<div mx-view=\"app/views/partials/header\"></div><div class=\"inmain\" id=\"inmain\" <%if(!window['100']){%>pm-hide=\"true\"<%}%>><div mx-guid=\"xd971-\u001f\" mx-view=\"<%=mainView%>\"><div class=\"loading\"><span></span></div></div></div>",
tmplData:[{"keys":["mainView"],"selector":"div[mx-guid=\"xd971-\u001f\"]","view":"<%=mainView%>"}],
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
});