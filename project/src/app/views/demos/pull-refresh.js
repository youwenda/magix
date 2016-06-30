define('app/views/demos/pull-refresh',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-f7e',".mp-f7e-page{width:600px;height:400px;background:#eee;margin:0 auto;overflow:auto;position:relative;margin-top:-40px}.mp-f7e-refresh{height:40px;line-height:40px;width:600px;margin:0 auto;text-align:center}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-f7e-page\" mx-mousedown=\"startDrag()\"><div class=\"mp-f7e-refresh\">下拉刷新</div>magix view pull-refresh<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>1</div>",
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
});