define('coms/inputag/branch',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */

var Magix = require('magix');
var $ = require('$');
return Magix.View.extend({
    tmpl: "<ul><%for(var i=0,br;i<list.length;i++){br=list[i]%><li class=\"mp-9ad-li\"><div class=\"mp-9ad-icon<%if(br.children){%> mp-9ad-cp<%}%>\" <%if(br.children){%> mx-click=\"toggle({id:'<%=br[dataId]%>'})\" <%}%>><%if(br.children){%>+<%}%></div><div class=\"ellipsis\" title=\"<%=br[textKey]%>\"><label mx-click=\"fill({text:'<%=br[textKey]%>'})\" mx-mouseout=\"hover()\" mx-mouseover=\"hover()\" class=\"mp-9ad-tree-name\"><%=br[textKey]%></label></div><%if(br.children){%><div mx-view=\"coms/inputag/branch?index=<%=i%>&text=<%=textKey%>&id=<%=dataId%>\" id=\"<%=id%>_<%=br[dataId]%>\" class=\"mp-9ad-indent mp-9ad-none\"></div><%}%></li><%}%></ul>",
    ctor: function(extra) {
        var me = this;
        me.$info = me.owner.parent().invoke('getInfo', extra.index);
        me.$textKey = extra.text;
        me.$dataId = extra.id;
    },
    render: function() {
        var me = this;
        me.data.set({
            textKey: me.$textKey,
            id: me.id,
            dataId: me.$dataId,
            list: me.$info.list
        }).digest();
    },
    getInfo: function(idx) {
        return {
            list: this.$info.list[idx].children,
            onClick: this.$info.onClick
        };
    },
    'hover<mouseover,mouseout>': function(e) {
        $(e.current)[e.type == 'mouseout' ? 'removeClass' : 'addClass']('mp-9ad-over');
    },
    'toggle<click>': function(e) {
        var node = $('#' + this.id + '_' + e.params.id);
        var current = $(e.current);
        var val = $.trim(current.html());
        if (val == '+') {
            node.slideDown();
            current.html('-');
        } else {
            node.slideUp();
            current.html('+');
        }
    },
    'fill<click>': function(e) {
        var me = this;
        var text = e.params.text;
        if (me.$info.onClick) {
            me.$info.onClick({
                text: text
            });
        }
    }
});
});