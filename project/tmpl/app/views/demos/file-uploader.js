/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@file-uploader.css');
module.exports = Magix.View.extend({
    tmpl: '@file-uploader.html',
    render: function() {
        var me = this;
        me.data.digest();
    },
    'drag<mousedown>': function(e) {
        var me = this;
        var current = $(e.current);
        var currentX = parseInt(current.css('left'), 10);
        me.beginDrag(e, e.current, function(ex) {
            var newX = currentX + ex.pageX - e.pageX;
            if (newX < -8) newX = -8;
            else if (newX > 292) newX = 292;
            var p = (newX + 8) / 300;
            console.log(p);
            current.css({
                left: newX
            });
        });
    }
});