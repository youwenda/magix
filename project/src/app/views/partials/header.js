define("app/views/partials/header",['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Router = Magix.Router;
Magix.applyStyle('mp-2af',".mp-2af-header{position:relative;height:50px;background-color:#6363e6;color:hsla(0,0%,100%,.6)}.mp-2af-bp-logo{float:left;color:#fff;width:200px;height:50px;line-height:50px;overflow:hidden;text-align:center;font-size:20px}.mp-2af-top-nav{float:left;font-size:14px}.mp-2af-top-nav a{color:hsla(0,0%,100%,.6)}.mp-2af-top-nav a.mp-2af-on{color:#fff}.mp-2af-top-nav ul{list-style:none;margin:0}.mp-2af-top-nav ul:after,.mp-2af-top-nav ul:before{content:\" \";display:table}.mp-2af-top-nav ul:after{clear:both}.mp-2af-top-nav li{float:left;line-height:50px}.mp-2af-top-nav a{float:left;padding:0 25px}.mp-2af-top-handle{float:right;line-height:50px;opacity:.7;margin:0 40px 0 0}.mp-2af-top-handle a{margin:0 0 0 10px;display:inline-block;height:50px;color:#fff}.mp-2af-sidebar{overflow:auto;display:inline;position:absolute;left:0;top:50px;background-color:#423f48;width:200px;margin-left:-200px;transition:margin-left .5s;-moz-transition:margin-left .5s;-webkit-transition:margin-left .5s;-o-transition:margin-left .5s}");
var CSSNames = {"header":"mp-2af-header","bp-logo":"mp-2af-bp-logo","top-nav":"mp-2af-top-nav","on":"mp-2af-on","top-handle":"mp-2af-top-handle","sidebar":"mp-2af-sidebar"}
var Menus = [{
    url: '/home/index',
    text: '首页'
}, {
    url: '/coms/index',
    text: '组件',
    subMenus: [{
        url: '/coms/dropdown',
        text: '下拉框',
        icon: '&#xe606;'
    }, {
        url: '/coms/dialog',
        text: '弹出框',
        icon: '&#xe600;'
    }, {
        url: '/coms/menu',
        text: '菜单',
        icon: '&#xe60a;'
    }, {
        url: '/coms/tree',
        text: '树',
        icon: '&#xe60a;'
    }, {
        url: '/coms/calendar',
        text: '日历',
        icon: '&#xe60a;'
    }, {
        url: '/coms/popover',
        text: '提示信息',
        icon: '&#xe60a;'
    }, {
        url: '/coms/pagination',
        text: '分页',
        icon: '&#xe60a;'
    }, {
        url: '/coms/table',
        text: '表格',
        icon: '&#xe600;'
    }, {
        url: '/coms/colorpicker',
        text: '颜色选择器',
        icon: '&#xe600;'
    }, {
        url: '/coms/clipboard',
        text: '复制到剪切板',
        icon: '&#xe600;'
    }]
}, {
    url: '/demos/index',
    text: '经验',
    subMenus: [{
        url: '/demos/api-cache',
        text: '接口-缓存',
        icon: '&#xe600;'
    }, {
        url: '/demos/api-monitor',
        text: '接口-监视调用',
        icon: '&#xe600;'
    }, {
        url: '/demos/form-addition',
        text: '表单-动态增加',
        icon: '&#xe600;'
    }, {
        url: '/demos/form-validation',
        text: '表单-验证',
        icon: '&#xe600;'
    }, {
        url: '/demos/view-subs',
        text: 'view拆分',
        icon: '&#xe600;'
    }, {
        url: '/demos/table-settings',
        text: '表格-字段设置',
        icon: '&#xe600;'
    }, {
        url: '/demos/autocomplete',
        text: '自动完成',
        icon: '&#xe600;'
    }, {
        url: '/demos/sdk',
        text: 'SDK下载',
        icon: '&#xe600;'
    }, {
        url: '/demos/editable',
        text: '就地编辑',
        icon: '&#xe600;'
    }, {
        url: '/demos/tags',
        text: 'tags标签',
        icon: '&#xe600;'
    }, {
        url: '/demos/more-links',
        text: '更多操作',
        icon: '&#xe600;'
    }]
}];
var MenusMap = Magix.toMap(Menus, 'url');
return Magix.View.extend({
    tmpl: "<div class=\"mp-2af-header\"><div class=\"clearfix\"><div class=\"mp-2af-bp-logo\"><h3>Magix Project</h3></div><div class=\"mp-2af-top-nav\"><ul><li><a href=\"#!/home/index\" hidefocus=\"true\">首页</a></li><li><a href=\"#!/coms/index\" hidefocus=\"true\">组件</a></li><li><a href=\"#!/demos/index\" hidefocus=\"true\">经验</a></li></ul></div><div class=\"mp-2af-top-handle\"><a href=\"javascript:;\">行列(xinglie.lkf)</a>,\n        <a href=\"javascript:;\">退出</a></div></div><div class=\"mp-2af-sidebar\" mx-vframe=\"true\" mx-view=\"app/views/partials/header-sidebar\" id=\"sidebar_<%=viewId%>\"></div></div>",
    ctor: function() {
        var me = this;
        me.observe(null, true);
    },
    render: function() {
        var me = this;
        me.data.set({
            viewId: me.id
        }).digest();
        me.mountMenus();
    },
    mountMenus: function() {
        var loc = Router.parse();
        var href = loc.path.substring(0, loc.path.indexOf('/', 1));
        href += '/index';
        var me = this;
        var vf = Magix.Vframe.get('sidebar_' + this.id);
        if (href != me.$lastHref) {
            me.$lastHref = href;
            $('.' + CSSNames['top-nav'] + ' a').removeClass(CSSNames.on);
            $('#' + this.id + ' a[href="#!' + href + '"]').addClass(CSSNames.on);
            if (vf) {
                var info = MenusMap[href];
                vf.invoke('updateMenu', [info ? info.subMenus : null, loc.path]);
            }
        } else if (vf) {
            vf.invoke('updateUrl', [loc.path]);
        }
    }
});
});