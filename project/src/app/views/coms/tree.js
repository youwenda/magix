define("app/views/coms/tree",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div mx-guid=\"x7931-\u001f\" class=\"tree <%=a%>-def\" title=\"<%=b%>\" mx-view1=\"a/b?s=<%=b%>\">@1-\u001f</div><textarea mx-guid=\"x7932-\u001f\" <%if(checked){%>disabled<%}%>><%=a%>-<%=b%></textarea>\n<%for(var i=0;i<10;i++){%>\n<div mx-view=\"coms/dropdown/index?source=script&selected=<%=a%>\"><script type=\"text/magix\">\n        [{\"id\":\"<%=a%>\",\"text\":\"a-<%=a%>\"},{\"id\":\"<%=b%>\",\"text\":\"b-<%=b%>\"}]\n    </script></div>\n<%}%>\n<div mx-guid=\"x7933-\u001f\" style=\"height:<%=height+20%>px;background: red\"></div><input mx-guid=\"x7934-\u001f\" value=\"<%=a%>-<%=b%>\" /><input type=\"checkbox\" id=\"cb_<%=a%>\" mx-guid=\"x7935-\u001f\" /><label for=\"cb_<%=a%>\" mx-guid=\"x7936-\u001f\">abcdefg</label><input type=\"checkbox\" mx-guid=\"x7937-\u001f\" <%if(checked){%>disabled<%}%> <%if(checked){%>checked<%}%> /><input type=\"radio\" mx-guid=\"x7938-\u001f\" <%if(checked){%>checked<%}%> /><div mx-guid=\"x7939-\u001f\" checked=\"<%=checked%>\" value=\"<%=a+'_'+b%>\">test value</div><button mx-guid=\"x79310-\u001f\" mx-click=\"change({a:'<%=a%>',b:'<%=b%>'})\" class=\"btn\" >change a and b</button><div mx-guid=\"x79311-\u001f\">@7-\u001f</div><button class=\"btn\" mx-click=\"changeMap()\"> change pmap</button>",
tmplData:[{"guid":1,"keys":["a","b"],"tmpl":"\n    <%=a%>-<%=b%>\n","selector":"div[mx-guid=\"x7931-\u001f\"]","attrs":[{"n":"className","v":"tree <%=a%>-def"},{"n":"title","v":"<%=b%>"},{"n":"mx-view1","v":"a/b?s=<%=b%>"}]},{"keys":["a","b","checked"],"selector":"textarea[mx-guid=\"x7932-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":true},{"n":"value","v":"<%=a%>-<%=b%>","p":true}]},{"keys":["a","b","height"],"selector":"div[mx-guid=\"x7933-\u001f\"]","attrs":[{"n":"style","v":"height:<%=height+20%>px;background: red"}]},{"keys":["a"],"selector":"label[mx-guid=\"x7936-\u001f\"]","attrs":[{"n":"for","v":"cb_<%=a%>"}]},{"keys":["checked","a","b"],"selector":"div[mx-guid=\"x7939-\u001f\"]","attrs":[{"n":"checked","v":"<%=checked%>"},{"n":"value","v":"<%=a+'_'+b%>"}]},{"keys":["a","b"],"selector":"button[mx-guid=\"x79310-\u001f\"]","attrs":[{"n":"mx-click","v":"change({a:'<%=a%>',b:'<%=b%>'})"}]},{"guid":7,"keys":["pMap"],"tmpl":"\n    <%for(var i=0;i<permissions.length;i++){%>\n        <%console.log(pMap[permissions[i]])%>\n        <label><input type=\"checkbox\" <%if(pMap[permissions[i]]){%>checked<%}%> /><%=permissions[i]%></label>\n    <%}%>\n","selector":"div[mx-guid=\"x79311-\u001f\"]","attrs":[]},{"keys":["a","b"],"selector":"input[mx-guid=\"x7934-\u001f\"]","attrs":[{"n":"value","v":"<%=a%>-<%=b%>","p":true}]},{"keys":["a"],"selector":"input[mx-guid=\"x7935-\u001f\"]","attrs":[{"n":"id","v":"cb_<%=a%>"}]},{"keys":["checked"],"selector":"input[mx-guid=\"x7937-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":true},{"n":"checked","v":"<%if(checked){%>checked<%}%>","p":true}]},{"keys":["checked"],"selector":"input[mx-guid=\"x7938-\u001f\"]","attrs":[{"n":"checked","v":"<%if(checked){%>checked<%}%>","p":true}]}],
    render: function() {
        var me = this;
        me.data.set({
            a: Magix.guid(),
            b: Magix.guid(),
            checked: !me.data.get('checked'),
            pMap: {
                a: 1,
                c: 1
            },
            height: 10 + me.data.get('height') || 0,
            permissions: ['a', 'b', 'c', 'd']
        }).digest();
    },
    'change<click>': function() {
        this.render();
    },
    'changeMap<click>': function() {
        var data = this.data;
        var r = function() {
            return Math.random() < 0.5;
        };
        var pMap = {
            a: r(),
            b: r(),
            c: r(),
            d: r()
        };
        data.set({
            pMap: pMap
        }).digest();
    }
});
});