/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@index.css');
var CSSNames = 'names@index.css';
var Monitor = require('../bases/monitor');
module.exports = Magix.View.extend({
    tmpl: '@index.html',
    ctor: function(extra) {
        var me = this;
        Monitor.setup();
        me.on('destroy', Monitor.teardown);
        me.$source = extra.source;
        me.$selected = extra.selected;
    },
    inside: function(node) {
        var me = this;
        var inside = Magix.inside(node, me.id);
        return inside;
    },
    update: function(ops) {
        var me = this;
        var map = Magix.toMap(ops.list, 'id');
        if (!ops.selected || !map[ops.selected]) {
            ops.selected = ops.list[0].id;
        }
        me.$list = ops.list;
        me.$picked = ops.picked;
        var val = me.data.get('iptValue');
        var list = me.$list;
        var data = me.data;
        data.set({
            search: ops.search,
            width: ops.width || 150,
            height: ops.height || 0,
            map: map,
            id: me.id,
            titleText: map[ops.selected].text,
            selected: ops.selected
        });
        if (val) {
            me.search(val, function(list) {
                data.set({
                    list: list
                }).digest();
            });
        } else {
            data.set({
                list: list
            }).digest();
        }
    },
    render: function() {
        var me = this;
        if (me.$source == 'script') {
            var html = $.trim($('#' + me.id + ' script').html());
            var list = JSON.parse(html);
            me.update({
                list: list,
                selected: me.$selected
            });
        } else {
            me.endUpdate();
        }
    },
    hide: function(items) {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            items = items || $('#list_' + me.id);
            items.addClass(CSSNames.none);
            var header = $('#header_' + me.id);
            header.removeClass(CSSNames['header-active']);
            var icon = $('#icon_' + me.id);
            icon.html('⇩');
        }
    },
    show: function(items) {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            var doc = $(document);
            var docHeight = doc.height();
            items = items || $('#list_' + me.id);
            items.removeClass(CSSNames.none);
            var header = $('#header_' + me.id);
            header.addClass(CSSNames['header-active']);
            var icon = $('#icon_' + me.id);
            icon.html('⇧');
            var itemsHeight = items.outerHeight();
            if (itemsHeight + items.offset().top > docHeight) {
                items.css({
                    marginTop: -(itemsHeight + header.outerHeight())
                });
            }
            $('#' + me.id).trigger('focusin');
        }
    },
    search: function(val, callback) {
        var me = this;
        clearTimeout(me.$sTimer);
        var srcList = me.$list;
        var newList = [];
        var index = 0;
        var max = srcList.length;
        var go = function() {
            if (index < max) {
                var end = Math.min(index + 400, max);
                for (var i = index, li; i < end; i++) {
                    li = srcList[i];
                    if (li.text.indexOf(val) >= 0) {
                        newList.push(li);
                    }
                }
                index = end;
                me.$sTimer = setTimeout(go, 20);
            } else {
                callback(newList);
            }
        };
        go();
    },
    'hover<mouseout,mouseover>': function(e) {
        var node = $(e.current);
        node[e.type == 'mouseout' ? 'removeClass' : 'addClass'](CSSNames.over);
    },
    'toggle<click>': function() {
        var me = this;
        var items = $('#list_' + me.id);
        if (items.hasClass(CSSNames.none)) {
            me.show(items);
        } else {
            me.hide(items);
        }
    },
    'select<click>': function(e) {
        var me = this;
        var id = e.params.id;
        var data = me.data;
        var selected = data.get('selected');
        if (selected != id) {
            var map = data.get('map');
            data.set({
                selected: id,
                titleText: map[id].text
            }).digest();
            if (me.$picked) {
                Magix.toTry(me.$picked, [map[id]]);
            }
        }
        me.hide();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        setTimeout(me.wrapAsync(function() {//ie8 paste后并不能立即获取到input value
            var val = e.current.value;
            var data = me.data;
            var lastVal = data.get('iptValue');
            if (val != lastVal) {
                me.search(val, function(list) {
                    data.set({
                        list: list,
                        iptValue: val
                    }).digest();
                });
            }
        }), 0);
    }
});