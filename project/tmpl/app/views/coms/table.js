/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@table.html',
    render: function() {
        var me = this;
        me.data.digest();
    },
    'drag<mousedown>': function(e) {
        var me = this;
        var pos = e;
        me.beginDrag(e.current, function(event) {
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