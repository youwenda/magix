define("app/views/demos/partials/monitor-popup",['magix','../../../services/service'],function(require){
/*Magix ,Service */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-287',".mp-287-wrapper{background:#fff;position:fixed;width:500px;height:200px;right:0;bottom:0;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098);overflow:auto}");
var Service = require('../../../services/service');
return Magix.View.extend({
    tmpl: "<div class=\"mp-287-wrapper\"><table class=\"table\"><thead><tr><th>类型</th><th>名称</th><th>url</th><th>缓存</th><th>结果</th></tr></thead><tbody mx-guid=\"xa7a1-\u001f\">@1-\u001f</tbody></table></div>",
tmplData:[{"guid":1,"keys":["list"],"tmpl":"\n            <%for(var i=0;i<list.length;i++){%>\n            <tr><td><%=list[i].type%></td><td><%=list[i].name%></td><td><%=list[i].url%></td><td><%=list[i].cache%>ms</td><td><%=list[i].result%></td></tr>\n            <%}%>\n        ","selector":"tbody[mx-guid=\"xa7a1-\u001f\"]","attrs":[]}],
    ctor: function() {
        var me = this;
        Service.on('begin', function(e) {
            me.logService(e);
        });
        Service.on('end', function(e) {
            me.logService(e);
        });
    },
    render: function() {
        var me = this;
        me.data.set({
            list: []
        }).digest();
    },
    logService: function(e) {
        var me = this;
        var list = me.data.get('list') || [];
        if (e.type == 'begin') {
            list.unshift({
                type: '开始请求',
                name: e.bag.get('name'),
                url: e.bag.get('url'),
                cache: e.bag.get('cache'),
                result: '-'
            });
        } else {
            list.unshift({
                type: '结束请求',
                name: e.bag.get('name'),
                url: e.bag.get('url'),
                result: e.error ? e.error.msg : '成功',
                cache: e.bag.get('cache'),
            });
        }
        me.data.set({
            list: list
        }).digest();
    }
});
});