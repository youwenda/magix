define("app/views/coms/pagination",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div id=\"p1_<%=id%>\" style=\"margin:50px;\"></div>",
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
});