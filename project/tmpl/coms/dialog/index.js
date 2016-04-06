/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@index.css');
var CSSNames = 'names@index.css';
module.exports = Magix.View.extend({
    tmpl: '@index.html',
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
        options.dockClass = CSSNames[options.dock];
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
            node.before('<div id="mask_' + me.id + '" class="' + CSSNames.mask + '" />');
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
        $('body').append('<div id="' + id + '" class="' + CSSNames.dialog + '" />');
        view.owner.mountVframe(id, '@moduleId', dOptions);
    }
});