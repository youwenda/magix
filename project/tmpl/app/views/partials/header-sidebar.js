/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@header-sidebar.css');
var CSSNames = 'names@header-sidebar.css';
module.exports = Magix.View.extend({
    tmpl: '@header-sidebar.html',
    ctor: function() {
        var me = this;
        me.data.set({
            menus: []
        });
    },
    render: function() {
        var me = this;
        me.data.digest();
        me.resize();
    },
    updateMenu: function(subMenus, url) {
        if (subMenus) {
            var me = this;
            me.data.set({
                menus: subMenus
            });
            me.updateUrl(url);
            $('#' + this.id).addClass(CSSNames.expand);
            $('#inmain').addClass(CSSNames.shrink);
        } else {
            $('#' + this.id).removeClass(CSSNames.expand);
            $('#inmain').removeClass(CSSNames.shrink);
        }
    },
    updateUrl: function(url) {
        var me = this;
        me.data.set({
            url: url
        }).digest();
    },
    resize: function() {
        var height = Math.max($(window).height(), 60);
        $('#' + this.id).height(height);
    },
    '$win<resize>': function() {
        this.resize('@app/views/default');
    },
    '$win<scroll>': function() {
        var me = this;
        var top = $(window).scrollTop();
        if (top > 50) {
            if (!me.$fixed) {
                me.$fixed = true;
                $('#' + this.id).addClass(CSSNames.fixed);
            }
            var left = $(window).scrollLeft();
            $('#' + this.id).css({
                left: -left
            });
        } else {
            if (me.$fixed) {
                me.$fixed = false;
                $('#' + this.id).removeClass(CSSNames.fixed);
                $('#' + this.id).css({
                    left: 0
                });
            }
        }
    }
});