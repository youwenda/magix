/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@tags.css');
var CSSNames = 'names@tags.css';
var $ = require('$');
var Monitor = require('../../../coms/bases/monitor');
module.exports = Magix.View.extend({
    tmpl: '@tags.html',
    ctor: function() {
        Monitor.setup();
        var me = this;
        me.on('destroy', Monitor.teardown);
    },
    inside: function(node) {
        var me = this;
        return Magix.inside(node, 'list_' + me.id) ||
            Magix.inside(node, 'tags_' + me.id);
    },
    render: function() {
        var me = this;
        me.request().all('list', function(err, bag) {
            var selected = [
                'abc',
                'abc123123123123123123123aaabbbdddadfasdfasdfasdfasdf',
                'abc',
                'abc'
            ];
            me.data.set({
                iptValue: '',
                id: me.id,
                selected: selected,
                list: me.$src = bag.get('data', [])
            }).digest();
            me.updateInputWidth();
        });
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
    'hover<mouseover,mouseout>': function(e) {
        $(e.current)[e.type == 'mouseout' ? 'removeClass' : 'addClass'](CSSNames.over);
    },
    'showList<click>': function() {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            $('#list_' + me.id).removeClass(CSSNames.none);
            me.focusInput();
        }
    },
    'fill<click>': function(e) {
        var data = this.data;
        var text = e.params.text;
        var selected = data.get('selected');
        var me = this;
        selected.push(text);
        data.set({
            selected: selected
        }).digest();
        me.updateInputWidth();
        //me.hide();
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
            if (val != data.get('iptValue')) {
                console.log('search');
                for (var i = 0; i < me.$src.length; i++) {
                    if (me.$src[i].text.indexOf(val) >= 0) {
                        newList.push(me.$src[i]);
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
            console.log(selected);
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
        me.updateInputWidth();
    },
    'test<click>': function(e) {
        //$(e.current).remove();
        e.current.parentNode.removeChild(e.current);
        var start = e.current;
        while (start) {
            alert([start,start.nodeType]);
            start = start.parentNode;
            alert(start);
        }
    }
});