define('coms/tree/index',['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-582',".mp-582-indent{margin-left:22px;border-left:1px dotted #ccc}.mp-582-li{padding:0 4px}.mp-582-icon,.mp-582-li{line-height:22px}.mp-582-icon{width:22px;height:22px;float:left;text-align:center;font-weight:800}.mp-582-cp{cursor:pointer}.mp-582-none{display:none}");
return Magix.View.extend({
    tmpl: "<div id=\"tree_<%=id%>\" mx-view=\"\"></div>",
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    update: function(ops) {
        var me = this;
        var info = me.listToTree(ops.list, ops.id, ops.pId);
        me.$info = info;
        me.owner.mountVframe('tree_' + me.id, 'coms/tree/branch', {
            id: ops.id || 'id',
            pId: ops.pId || 'pId',
            text: (ops.text || 'text')
        });
         //aa
         //bb
    },
    getList: function() {
        return this.$info.list;
    }
});
});