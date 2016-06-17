define('app/views/demos/autokeys',['magix'],function(require){
/*Magix*/
/*
    author:xinglie.lkf@taobao.com
 */
var Magix=require('magix');
Magix.applyStyle('mp-302',"");
return Magix.View.extend({
    tmpl:"<%for(var i=0;i<a.length;i++)%> <%=a[i];%><div><a></a><%}%><div keys=\"list,b\" <%if(){%> class=\"<%=class1%>\" <%}%>><%for(var i=0;i<a.length;i++)%> <%=a[i];%> <%}for(var i=0;i<b.length;i++)%> <%=a[i];%> <%}%></div><%var a=list%><div><%=a%></div><%=list%> <%=list2%> <%for(var i=0;i<a.length;i++){%> <%=b[i]%> <%}%><div mx-guid=\"xa501-\u001f\">{{#list}} {{name}} {{/list}}</div></div>",
tmplData:[{"keys":["list","name"],"selector":"div[mx-guid=\"xa501-\u001f\"]"}],
    render:function(){
        var me=this;
        
    }
});
});