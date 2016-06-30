/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@pull-refresh.css');
module.exports = Magix.View.extend({
    tmpl: '@pull-refresh.html',
    render: function() {
        var me = this;
        me.data.digest();
    },
    'startDrag<mousedown>': function(e) {
        var cnt = $(e.current);
        var me = this;
        if (cnt.scrollTop() <= 0) {
            console.log('start');
            var y = e.pageY;
            me.beginDrag(e, e.current, function(e) {
                var oy = e.pageY - y;
                oy = 80 * Math.atan(oy / 200);
                if (oy > 40) oy = 40;
                cnt.css({
                    transform: 'translateY(' + oy + 'px)',
                    transitionDuration:'0ms'
                });
            }, function() {
                cnt.css({
                    transform: 'translateY(0)',
                    transitionDuration:'200ms'
                });
            });
        }
    }
});