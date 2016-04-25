define('coms/popover/index',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-fa3',".mp-fa3-help{cursor:help}.mp-fa3-content{position:absolute;padding:4px;border-radius:4px;background-color:#fff;color:#474747;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098)}.mp-fa3-left:after,.mp-fa3-left:before{border:8px solid transparent;border-left:8px solid #fff;width:0;height:0;position:absolute;top:8px;right:-16px;content:' '}.mp-fa3-left:before{border-width:8px;border-left-color:#888}.mp-fa3-right:after,.mp-fa3-right:before{border:8px solid transparent;border-right:8px solid #fff;width:0;height:0;position:absolute;top:8px;left:-16px;content:' '}.mp-fa3-right:before{border-width:8px;border-right-color:#888}.mp-fa3-top:after,.mp-fa3-top:before{border:8px solid transparent;border-top:8px solid #fff;width:0;height:0;position:absolute;bottom:-16px;left:8px;content:' '}.mp-fa3-top:before{border-width:8px;border-top-color:#888}.mp-fa3-bottom:after,.mp-fa3-bottom:before{border:8px solid transparent;border-bottom:8px solid #fff;width:0;height:0;position:absolute;top:-16px;left:8px;content:' '}.mp-fa3-bottom:before{border-width:8px;border-bottom-color:#888}");
var CSSNames = {"left":"mp-fa3-left","top":"mp-fa3-top","right":"mp-fa3-right","bottom":"mp-fa3-bottom"};
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
return Magix.View.extend({
    tmpl: "<span mx-mouseover=\"over();\" mx-mouseout=\"out()\" class=\"mp-fa3-help\"><%=icon%></span><div class=\"mp-fa3-content <%=cssdock%>\" style=\"width:200px;min-height:50px;display:none\" id=\"content_<%=id%>\" mx-mouseover=\"cover()\" mx-mouseout=\"cout()\"><%=content%></div>",
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
});