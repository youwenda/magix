define('app/views/home/index',['magix'],function(require){
/*Magix*/
/*
    author:xinglie.lkf@taobao.com
 */
var Magix=require('magix');
return Magix.View.extend({
    tmpl:"magix view index.html {{#each articles.[10].[#comments]}}<h1>{{subject}}</h1><div>{{body}}</div>{{/each}}",
    render:function(){
        var me=this;
        me.setHTML(me.id,me.tmpl);
    }
});
});