/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Monitor = require('../../../coms/bases/monitor');
var $ = require('$');
Magix.applyStyle('@autocomplete.css');
var CSSNames = 'names@autocomplete.css';
module.exports = Magix.View.extend({
    tmpl: '@autocomplete.html',
    ctor: function() {
        Monitor.setup();
        var me = this;
        me.on('destroy', Monitor.teardown);
        me.$sIndex = -1;
        me.data.on('changed', function(e) {
            if (e.keys.list) {
                me.$sIndex = -1;
            }
        });
    },
    render: function() {
        var me = this;
        me.request().all('list', function(err, bag) {
            me.data.set({
                id: me.id,
                list: me.$src = bag.get('data', [])
            }).digest();
        });
    },
    inside: function(node) {
        var me = this;
        return Magix.inside(node, 'list_' + me.id) ||
            Magix.inside(node, 'ipt_' + me.id);
    },
    hide: function() {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            $('#list_' + me.id).addClass(CSSNames.none);
        }
    },
    normalPre: function() {
        var me = this;
        if (me.$sIndex != -1) {
            $('#idx_' + me.$sIndex).removeClass(CSSNames.over);
        }
    },
    highlight: function() {
        var me = this;
        if (me.$sIndex != -1) {
            $('#idx_' + me.$sIndex).addClass(CSSNames.over);
        }
    },
    fillText: function() {
        var me = this;
        var item = $('#idx_' + me.$sIndex);
        var text = item.data('text');
        $('#ipt_' + me.id).val(text);
        me.search(text);
    },
    show: function() {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            $('#list_' + me.id).removeClass(CSSNames.none);
        }
    },
    search: function(value, show) {
        var me = this;
        clearTimeout(me.$timer);
        me.$timer = setTimeout(me.wrapAsync(function() {
            if (value != me.data.get('iptValue')) {
                var newList = [];
                for (var i = 0; i < me.$src.length; i++) {
                    if (me.$src[i].text.indexOf(value) >= 0) {
                        newList.push(me.$src[i]);
                    }
                }
                me.data.set({
                    iptValue: value,
                    list: newList
                }).digest();
                console.log(show, value);
                if (show) {
                    me.show();
                }
            }
        }), 150);
    },
    'showList<click>': function() {
        this.show();
    },
    'hover<mouseover>': function(e) {
        var me = this;
        me.normalPre();
        if (e.type == 'mouseover') {
            me.$sIndex = e.params.index;
            me.highlight();
        }
    },
    'fill<click>': function() {
        var me = this;
        me.fillText();
        me.hide();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        setTimeout(me.wrapAsync(function() {
            if (e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13) {
                me.search(e.current.value, true);
            }
        }), 0);
    },
    'select<keydown>': function(e) {
        var me = this;
        var max = me.data.get('list').length - 1;
        if (max < 0) return;
        if (e.keyCode == 38) { //UP
            if (!me.$shown) me['showList<click>']();
            e.preventDefault();
            me.normalPre();
            me.$sIndex--;
            if (me.$sIndex < 0) {
                me.$sIndex = max;
            }
            me.highlight();
        } else if (e.keyCode == 40) { //DOWN
            if (!me.$shown) me['showList<click>']();
            e.preventDefault();
            me.normalPre();
            me.$sIndex++;
            if (me.$sIndex > max) {
                me.$sIndex = 0;
            }
            me.highlight();
        } else if (e.keyCode == 13) {
            if (me.$sIndex != -1) {
                me.fillText();
                me.hide();
            }
        }
    },
    'leave<mouseout>': function(e) {
        var me = this;
        if (!Magix.inside(e.relatedTarget, e.current)) {
            me.normalPre();
            me.$sIndex = -1;
        }
    }
});