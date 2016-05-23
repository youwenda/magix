define('app/views/partials/header-sidebar',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-286',".mp-286-expand{margin-left:0}.mp-286-shrink{margin-left:200px}.mp-286-menus{padding-top:45px}.mp-286-menus a{padding-left:30px;border-left:4px solid transparent;color:#fff;opacity:.55;display:block;padding:11px 0 12px 40px}.mp-286-menus a.mp-286-on{opacity:1;border-color:#8a6bbe;background-color:#333}.mp-286-fixed{position:fixed;left:0;top:0}");
var CSSNames = {"fixed":"mp-286-fixed","expand":"mp-286-expand","shrink":"mp-286-shrink"};
return Magix.View.extend({
    tmpl: "<ul class=\"mp-286-menus\" mx-guid=\"x2d21-\u001f\">@1-\u001f</ul>",
tmplData:[{"guid":1,"keys":["menus","url"],"tmpl":"<%for(var i=0,menu;i<menus.length;i++){menu=menus[i]%><li><a href=\"#!<%=menu.url%>\" <%if(menu.url==url){%> class=\"mp-286-on\" <%}%>><%if(menu.icon){%><i class=\"iconfont\"><%=menu.icon%></i><%}%> <%=menu.text%></a></li><%}%>","selector":"ul[mx-guid=\"x2d21-\u001f\"]"}],
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
        var main = $('#inmain');
        var me = this;
        if (subMenus) {
            me.data.set({
                menus: subMenus
            });
            me.updateUrl(url);
            if (!main.hasClass(CSSNames.shrink)) {
                $('#' + this.id).addClass(CSSNames.expand);
                $('#inmain').addClass(CSSNames.shrink);
                me.owner.parent().invoke('toggleSidebar');
            }
        } else if (main.hasClass(CSSNames.shrink)) {
            $('#' + this.id).removeClass(CSSNames.expand);
            $('#inmain').removeClass(CSSNames.shrink);
            me.owner.parent().invoke('toggleSidebar');
        }
    },
    updateUrl: function(url) {
        var me = this;
        console.log(url,me.data.get('url'));
        me.data.set({
            url: url
        }).digest();
    },
    resize: function() {
        var height = Math.max($(window).height(), 60);
        $('#' + this.id).height(height);
    },
    '$win<resize>': function() {
        this.resize();
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
});