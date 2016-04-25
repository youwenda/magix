define('coms/dialog/index',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-e2e',".mp-e2e-dialog{position:absolute;top:-99999px}.mp-e2e-mask{width:100%;height:100%;position:fixed;opacity:.3;filter:alpha(opacity=30);background:#000;left:0;top:0}.mp-e2e-content{border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,.1);border:1px solid #ddd;background-color:#fff}.mp-e2e-title{font-size:14px;padding:10px}.mp-e2e-body{padding:20px}.mp-e2e-buttons{padding:10px;border-top:1px solid #eee}.mp-e2e-button{height:22px;width:80px;margin-right:5px}.mp-e2e-right{box-shadow:-5px 0 10px rgba(0,0,0,.1);border-right:none}.mp-e2e-left{box-shadow:5px 0 10px rgba(0,0,0,.1);border-left:none}.mp-e2e-top{box-shadow:0 5px 10px rgba(0,0,0,.1);border-top:none}.mp-e2e-fr{float:right}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-e2e-content<%if(options.dockClass){%><%=options.dockClass%><%}%>\" style=\"width:<%=options.width%>px\" tabindex=\"-1\" id=\"cnt_<%=id%>\"><h1 class=\"mp-e2e-title\"><%=options.title%></h1><div class=\"mp-e2e-body\" <%if(options.view){%> mx-view<%}%> id=\"body_<%=id%>\"><%=options.content%></div><%if(!options.view){%><div class=\"mp-e2e-buttons clearfix\"><%var buttons=options.buttons%><%for(var i=0;i<buttons.length;i++){%><button class=\"mp-e2e-button btn mp-e2e-fr\" mx-click=\"click({index:<%=i%>})\"><%=buttons[i].text%></button><%}%></div><%}%></div>",
    ctor: function(extra) {
        var me = this;
        me.$options = extra;
        me.on('destroy', function() {
            $('#mask_' + me.id).remove();
            $('#' + me.id).remove();
        });
    },
    render: function() {
        var me = this;
        var options = me.$options;
        options.dockClass = 'mp-e2e-' + options.dock; //CSSNames[options.dock];
        me.data.set({
            id: me.id,
            options: options
        }).digest();
        var node = $('#' + me.id);
        if (options.view) {
            var vf = Magix.Vframe.get('body_' + me.id);
            if (vf) {
                vf.mountView(options.view, options.viewOptions);
            }
        }
        if (options.mask) {
            node.before('<div id="mask_' + me.id + '" class="mp-e2e-mask" />');
        }
        switch (options.dock) {
            case 'top':
            case 'left':
                node.css({
                    left: options.left,
                    top: options.top
                });
                break;
            case 'right':
                node.css({
                    right: options.right,
                    top: options.top
                });
                break;
            default:
                var win = $(window),
                    left = Math.max((win.width() - options.width) / 2 + win.scrollLeft(), 0),
                    top = Math.max((win.height() - options.height) / 2 + win.scrollTop(), 0);
                node.css({
                    left: left,
                    top: top
                });
                break;
        }
        $('#cnt_' + me.id).focus();
    },
    close: function() {
        var me = this;
        me.owner.unmountVframe();
    },
    'click<click>': function(e) {
        var me = this;
        var options = me.data.get('options');
        var idx = e.params.index;
        var fn = options.buttons[idx].fn;
        if (fn) {
            Magix.toTry(fn);
        }
        me.close();
    }
}, {
    alert: function(view, content, callback) {
        var me = this;
        me.msgbox(view, {
            mask: true,
            content: content,
            buttons: [{
                text: '确定',
                fn: callback
            }]
        });
    },
    confirm: function(view, content, enterCallback, cancelCallback) {
        var me = this;
        me.msgbox(view, {
            mask: true,
            content: content,
            buttons: [{
                text: '取消',
                fn: cancelCallback
            }, {
                text: '确定',
                fn: enterCallback
            }]
        });
    },
    msgbox: function(view, ops) {
        var dOptions = {
            buttons: [],
            title: '提示',
            content: '',
            view: '',
            viewOptions: '',
            mask: false,
            dock: '',
            left: 0,
            top: 0,
            right: 0,
            width: 360,
            height: 150
        };
        Magix.mix(dOptions, ops);
        var id = Magix.guid('dlg_');
        $('body').append('<div id="' + id + '" class="mp-e2e-dialog" />');
        view.owner.mountVframe(id, 'coms/dialog/index', dOptions);
    }
});
});