/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@index.css');
var CSSNames = 'names@index.css[left,top,right,bottom]';
var ArrowBorder = 8;
var Space = 2;
var Position = {
    left: function(anchor, content) {
        var x = 0;
        var y = 0;
        var offset = anchor.offset();
        x = offset.left - content.outerWidth() - ArrowBorder - Space;
        y = offset.top - ArrowBorder;
        return {
            left: x,
            top: y
        };
    },
    right: function(anchor) {
        var x = 0;
        var y = 0;
        var offset = anchor.offset();
        x = offset.left + anchor.outerWidth() + ArrowBorder + Space;
        y = offset.top - ArrowBorder;
        return {
            left: x,
            top: y
        };
    },
    top: function(anchor, content) {
        var x = 0;
        var y = 0;
        var offset = anchor.offset();
        x = offset.left - ArrowBorder;
        y = offset.top - content.outerHeight() - ArrowBorder - Space;
        return {
            left: x,
            top: y
        };
    },
    bottom: function(anchor) {
        var x = 0;
        var y = 0;
        var offset = anchor.offset();
        x = offset.left - ArrowBorder;
        y = offset.top + anchor.outerHeight() + ArrowBorder + Space;
        return {
            left: x,
            top: y
        };
    }
};
module.exports = Magix.View.extend({
    tmpl: '@index.html',
    ctor: function(extra) {
        var me = this;
        if (!extra.dock) extra.dock = 'bottom';
        extra.cssdock = CSSNames[extra.dock];
        extra.id = me.id;
        me.data.set(extra).digest();
    },
    hide: function() {
        var me = this;
        me.$timer = setTimeout(me.wrapAsync(function() {
            var content = $('#content_' + me.id);
            content.hide();
        }), 150);
    },
    'over<mouseover>': function(e) {
        var me = this;
        clearTimeout(me.$timer);
        var content = $('#content_' + me.id);
        var anchor = $(e.current);
        content.show();
        var pos = Position[me.data.get('dock')](anchor, content);
        content.offset(pos);
    },
    'out<mouseout>': function(e) {
        var me = this;
        var flag = Magix.inside(e.relatedTarget, e.current);
        if (!flag) {
            me.hide();
        }
    },
    'cover<mouseover>': function(e) {
        var flag = Magix.inside(e.relatedTarget, e.current);
        if (!flag) {
            clearTimeout(this.$timer);
        }
    },
    'cout<mouseout>': function() {
        this.hide();
    }
});