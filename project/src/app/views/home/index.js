define("app/views/home/index",['magix'],function(require){
/*Magix*/
/*
    author:xinglie.lkf@taobao.com
 */
var Magix=require('magix');
return Magix.View.extend({
    tmpl:"magix view index.html\n\n{{#each articles.[10].[#comments]}}\n  <h1>{{subject}}</h1><div>\n    {{body}}\n  </div>\n{{/each}}",
    render:function(){
        var me=this;
        me.setHTML(me.id,me.tmpl);
    }
});
});