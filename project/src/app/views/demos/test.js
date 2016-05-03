define('app/views/demos/test',['magix'],function(require){
/*Magix*/
/*
    author: xinglie.lkf@ taobao.com
 */
var Magix=require('magix');
return Magix.View.extend({
    tmpl: "<div mx-guid=\"xbb01-\u001f\" class=\"tree <%=a%>-def\" title=\"<%=b%>\" mx-view1=\"a/b?s=<%=b%>\">@1-\u001f</div><textarea mx-guid=\"xbb02-\u001f\" <%if(checked){%>disabled<%}%>><%=a%>-<%=b%></textarea><%for(var i=0;i<10;i++){%><div mx-view=\"coms/dropdown/index?source=script&selected=<%=a%>\" mx-guid=\"xbb03-\u001f\">@3-\u001f</div><%}%><div mx-guid=\"xbb04-\u001f\" style=\"height:<%=height+20%>px;background: red\"></div><input mx-guid=\"xbb05-\u001f\" value=\"<%=a%>-<%=b%>\"/> <input type=\"checkbox\" id=\"cb_<%=a%>\" mx-guid=\"xbb06-\u001f\"/><label for=\"cb_<%=a%>\" mx-guid=\"xbb07-\u001f\">abcdefg</label><input type=\"checkbox\" mx-guid=\"xbb08-\u001f\" <%if(checked){%>disabled<%}%> <%if(checked){%>checked<%}%>/> <input type=\"radio\" mx-guid=\"xbb09-\u001f\" <%if(checked){%>checked<%}%>/><div mx-guid=\"xbb010-\u001f\" checked=\"<%=checked%>\" value=\"<%=a+'_'+b%>\">test value</div><button mx-guid=\"xbb011-\u001f\" mx-click=\"change({a:'<%=a%>',b:'<%=b%>'})\" class=\"btn\">change a and b</button><div mx-guid=\"xbb012-\u001f\">@8-\u001f</div><button class=\"btn\" mx-click=\"changeMap()\">change pmap</button>",
tmplData:[{"guid":1,"keys":["a","b"],"tmpl":"<%=a%>-<%=b%>","selector":"div[mx-guid=\"xbb01-\u001f\"]","attrs":[{"n":"className","v":"tree <%=a%>-def","p":1},{"n":"title","v":"<%=b%>"},{"n":"mx-view1","v":"a/b?s=<%=b%>"}]},{"keys":["a","b","checked"],"selector":"textarea[mx-guid=\"xbb02-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":1},{"n":"value","v":"<%=a%>-<%=b%>","p":1}]},{"guid":3,"keys":["a","b"],"tmpl":"<script type=\"text/magix\">[{\"id\":\"<%=a%>\",\"text\":\"a-<%=a%>\"},{\"id\":\"<%=b%>\",\"text\":\"b-<%=b%>\"}]</script>","selector":"div[mx-guid=\"xbb03-\u001f\"]","view":"coms/dropdown/index?source=script&selected=<%=a%>"},{"keys":["a","b","height"],"selector":"div[mx-guid=\"xbb04-\u001f\"]","attrs":[{"n":"style","v":"height:<%=height+20%>px;background: red"}]},{"keys":["a"],"selector":"label[mx-guid=\"xbb07-\u001f\"]","attrs":[{"n":"for","v":"cb_<%=a%>"}]},{"keys":["checked","a","b"],"selector":"div[mx-guid=\"xbb010-\u001f\"]","attrs":[{"n":"checked","v":"<%=checked%>"},{"n":"value","v":"<%=a+'_'+b%>"}]},{"keys":["a","b"],"selector":"button[mx-guid=\"xbb011-\u001f\"]","attrs":[{"n":"mx-click","v":"change({a:'<%=a%>',b:'<%=b%>'})"}]},{"guid":8,"keys":["pMap"],"tmpl":"<%for(var i=0;i<permissions.length;i++){console.log(pMap[permissions[i]])%><label><input type=\"checkbox\" <%if(pMap[permissions[i]]){%>checked<%}%>/><%=permissions[i]%></label><%}%>","selector":"div[mx-guid=\"xbb012-\u001f\"]"},{"keys":["a","b"],"selector":"input[mx-guid=\"xbb05-\u001f\"]","attrs":[{"n":"value","v":"<%=a%>-<%=b%>","p":1}]},{"keys":["a"],"selector":"input[mx-guid=\"xbb06-\u001f\"]","attrs":[{"n":"id","v":"cb_<%=a%>"}]},{"keys":["checked"],"selector":"input[mx-guid=\"xbb08-\u001f\"]","attrs":[{"n":"disabled","v":"<%if(checked){%>disabled<%}%>","p":1},{"n":"checked","v":"<%if(checked){%>checked<%}%>","p":1}]},{"keys":["checked"],"selector":"input[mx-guid=\"xbb09-\u001f\"]","attrs":[{"n":"checked","v":"<%if(checked){%>checked<%}%>","p":1}]}],
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