/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Picker = require('../../../../coms/bases/picker');
var Autoscroll = require('../../../../coms/bases/autoscroll');

Magix.applyStyle('@table-settings-fields.css');
var CSSNames = 'names@table-settings-fields.css';
module.exports = Picker.extend({
    tmpl: '@table-settings-fields.html',
    ctor: function() {
        var me = this;
        me.on('destroy', function() {
            $('#ghost_' + me.id).remove();
            $('#bar_' + me.id).remove();
            $('#hghost_' + me.id).remove();
            $('#hbar_' + me.id).remove();
        });
    },
    render: function() {
        this.endUpdate();
    },
    update: function(ops) {
        var me = this;
        if (!me.$shown) {
            var data = me.data;
            data.set({
                id: me.id,
                fields: ops.fields,
                fieldsMap: Magix.toMap(ops.fields, 'id'),
                checkedFields: ops.checkedFields.slice(0),
                checkedMap: Magix.toMap(ops.checkedFields)
            }).digest();
            me.$picked = ops.picked;
            me.show();
        }
    },
    'toggleField<click>': function(e) {
        var params = e.params;
        var data = this.data;
        var checkedFields = data.get('checkedFields');
        var checkedMap = data.get('checkedMap');
        if (e.current.checked) {
            checkedFields.push(params.id);
            checkedMap[params.id] = 1;
        } else {
            for (var i = checkedFields.length - 1; i >= 0; i--) {
                if (checkedFields[i] == params.id) {
                    checkedFields.splice(i, 1);
                }
            }
            delete checkedMap[params.id];
        }
        data.set({
            checkedMap: checkedMap,
            checkedFields: checkedFields
        }).digest();
    },
    'dragStart<mousedown>': function(e) {
        var me = this;
        var autoscroll = new Autoscroll($('#sortable_' + me.id));
        autoscroll.start();
        var dGhostId = 'ghost_' + me.id;
        var bId = 'bar_' + me.id;
        var showDragGhost = function(event) {
            var ghost = $('#' + dGhostId);
            if (!ghost.length) {
                $('body').append('<ul id="' + dGhostId + '" class="' + CSSNames.ghost + '" /><div id="' + bId + '" class="' + CSSNames.bar + '"><div class="' + CSSNames.barh + '" /></div>');
                ghost = $('#' + dGhostId);
            }
            ghost.html('<li>' + event.current.innerHTML + '</li>');
        };
        showDragGhost(e);
        var ghost = $('#' + dGhostId);
        var bar = $('#' + bId);
        var current = $(e.current);
        var width = current.outerWidth();
        var height = current.outerHeight();
        current.addClass(CSSNames.dragged);
        ghost.width(width);
        bar.width(width - 4);

        var lastNode, offset, dir, lastDir, scrolling;
        autoscroll.onscroll = function() { //滚动时隐藏相应的元素
            bar.css({
                left: -9999
            });
            lastNode = '';
            lastDir = '';
            scrolling = true;
        };
        autoscroll.onstop = function() {
            scrolling = false;
        };
        me.beginDrag(e.current, function(event) {
            autoscroll.check(event);
            ghost.css({
                top: event.pageY + 15,
                left: event.pageX + 20
            });
            if (scrolling) return;
            var node = me.nodeFromPoint(event.clientX, event.clientY);
            if (node && node.getAttribute) {
                if (node != lastNode && node.getAttribute('dragdrop') == 'v') {
                    lastNode = node;
                    offset = $(node).offset();
                    lastDir = '';
                }
            }
            if (lastNode) {
                if (event.pageY > offset.top + height / 2) {
                    dir = 'bottom';
                } else {
                    dir = 'top';
                }
                if (dir != lastDir) {
                    lastDir = dir;
                    bar.css({
                        left: offset.left - 3,
                        top: offset.top - 5 + (dir == 'bottom' ? height + 1 : -2)
                    });
                }
            }
        }, function() {
            autoscroll.finish();
            ghost.css({
                left: -99999
            });
            bar.css({
                left: -9999
            });
            current.removeClass(CSSNames.dragged);
            if (!lastDir) return;
            var startIdx = parseInt(current.attr('index'), 10);
            var aimIndex = parseInt(lastNode.getAttribute('index'), 10);
            if (startIdx == aimIndex) return;
            var checkedFields = me.data.get('checkedFields');
            var startItem = checkedFields[startIdx];
            checkedFields.splice(startIdx, 1);
            if (startIdx < aimIndex) {
                checkedFields.splice(aimIndex + (lastDir == 'top' ? -1 : 0), 0, startItem);
            } else {
                checkedFields.splice(aimIndex + (lastDir == 'top' ? 0 : 1), 0, startItem);
            }
            me.data.set({
                checkedFields: checkedFields
            }).digest();
        });
    },
    'dragStartH<mousedown>': function(e) {
        var me = this;
        var autoscroll = new Autoscroll($('#hsortable_' + me.id));
        autoscroll.start();
        var dGhostId = 'hghost_' + me.id;
        var bId = 'hbar_' + me.id;
        var showDragGhost = function(event) {
            var ghost = $('#' + dGhostId);
            if (!ghost.length) {
                $('body').append('<ul id="' + dGhostId + '" class="' + CSSNames.ghost + '" /><div id="' + bId + '" class="' + CSSNames.hbar + '"><div class="' + CSSNames.hbarh + '" /></div>');
                ghost = $('#' + dGhostId);
            }
            ghost.html('<li>' + event.current.innerHTML + '</li>');
        };
        showDragGhost(e);
        var ghost = $('#' + dGhostId);
        var bar = $('#' + bId);
        var current = $(e.current);
        var width = current.outerWidth();
        var height = current.outerHeight();
        current.addClass(CSSNames.dragged);
        ghost.height(height);
        bar.height(height - 4);

        var lastNode, offset, dir, lastDir, scrolling;
        autoscroll.onscroll = function() { //滚动时隐藏相应的元素
            bar.css({
                left: -9999
            });
            lastNode = '';
            lastDir = '';
            scrolling = true;
        };
        autoscroll.onstop = function() {
            scrolling = false;
        };
        me.beginDrag(e.current, function(event) {
            autoscroll.check(event);
            ghost.css({
                top: event.pageY + 15,
                left: event.pageX + 20
            });
            if (scrolling) return;
            var node = me.nodeFromPoint(event.clientX, event.clientY);
            if (node && node.getAttribute) {
                if (node != lastNode && node.getAttribute('dragdrop') == 'h') {
                    lastNode = node;
                    offset = $(node).offset();
                    lastDir = '';
                }
            }
            if (lastNode) {
                if (event.pageX > offset.left + width / 2) {
                    dir = 'right';
                } else {
                    dir = 'left';
                }
                if (dir != lastDir) {
                    lastDir = dir;
                    bar.css({
                        top: offset.top - 3,
                        left: offset.left - 5 + (dir == 'right' ? width + 1 : -2)
                    });
                }
            }
        }, function() {
            autoscroll.finish();
            ghost.css({
                left: -99999
            });
            bar.css({
                left: -9999
            });
            current.removeClass(CSSNames.dragged);
            if (!lastDir) return;
            var startIdx = parseInt(current.attr('index'), 10);
            var aimIndex = parseInt(lastNode.getAttribute('index'), 10);
            if (startIdx == aimIndex) return;
            var checkedFields = me.data.get('checkedFields');
            var startItem = checkedFields[startIdx];
            checkedFields.splice(startIdx, 1);
            if (startIdx < aimIndex) {
                checkedFields.splice(aimIndex + (lastDir == 'left' ? -1 : 0), 0, startItem);
            } else {
                checkedFields.splice(aimIndex + (lastDir == 'left' ? 0 : 1), 0, startItem);
            }
            me.data.set({
                checkedFields: checkedFields
            }).digest();
        });
    },
    'cancel<click>': function() {
        this.hide();
    },
    'enter<click>': function() {
        var me = this;
        var checkedFields = me.data.get('checkedFields');
        if (me.$picked) {
            Magix.toTry(me.$picked, [checkedFields]);
        }
        me.hide();
    }
}, {
    show: function(view, ops) {
        var id = ops.ownerNodeId;
        id = 'tsf_' + id;
        var vf = Magix.Vframe.get(id);
        if (!vf) {
            $('body').append('<div id="' + id + '" />');
            vf = view.owner.mountVframe(id, '@moduleId', ops);
        }
        vf.invoke('update', [ops]);
    }
});