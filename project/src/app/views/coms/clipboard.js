define("app/views/coms/clipboard",['magix','../../../coms/clipboard/index','../../../coms/dialog/index'],function(require){
/*Magix ,Clipboard ,Dialog */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-638',".mp-638-vm{vertical-align:middle}.mp-638-w100{width:100px}.mp-638-w700{width:700px}.mp-638-m50{margin:50px}.mp-638-w60{width:60px}.mp-638-float{position:fixed;left:1000px;top:100px;border:1px solid #ccc;height:400px;width:200px}.mp-638-sitem{height:26px;line-height:26px;padding:0 10px}.mp-638-fr{float:right}");
var Clipboard = require('../../../coms/clipboard/index');
var Dialog = require('../../../coms/dialog/index');
return Magix.View.extend({
    tmpl: "<div class=\"mp-638-m50\"><input id=\"cb1_<%=id%>\" value=\"test\" /><textarea id=\"cb2_<%=id%>\"> value=\"test\" </textarea><div id=\"cb3_<%=id%>\" contenteditable=\"true\">xxxx<br />20</div><div id=\"cb4_<%=id%>\">d<strong>exxx</strong>f<br />ok</div></div><div class=\"mp-638-m50\"><button mx-click=\"copy({id:1})\" class=\"btn\">copy input</button><button mx-click=\"copy({id:2})\" class=\"btn\">copy textarea</button><button mx-click=\"copy({id:3})\" class=\"btn\">copy div </button><button mx-click=\"copy({id:4})\" class=\"btn\">copy div</button></div>",
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    'copy<click>': function(e) {
        var me = this;
        var r = Clipboard.copy('cb' + e.params.id + '_' + me.id);
        Dialog.alert(me, r ? '成功' : '失败');
        me.clearSelection();
    }
});
});