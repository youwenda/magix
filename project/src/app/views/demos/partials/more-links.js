define('app/views/demos/partials/more-links',['magix','../../../../coms/bases/monitor','$'],function(require){
/*Magix ,Monitor ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Monitor = require('../../../../coms/bases/monitor');
var $ = require('$');
return {
    id: Magix.guid('_mls_'),
    setup: function() {
        Monitor.setup();
    },
    teardown: function() {
        Monitor.teardown();
        var me = this;
        delete me.$anchor;
        delete me.$list;
    },
    show: function(anchor, list) {
        var me = this;
        Monitor.add(me);
        list.show();
        anchor = $(anchor);
        var offset = anchor.offset();
        list.css({
            left: offset.left,
            top: offset.top + anchor.outerHeight()
        });
        me.$anchor = anchor[0];
        me.$list = list[0];
    },
    hide: function() {
        var me = this;
        Monitor.remove(me);
        $(me.$list).hide();
    },
    inside: function(target) {
        return Magix.inside(target, this.$anchor) || Magix.inside(target, this.$list);
    }
};
});