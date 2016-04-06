/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Monitor = require('./monitor');
Magix.applyStyle('@picker.css');
var ArrowHeight = 8;
var CSSNames = 'names@picker.css';
module.exports = Magix.View.extend({
    ctor: function(extra) {
        var me = this;
        Monitor.setup();
        me.on('destroy', function() {
            Monitor.teardown();
            $('#' + me.id).remove();
        });
        me.$ownerNodeId = extra.ownerNodeId;
        me.$dock = extra.dock || 'left';
        $('#' + me.id).addClass(CSSNames.picker + ' ' + CSSNames[me.$dock]);
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