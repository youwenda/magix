define('coms/tree/branch',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */

var Magix = require('magix');
var $ = require('$');
return Magix.View.extend({
    tmpl: "<ul><%for(var i=0,br;i<list.length;i++){%><%br=list[i]%><li class=\"mp-582-li\"><div class=\"mp-582-icon<%if(br.children){%> mp-582-cp<%}%>\" <%if(br.children){%> mx-click=\"toggle({id:'<%=br[dataId]%>'})\" <%}%>><%if(br.children){%>+<%}%></div><div><label><input type=\"checkbox\" mx-change=\"check()\" value=\"<%=br[dataId]%>\"/><%=br[textKey]%></label></div><%if(br.children){%><div mx-view=\"coms/tree/branch?index=<%=i%>&text=<%=textKey%>&id=<%=dataId%>\" id=\"<%=id%>_<%=br[dataId]%>\" class=\"mp-582-indent mp-582-none\"></div><%}%></li><%}%></ul>",
    ctor: function(extra) {
        var me = this;
        me.$list = me.owner.parent().invoke('getList', extra.index);
        me.$textKey = extra.text;
        me.$dataId = extra.id;
    },
    render: function() {
        var me = this;
        me.data.set({
            textKey: me.$textKey,
            id: me.id,
            dataId: me.$dataId,
            list: me.$list
        }).digest();
    },
    getList: function(idx) {
        return this.$list[idx].children;
    },
    checkAll: function(state) {
        $('#' + this.id + ' input[type="checkbox"]').prop('checked', state);
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
    'check<change>': function(e) {
        var me = this;
        var vf = Magix.Vframe.get(me.id + '_' + e.current.value);
        if (vf) {
            vf.invoke('checkAll', e.current.checked);
        }
    }
});
});