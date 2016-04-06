define("app/views/coms/tree",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div mx-guid=\"x8be1-\u001f\" class=\"tree <%=a%>-def\" title=\"<%=b%>\" mx-view=\"a/b?s=<%=b%>\">@1-\u001f</div><textarea mx-guid=\"x8be2-\u001f\" <%if(checked){%>disabled<%}%>><%=a%>-<%=b%></textarea>\n<%for(var i=0;i<10;i++){%>\n<div mx-vframe=\"true\" mx-view=\"coms/dropdown/index?source=script&selected=<%=a%>\"><script type=\"text/magix\">\n        [{\"id\":\"<%=a%>\",\"text\":\"a-<%=a%>\"},{\"id\":\"<%=b%>\",\"text\":\"b-<%=b%>\"}]\n    </script></div>\n<%}%>\n@3-\u001f<div mx-guid=\"x8be3-\u001f\" style=\"height:<%=height+20%>px;background: red\"></div><input mx-guid=\"x8be4-\u001f\" value=\"<%=a%>-<%=b%>\" /><input type=\"checkbox\" id=\"cb_<%=a%>\" mx-guid=\"x8be5-\u001f\" /><label for=\"cb_<%=a%>\" mx-guid=\"x8be6-\u001f\">@4-\u001f</label><input type=\"checkbox\" mx-guid=\"x8be7-\u001f\" <%if(checked){%>disabled<%}%> <%if(checked){%>checked<%}%> /><input type=\"radio\" mx-guid=\"x8be8-\u001f\" checked=\"<%=checked%>\" /><div mx-guid=\"x8be9-\u001f\" checked=\"<%=checked%>\" value=\"<%=a+'_'+b%>\">@5-\u001f</div><button mx-guid=\"x8be10-\u001f\" mx-click=\"change({a:'<%=a%>',b:'<%=b%>'})\" class=\"btn\" >@6-\u001f</button><div mx-guid=\"x8be11-\u001f\">@7-\u001f</div><button class=\"btn\" mx-click=\"changeMap()\"> change pmap</button>",
tmplData:[{"guid":1,"keys":["a","b"],"tmpl":"\n    <%=a%>-<%=b%>\n","selector":"div[mx-guid=\"x8be1-\u001f\"]","attrs":[{"n":"className","v":"tree <%=a%>-def"},{"n":"title","v":"<%=b%>"},{"n":"mx-view","v":"a/b?s=<%=b%>"}]},{"keys":["a","b","checked"],"selector":"textarea[mx-guid=\"x8be2-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":true},{"n":"value","v":"<%=a%>-<%=b%>","p":true}]},{"guid":3,"keys":["a","b","height"],"tmpl":"","selector":"div[mx-guid=\"x8be3-\u001f\"]","attrs":[{"n":"style","v":"height:<%=height+20%>px;background: red"}]},{"guid":4,"keys":["a"],"tmpl":"abcdefg","selector":"label[mx-guid=\"x8be6-\u001f\"]","attrs":[{"n":"for","v":"cb_<%=a%>"}]},{"guid":5,"keys":["checked","a","b"],"tmpl":"test value","selector":"div[mx-guid=\"x8be9-\u001f\"]","attrs":[{"n":"checked","v":"<%=checked%>"},{"n":"value","v":"<%=a+'_'+b%>"}]},{"guid":6,"keys":["a","b"],"tmpl":"change a and b","selector":"button[mx-guid=\"x8be10-\u001f\"]","attrs":[{"n":"mx-click","v":"change({a:'<%=a%>',b:'<%=b%>'})"}]},{"guid":7,"keys":["pMap"],"tmpl":"\n    <%for(var i=0;i<permissions.length;i++){%>\n        <%console.log(pMap[permissions[i]])%>\n        <label><input type=\"checkbox\" <%if(pMap[permissions[i]]){%>checked<%}%> /><%=permissions[i]%></label>\n    <%}%>\n","selector":"div[mx-guid=\"x8be11-\u001f\"]","attrs":[]},{"keys":["a","b"],"selector":"input[mx-guid=\"x8be4-\u001f\"]","attrs":[{"n":"value","v":"<%=a%>-<%=b%>","p":true}]},{"keys":["a"],"selector":"input[mx-guid=\"x8be5-\u001f\"]","attrs":[{"n":"id","v":"cb_<%=a%>"}]},{"keys":["checked"],"selector":"input[mx-guid=\"x8be7-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":true},{"n":"checked","v":"<%if(checked){%>checked<%}%>","p":true}]},{"keys":["checked"],"selector":"input[mx-guid=\"x8be8-\u001f\"]","attrs":[{"n":"checked","v":"<%=checked%>","p":true}]}],
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