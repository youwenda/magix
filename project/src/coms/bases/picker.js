define('coms/bases/picker',['magix','$','./monitor'],function(require){
/*Magix ,$ ,Monitor */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Monitor = require('./monitor');
Magix.applyStyle('mp-60f',".mp-60f-picker{background:#fff;position:absolute;display:none;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098)}.mp-60f-left:after,.mp-60f-left:before{border:8px solid transparent;border-bottom:8px solid #fff;width:0;height:0;position:absolute;top:-16px;left:8px;content:' '}.mp-60f-left:before{border-width:8px;border-bottom-color:#888}.mp-60f-right:after,.mp-60f-right:before{border:8px solid transparent;border-bottom:8px solid #fff;width:0;height:0;position:absolute;top:-16px;right:8px;content:' '}.mp-60f-right:before{border-width:8px;border-bottom-color:#888}");
var ArrowHeight = 8;
return Magix.View.extend({
    ctor: function(extra) {
        var me = this;
        Monitor.setup();
        me.on('destroy', function() {
            Monitor.teardown();
            $('#' + me.id).remove();
        });
        me.$ownerNodeId = extra.ownerNodeId;
        me.$dock = extra.dock || 'left';
        $('#' + me.id).addClass('mp-60f-picker' + ' ' + 'mp-60f-' + me.$dock);
    },
    inside: function(node) {
        var me = this;
        var inside = Magix.inside(node, me.id) || Magix.inside(node, me.$ownerNodeId);
        return inside;
    },
    show: function() {
        var me = this;
        if (!me.$shown) {
            var node = $('#' + me.id),
                ref = $('#' + me.$ownerNodeId);
            me.$shown = true;
            Monitor.add(me);
            node.show();
            var offset = ref.offset();
            var left, top = offset.top + ref.outerHeight() + ArrowHeight;
            if (me.$dock == 'left') {
                left = offset.left;
            } else {
                left = offset.left + ref.outerWidth() - node.outerWidth();
            }
            node.css({
                left: left,
                top: top
            });
        }
    },
    hide: function() {
        var me = this;
        if (me.$shown) {
            var node = $('#' + me.id);
            me.$shown = false;
            node.hide();
            Monitor.remove(me);
        }
    }
});
});