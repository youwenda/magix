define("app/views/demos/more-links",['magix','$','./partials/more-links'],function(require){
/*Magix ,$ ,MoreLinks */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-599',".mp-599-wrapper{margin:20px}.mp-599-list{width:150px;position:absolute;z-index:1;padding:4px;background-color:#fff;color:#474747;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098)}.mp-599-list,.mp-599-list li{border-radius:2px}.mp-599-list li{height:21px;line-height:21px;padding:2px 8px;user-select:none;-webkit-user-select:none;-moz-user-select:none;cursor:default}.mp-599-over{background-color:#6363e6;background-image:-webkit-linear-gradient(top,#1b87e3 2%,#6363e6 98%);background-image:linear-gradient(180deg,#1b87e3 2%,#6363e6 98%);color:#ecf2f8;text-shadow:0 -1px 0 rgba(0,0,0,.05)}.mp-599-none{display:none}");
var CSSNames = {"wrapper":"mp-599-wrapper","list":"mp-599-list","over":"mp-599-over","none":"mp-599-none"}
var MoreLinks = require('./partials/more-links');
return Magix.View.extend({
    tmpl: "<div class=\"mp-599-wrapper\"><button class=\"btn\" mx-click=\"showBatch()\">批量操作</button><table class=\"table\"><thead><tr mx-guid=\"xf351-\u001f\"><th>名称</th><th>操作</th></tr></thead><tbody mx-guid=\"xf352-\u001f\">@2-\u001f</tbody></table></div><ul class=\"mp-599-list mp-599-none\" id=\"batch_<%=id%>\"><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">test1</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">test2</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">test3</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">test4</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">test5</li></ul><ul class=\"mp-599-list mp-599-none\" id=\"more_<%=id%>\"><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">more-test1</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">more-test2</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">more-test3</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">more-test4</li><li mx-mouseover=\"hover()\" mx-mouseout=\"hover()\">more-test5</li></ul>",
tmplData:[{"keys":["checkedFields"],"selector":"tr[mx-guid=\"xf351-\u001f\"]","attrs":[]},{"guid":2,"keys":["checkedFields"],"tmpl":"\n            <%for(var i=0;i<20;i++){%>\n            <tr><td>测试<%=Math.random()%></td><td><div class=\"operation\"><a href=\"javascript:;\" mx-click=\"showMore()\">更多</a></div></td></tr>\n            <%}%>\n        ","selector":"tbody[mx-guid=\"xf352-\u001f\"]","attrs":[]}],
    ctor: function() {
        MoreLinks.setup();
        this.on('destroy', MoreLinks.teardown);
    },
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    'hover<mouseout,mouseover>': function(e) {
        $(e.current)[e.type == 'mouseover' ? 'addClass' : 'removeClass'](CSSNames.over);
    },
    'showBatch<click>': function(e) {
        MoreLinks.show(e.current, $('#batch_' + this.id));
    },
    'showMore<click>': function(e) {
        MoreLinks.show(e.current, $('#more_' + this.id));
    }
});
});