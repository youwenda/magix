define("app/views/demos/editable",['magix','../../../coms/form/index'],function(require){
/*Magix ,View */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var View = require('../../../coms/form/index');
Magix.applyStyle('mp-638',".mp-638-vm{vertical-align:middle}.mp-638-w100{width:100px}.mp-638-w700{width:700px}.mp-638-m50{margin:50px}.mp-638-w60{width:60px}.mp-638-float{position:fixed;left:1000px;top:100px;border:1px solid #ccc;height:400px;width:200px}.mp-638-sitem{height:26px;line-height:26px;padding:0 10px}.mp-638-fr{float:right}");
return View.extend({
    tmpl: "<div><table class=\"table mp-638-w700 mp-638-m50\"><thead><tr><th>ID</th><th>Name</th><th></th></tr></thead><tbody mx-guid=\"x70a1-\u001f\">@1-\u001f</tbody></table></div>",
tmplData:[{"guid":1,"keys":["list"],"tmpl":"\n        <%for(var i=0;i<list.length;i++){%>\n        <%var item=list[i]%>\n        <tr><td>\n                <%if(item.editable){%>\n                    <input class=\"input mp-638-w60\" value=\"<%=item.id%>\" mx-change=\"setValue({path:'list.<%=item.index%>.id'})\" />\n                <%}else{%>\n                    <%=item.id%>\n                <%}%>\n            </td><td>\n                <%if(item.editable){%>\n                    <input class=\"input mp-638-w100\" value=\"<%=item.name%>\" mx-change=\"setValue({path:'list.<%=item.index%>.name'})\" />\n                <%}else{%>\n                    <%=item.name%>\n                <%}%>\n            </td><td><div class=\"operation\">\n                    <%if(item.editable){%>\n                    <a href=\"javascript:;\" mx-click=\"save({index:<%=item.index%>})\">保存</a>\n                    <%}else{%>\n                    <a href=\"javascript:;\" mx-click=\"edit({index:<%=item.index%>})\">编辑</a>\n                    <%}%>\n                </div></td></tr>\n        <%}%>\n    ","selector":"tbody[mx-guid=\"x70a1-\u001f\"]","attrs":[]}],
    ctor: function() {
        var list = [];
        for (var i = 0; i < 10; i++) {
            list.push({
                index: i,
                name: 'name-' + i,
                id: 'id-' + i
            });
        }
        this.data.set({
            list: list
        });
    },
    render: function() {
        var me = this;
        me.data.digest();
    },
    'edit<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var list = data.get('list');
        var item = list[e.params.index];
        item.editable = true;
        data.set({
            list: list
        }).digest();
    },
    'save<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var list = data.get('list');
        var item = list[e.params.index];
        delete item.editable;
        data.set({
            list: list
        }).digest();
    }
});
});