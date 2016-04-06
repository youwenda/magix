/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Top = 1,
    Right = 2,
    Bottom = 4,
    Left = 8;
module.exports = Magix.Base.extend({
    ctor: function(zone) {
        var me = this;
        me.$zone = $(zone);
        me.$threshold = 10;
        me.$scrollStep = 4;
    },
    start: function() {
        var me = this;
        var zone = me.$zone;
        me.$offset = zone.offset();
        me.$size = {
            width: zone.outerWidth(),
            height: zone.outerHeight()
        };
    },
    begin: function() {
        var me = this;
        if (me.$dir && !me.$timer) {
            var zone = me.$zone;
            var step = me.$scrollStep;
            me.$timer = window.setInterval(function() {
                var dir = me.$dir;
                if (dir & Top) {
                    if (zone.scrollTop() > 0) {
                        me.fire('scroll');
                        zone.scrollTop(zone.scrollTop() - step);
                    }
                }
                if (dir & Bottom) {
                    if (zone.scrollTop() + me.$size.height < zone.prop('scrollHeight')) {
                        me.fire('scroll');
                        zone.scrollTop(zone.scrollTop() + step);
                    }
                }
                if (dir & Left) {
                    if (zone.scrollLeft() > 0) {
                        me.fire('scroll');
                        zone.scrollLeft(zone.scrollLeft() - step);
                    }
                }
                if (dir & Right) {
                    if (zone.scrollLeft() + me.$size.width < zone.prop('scrollWidth')) {
                        me.fire('scroll');
                        zone.scrollLeft(zone.scrollLeft() + step);
                    }
                }
            }, 50);
        } else if (!me.$dir && me.$timer) {
            me.end();
        }
    },
    end: function() {
        var me = this;
        clearInterval(me.$timer);
        delete me.$timer;
        me.fire('stop');
    },
    check: function(e) {
        var me = this,
            dir,
            offset = e.pageY - me.$offset.top,
            threshold = me.$threshold;
        if (offset > -threshold && offset < threshold) {
            dir = dir ? (dir | Top) : Top;
        }
        offset = me.$offset.top + me.$size.height - e.pageY;
        if (offset > -threshold && offset < threshold) {
            dir = dir ? (dir | Bottom) : Bottom;
        }
        offset = e.pageX - me.$offset.left;
        if (offset > -threshold && offset < threshold) {
            dir = dir ? (dir | Left) : Left;
        }
        offset = me.$offset.left + me.$size.width - e.pageX;
        if (offset > -threshold && offset < threshold) {
            dir = dir ? (dir | Right) : Right;
        }
        me.$dir = dir;
        me.begin();
    },
    finish: function() {
        this.end();
    }
});