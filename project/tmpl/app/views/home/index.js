/*
    author:xinglie.lkf@taobao.com
 */
var Magix=require('magix');
module.exports=Magix.View.extend({
    tmpl:'@index.html',
    render:function(){
        var me=this;
        me.setHTML(me.id,me.tmpl);
    }
});