define('app/views/demos/index',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-afd',".mp-afd-w900{color:red}.mp-afd-w500{color:green}.content .mp-afd-w500{color:#ff0}");
return Magix.View.extend({
    tmpl: "<div class=\"<%=cls%>\" mx-guid=\"xce21-\u001f\">响应式测试</div>",
tmplData:[{"keys":["cls"],"selector":"div[mx-guid=\"xce21-\u001f\"]","attrs":[{"n":"className","v":"<%=cls%>","p":1}]}],
    render: function() {
        var me = this;
        me.update();
    },
    update: function() {
        var width = $(window).width();
        var data = this.data;
        if (width > 500) {
            data.set({
                cls: 'mp-afd-w900'
            });
        } else {
            data.set({
                cls: 'mp-afd-w500'
            });
        }
        data.digest();
    },
    '$win<resize>': function() {
        this.update();
    }
});
});