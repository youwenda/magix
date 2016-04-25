define('app/views/coms/table',['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<table class=\"table\"><thead><tr><th>xx</th><th>xx</th><th>xx</th><th>operator</th></tr></thead><tbody><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr><tr><td colspan=\"4\" class=\"table-child-td\"><table class=\"table-child\"><thead><tr><th>xx</th><th>xx</th><th>xx</th></tr></thead></table></td><th>operator</th></tr><tbody><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr></tbody></tbody></table><tr><td>xxx</td><td>xxx</td><td>xxx</td><td><div class=\"operation\">xx</div></td></tr><tfoot mx-mousedown=\"drag()\"><tr><td colspan=\"4\">xxx</td></tr></tfoot>",
    render: function() {
        var me = this;
        me.data.digest();
    },
    'drag<mousedown>': function(e) {
        var me = this;
        me.beginDrag(e, e.current, function(event, pos) {
             console.log(event.pageX - pos.pageX, event.pageY - pos.pageY);
            var node = me.nodeFromPoint(event.clientX, event.clientY);
            console.log(node);
            if (node != me.$lastNode) {
                me.$lastNode = node;
                console.log(node);
            }
        }, function() {
            console.log(arguments);
        });
    }
});
});