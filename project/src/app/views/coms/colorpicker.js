define("app/views/coms/colorpicker",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div style=\"margin:20px\"><button class=\"btn\" mx-click=\"showPicker({dock:'left'})\">测试</button><button class=\"btn\" style=\"float:right\" mx-click=\"showPicker({dock:'right'})\">测试2</button></div>",
    render: function() {
        var me = this;
        me.data.digest();
    },
    'showPicker<click>': function(e) {
        e.preventDefault();
        var ipt = e.current;
        this.colorpicker({
            ownerNodeId: ipt.id || (ipt.id = Magix.guid('cp_')),
            dock: e.params.dock,
            color: ipt.innerHTML,
            picked: function(e) {
                ipt.innerHTML = e.color;
            }
        });
    }
});
});