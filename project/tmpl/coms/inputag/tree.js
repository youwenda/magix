/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@tree.css');
var CSSNames = 'names@tree.css';
var $ = require('$');
var Monitor = require('../bases/monitor');
module.exports = Magix.View.extend({
    tmpl: '@tree.html',
    ctor: function(extra) {
        Monitor.setup();
        var me = this;
        me.on('destroy', Monitor.teardown);
        me.$list = extra.list;
        me.$selected = extra.selected;
    },
    inside: function(node) {
        var me = this;
        return Magix.inside(node, 'list_' + me.id) ||
            Magix.inside(node, 'tags_' + me.id);
    },
    render: function() {
        var me = this;
        me.data.set({
            iptValue: '',
            id: me.id,
            selected: me.$selected
        }).digest();
        var info = me.listToTree(me.$list, 'id', 'pId');
        me.$info = info;
        me.owner.mountVframe('list_' + me.id, '@./branch', {
            id: 'id',
            pId: 'pId',
            text: 'text'
        });
        me.updateInputWidth();
    },
    getInfo: function() {
        var me = this;
        return {
            list: me.$info.list,
            onClick: function(e) {
                var data = me.data;
                var text = e.text;
                var selected = data.get('selected');
                selected.push(text);
                data.set({
                    selected: selected
                }).digest();
                me.updateInputWidth();
                me.focusInput();
            }
        };
    },
    hide: function() {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            $('#list_' + me.id).addClass(CSSNames.none);
        }
    },
    updateInputWidth: function() {
        var me = this;
        var last = $('#iptw_' + me.id);
        last.width(20);
        var left = last.position().left;
        var width = 330 - left - 30;
        last.width(width > 20 ? width : 20);
    },
    focusInput: function() {
        var ipt = Magix.node('ipt_' + this.id);
        ipt.select();
        if (ipt.setSelectionRange) {
            ipt.setSelectionRange(ipt.value.length, ipt.value.length);
        }
        ipt.focus();
    },
    'showList<click>': function() {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            $('#list_' + me.id).removeClass(CSSNames.none);
        }
        me.focusInput();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        clearTimeout(me.$timer);
        var data = me.data;
        var lastValue = data.get('iptValue');
        me.$timer = setTimeout(me.wrapAsync(function() {
            var newList = [];
            var val = e.current.value;
            var list = me.$list;
            if (val != data.get('iptValue')) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].text.indexOf(val) >= 0) {
                        newList.push(list[i]);
                    }
                }
                data.set({
                    iptValue: val,
                    list: newList
                }).digest();
            }
        }), 150);

        if (e.type == 'keyup' && e.keyCode == 8 && !lastValue) {
            var selected = me.data.get('selected');
            selected.pop();
            me.data.digest();
            me.updateInputWidth();
            me.focusInput();
        }
    },
    'remove<click>': function(e) {
        e.stopPropagation();
        var me = this;
        var selected = me.data.get('selected');
        selected.splice(e.params.index, 1);
        me.data.digest({
            selected: selected
        });
        me.hide();
        me.updateInputWidth();
    }
});