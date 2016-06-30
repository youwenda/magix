define('app/views/demos/file-uploader',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-e95',".mp-e95-uploader{width:300px;height:100px;background:#eee;line-height:100px;text-align:center;font-size:20px;margin:30px;cursor:pointer}.mp-e95-tracker{width:300px;height:4px;background:#aaa;position:relative;margin:60px}.mp-e95-indicator{border-radius:8px;width:16px;height:16px;position:absolute;left:-6px;top:-6px;cursor:move;background:#aaa}.mp-e95-test{background-color:#eee;width:400px;height:100px;margin-bottom:20px}");
return Magix.View.extend({
    tmpl: "<div mx-view=\"coms/uploader/index\" class=\"mp-e95-uploader\">点击上传文件</div><div class=\"mp-e95-tracker\"><div class=\"mp-e95-indicator\" mx-mousedown=\"drag()\"></div></div><div id=\"test\" class=\"mp-e95-test\"></div><button mx-click=\"test()\">Vframe created test</button>",
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
    },
    'test<click>': function(e) {
        var vf = this.owner.mountVframe('test');
        vf.oncreated = function() {
            console.log('done');
        };
        vf.mountView('coms/uploader/index');
    }
});
});