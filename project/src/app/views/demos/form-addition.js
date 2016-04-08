define("app/views/demos/form-addition",['magix','../../../coms/form/index'],function(require){
/*Magix ,View */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var View = require('../../../coms/form/index');
Magix.applyStyle('mp-1cd',".mp-1cd-wrapper{margin:20px}.mp-1cd-w80{width:80px}.mp-1cd-fl{float:left}.mp-1cd-ml10{margin-left:10px}.mp-1cd-wrapper li{margin:5px 0}.mp-1cd-red{border:1px solid red}");
return View.extend({
    tmpl: "<div class=\"mp-1cd-wrapper\"><ul mx-guid=\"x6bd1-\u001f\">@1-\u001f</ul></div><hr /><div class=\"mp-1cd-wrapper\"><ul mx-guid=\"x6bd2-\u001f\">@2-\u001f</ul></div><button mx-click=\"saveSnapshot()\" class=\"btn\">保存当前数据</button>",
tmplData:[{"guid":1,"keys":["list"],"tmpl":"<li><input class=\"input\" type=\"text\" value=\"<%=list[0].test%>\" mx-change=\"setValue({path:'list.0.test'})\" /></li>\n        <%\n            for(var i=1;i<list.length;i++){\n        %>\n            <li><input class=\"input\" type=\"text\" mx-change=\"setValue({path:'list.<%=i%>.test'})\" value=\"<%=list[i].test%>\" /><button class=\"btn\" mx-click=\"remove({index:<%=i%>})\" style=\"margin-left:10px\">X</button></li>\n        <%\n            }\n        %>\n        <li><button mx-click=\"add()\" class=\"btn\">添加一个</button></li>","selector":"ul[mx-guid=\"x6bd1-\u001f\"]","attrs":[]},{"guid":2,"keys":["platforms"],"tmpl":"\n        <%\n            for(var i=0;i<platforms.length;i++){\n        %>\n            <li><div mx-vframe=\"true\" mx-view=\"app/views/demos/partials/dropdown?type=platform&selected=<%=platforms[i].platformId%>\" mx-change=\"setValue({path:'platforms.<%=i%>.platformId'})\" class=\"mp-1cd-fl mp-1cd-ml10\"></div><div mx-vframe=\"true\" mx-view=\"app/views/demos/partials/dropdown?type=operator&selected=<%=platforms[i].operatorId%>\" mx-change=\"setValue({path:'platforms.<%=i%>.operatorId'})\" class=\"mp-1cd-fl mp-1cd-ml10\"></div><input class=\"input mp-1cd-w80 mp-1cd-ml10\" type=\"text\" mx-change=\"setValue({path:'platforms.<%=i%>.version'})\" value=\"<%=platforms[i].version%>\" placeholder=\"版本号\" /><button class=\"btn mp-1cd-ml10\" mx-click=\"removePlatform({index:<%=i%>})\">X</button></li>\n        <%\n            }\n        %>\n        <li><button mx-click=\"addPlatform()\" class=\"btn\">添加一个平台</button></li>","selector":"ul[mx-guid=\"x6bd2-\u001f\"]","attrs":[]}],
    ctor: function() {
        var me = this;
        me.leaveTip('表单有改动，您确认离开吗？', function() {
            return me.data.altered();
        });
        //me.render();
    },
    render: function() {
        var me = this;
        me.data.set({
            list: [{}],
            platforms: [],
        }).digest().snapshot();
    },
    'add<click>': function() {
        var me = this;
        var list = me.data.get('list');
        list.push({
            value: 20,
            platform: {
                id: 1
            }
        });
        me.data.digest();
    },
    'remove<click>': function(e) {
        var me = this;
        var list = me.data.get('list');
        list.splice(e.params.index, 1);
        me.data.digest();
    },
    'addPlatform<click>': function() {
        var me = this;
        var list = me.data.get('platforms');
        list.push({
            platformId: '',
            operatorId: ''
        });
        me.data.digest();
    },
    'removePlatform<click>': function(e) {
        var me = this;
        var list = me.data.get('platforms');
        list.splice(e.params.index, 1);
        me.data.digest();
    },
    'saveSnapshot<click>': function() {
        console.log(this.data.get());
        this.data.snapshot();
    }
});
});