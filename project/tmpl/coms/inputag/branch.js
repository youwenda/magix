/*
    author:xinglie.lkf@taobao.com
 */
'ref@./tree.css';
var Magix = require('magix');
var $ = require('$');
module.exports = Magix.View.extend({
    tmpl: '@branch.html',
    ctor: function(extra) {
        var me = this;
        me.$info = me.owner.parent().invoke('getInfo', extra.index);
        me.$textKey = extra.text;
        me.$dataId = extra.id;
    },
    render: function() {
        var me = this;
        me.data.set({
            textKey: me.$textKey,
            id: me.id,
            dataId: me.$dataId,
            list: me.$info.list
        }).digest();
    },
    getInfo: function(idx) {
        return {
            list: this.$info.list[idx].children,
            onClick: this.$info.onClick
        };
    },
    'hover<mouseover,mouseout>': function(e) {
        $(e.current)[e.type == 'mouseout' ? 'removeClass' : 'addClass']('@./tree.css:over');
    },
    'toggle<click>': function(e) {
        var node = $('#' + this.id + '_' + e.params.id);
        var current = $(e.current);
        var val = $.trim(current.html());
        if (val == '+') {
            node.slideDown();
            current.html('-');
        } else {
            node.slideUp();
            current.html('+');
        }
    },
    'fill<click>': function(e) {
        var me = this;
        var text = e.params.text;
        if (me.$info.onClick) {
            me.$info.onClick({
                text: text
            });
        }
    }
});