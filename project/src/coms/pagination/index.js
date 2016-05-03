define('coms/pagination/index',['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Router = Magix.Router;
Magix.applyStyle('mp-886',".mp-886-page-list{text-align:center;float:left}.mp-886-page-list,.mp-886-page-list a{height:25px;line-height:25px}.mp-886-page-list a{color:#999;font-size:14px;display:inline-block;width:25px;margin-left:2px;vertical-align:text-bottom}a.mp-886-page-active{color:#fff;background:#98aedd;border-radius:3px}.mp-886-page-disabled{cursor:not-allowed}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-886-page-list\" mx-guid=\"x4bc1-\u001f\">@1-\u001f</div>",
tmplData:[{"guid":1,"keys":["start","end","index","path","pages"],"tmpl":"<a href=\"#!<%=path%>\" <%if(index==1){%> class=\"mp-886-page-disabled\" <%}else{%> mx-click=\"toPrev()\" <%}%>>⇦</a><%if(start>1){%><a href=\"#!<%=path%>\" mx-click=\"toPage({page:1})\">1</a><%}if(start>2){%><a class=\"page-others\">...</a><%}for(var i=start;i<=end;i++){%><a class=\"page-item<%if(i==index){%> mp-886-page-active<%}%>\" href=\"#!<%=path%>\" mx-click=\"toPage({page:<%=i%>})\"><%=i%></a><%}if(end+2<=pages){%><a class=\"page-others\">...</a><%}if(end<pages){%><a href=\"#!<%=path%>\" mx-click=\"toPage({page:<%=pages%>})\"><%=pages%></a><%}%><a href=\"#!<%=path%>\" <%if(index==pages){%> class=\"mp-886-page-disabled\" <%}else{%> mx-click=\"toNext()\" <%}%>>⇨</a>","selector":"div[mx-guid=\"x4bc1-\u001f\"]"}],
    render: function() {
        var me = this;
        me.endUpdate();
        me.data.onchanged = function(e) {
            if (e.keys.index && me.$picked) {
                me.$picked({
                    index: me.data.get('index')
                });
            }
        };
    },
    cal: function() {
        var me = this;
        var data = me.data;
        var index = data.get('index');
        var pages = data.get('pages');
        if (index > pages) index = pages;
        var step = data.get('step');
        var middle = step / 2 | 0;
        var start = Math.max(1, index - middle);
        var end = Math.min(pages, start + step - 1);
        start = Math.max(1, end - step + 1);
        var offset;
        if (start <= 2) { //=2 +1  =1  +2
            offset = 3 - start;
            if (end + offset < pages) {
                end += offset;
            }
        }
        if (end + 2 > pages) {
            offset = 2 - (pages - end);
            if ((start - offset) > 1) {
                start -= offset;
            }
        }
        if (start == 3) {
            start -= 1;
        }
        if (end + 2 == pages) {
            end += 1;
        }
        data.set({
            index: index,
            start: start,
            end: end
        }).digest();
    },
    update: function(ops) {
        var me = this;
        var pages = Math.ceil((ops.total || 1) / (ops.size || 20));
        var index = ops.index || 1;
        me.data.set({
            path: Router.parse().path,
            step: ops.step || 7,
            index: index,
            pages: pages
        });
        me.$picked = ops.picked;
        me.cal();
    },
    'toPage<click>': function(e) {
        e.preventDefault();
        var me = this;
        me.data.set({
            index: e.params.page
        });
        me.cal();
    },
    'toPrev<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var idx = data.get('index');
        data.set({
            index: idx - 1
        });
        this.cal();
    },
    'toNext<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var idx = data.get('index');
        data.set({
            index: idx + 1
        });
        this.cal();
    }
});
});