define('app/views/coms/index',['magix'],function(require){
/*Magix*/
/*
    author:xinglie.lkf@taobao.com
 */
var Magix=require('magix');
return Magix.View.extend({
    tmpl:"magix view index",
    render:function(){
        var me=this;
        me.setHTML(me.id,me.tmpl);
    }
});
});