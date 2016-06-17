/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('@index.css');
var Monitor = require('../bases/monitor');
var EnhanceMax = 100;
var EnhanceItemHeight = 25;
var EnhanceOffsetItems = 20;
var TOP = 1,
    BOTTOM = 2;
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
            tip: '',
            before: 0,
            after: 0,
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
                me.enhance(data, list);
            });
        } else {
            me.enhance(data, list);
        }
    },
    scroll: function(data) {
        var me = this;
        var scroll = Magix.node('scroll_' + me.id);
        //scroll.scrollTop = 0;
        var before = data.get('before'),
            after = data.get('after');
        scroll.onscroll = function() {
            var list = me.$rlist;
            var top = scroll.scrollTop;
            var to = '';
            if (after > 0 && top + EnhanceOffsetItems * EnhanceItemHeight > before + EnhanceMax * EnhanceItemHeight) {
                to = BOTTOM;
            } else if (before > 0 && top < before + EnhanceOffsetItems * EnhanceItemHeight) {
                to = TOP;
            }
            if (to) {
                var items = to == TOP ? EnhanceMax - EnhanceOffsetItems : EnhanceOffsetItems;
                before = Math.max(top - items * EnhanceItemHeight, 0);
                after = Math.max(list.length * EnhanceItemHeight - before - EnhanceMax * EnhanceItemHeight, 0);
                var start = Math.floor(before / EnhanceItemHeight);
                data.set({
                    before: before,
                    after: after,
                    list: list.slice(start, start + EnhanceMax)
                }).digest();
            }
        };
    },
    enhance: function(data, list) {
        var max = list.length,
            me = this;
        me.$rlist = list;
        var scroll = Magix.node('scroll_' + me.id);
        if (scroll) scroll.scrollTop = 0;
        if (max > EnhanceMax) {
            var totalHeight = max * EnhanceItemHeight;
            var before = 0,
                after = totalHeight - EnhanceMax * EnhanceItemHeight,
                newList = list.slice(0, EnhanceMax);
            data.set({
                before: before,
                after: after,
                list: newList
            }).digest();
            if (!scroll) me.scroll(data);
        } else {
            data.set({
                before: 0,
                after: 0,
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
            items.addClass('@index.css:none');
            var header = $('#header_' + me.id);
            header.removeClass('@index.css:header-active'); //'';
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
            items.removeClass('@index.css:none');
            var header = $('#header_' + me.id);
            header.addClass('@index.css:header-active');
            var icon = $('#icon_' + me.id);
            icon.html('⇧');
            var itemsHeight = items.outerHeight();
            if (itemsHeight + items.offset().top > docHeight) {
                items.css({
                    marginTop: -(itemsHeight + header.outerHeight())
                });
            } else {
                items.css({
                    marginTop: 0
                });
            }
            $('#' + me.id).trigger('focusin');
        }
    },
    search: function(val, callback) {
        var me = this;
        clearTimeout(me.$goTimer);
        var srcList = me.$list;
        var newList = [];
        var index = 0;
        var max = srcList.length;
        if (!val) {
            callback(srcList);
            return;
        }
        var go = function() {
            if (index < max) {
                var end = Math.min(index + 400, max);
                for (var i = index, li; i < end; i++) {
                    li = srcList[i];
                    if ((li.text + '').indexOf(val) >= 0) {
                        newList.push(li);
                    }
                }
                index = end;
                me.$goTimer = setTimeout(me.wrapAsync(go), 20);
            } else {
                callback(newList);
            }
        };
        go();
    },
    'hover<mouseout,mouseover>': function(e) {
        var node = $(e.current);
        node[e.type == 'mouseout' ? 'removeClass' : 'addClass']('@index.css:over');
    },
    'toggle<click>': function() {
        var me = this;
        var items = $('#list_' + me.id);
        if (items.hasClass('@index.css:none')) {
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
        clearTimeout(me.$stimer);
        me.$stimer = setTimeout(me.wrapAsync(function() { //ie8 paste后并不能立即获取到input value
            var val = e.current.value;
            var data = me.data;
            var lastVal = data.get('iptValue');
            if (val != lastVal) {
                data.set({
                    tip: '处理中...'
                }).digest();
                me.search(val, function(list) {
                    data.set({
                        tip: '',
                        iptValue: val
                    });
                    me.enhance(data, list);
                });
            }
        }), 150);
    }
});