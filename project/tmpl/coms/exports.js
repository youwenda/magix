/*
    author: xinglie.lkf@ taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('global@exports-reset.css');
Magix.applyStyle('global@exports-table.css');
Magix.applyStyle('global@exports-form.css');
Magix.applyStyle('global@exports-animate.css');
var Vframe = Magix.Vframe;
var Win = $(window);
var Doc = $(document);
var LoadView = function(owner, path, callback) {
    seajs.use(path, owner.wrapAsync(function(T) {
        callback(T);
    }));
};
var ClearSelection = function(t) {
    if ((t = window.getSelection)) {
        t().removeAllRanges();
    } else if ((t = window.document.selection)) {
        if (t.empty) t.empty();
        else t = null;
    }
};
var DragObject;
var DragPrevent = function(e) {
    e.preventDefault();
};
var DragMove = function(event) {
    ClearSelection();
    if (DragObject.iMove) {
        DragObject.move(event);
    }
};
var DragStop = function(e) {
    if (DragObject) {
        Doc.off('mousemove', DragMove)
            .off('mouseup', DragStop)
            .off('keydown mousewheel DOMMouseScroll', DragPrevent);
        Win.off('blur', DragStop);
        var node = DragObject.node;
        $(node).off('losecapture', DragStop);
        if (node.setCapture) node.releaseCapture();
        if (DragObject.iStop) {
            DragObject.stop(e);
        }
        DragObject = null;
    }
};
var IsW3C = window.getComputedStyle;
module.exports = Magix.View.merge({
    menu: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) vf = me.owner.mountVframe(id, '@./menu/index');
        vf.invoke('update', ops);
    },
    contextmenu: function(ops) {
        var me = this;
        LoadView(me, '@./menu/context', function(Contextmenu) {
            Contextmenu.show(me, ops);
        });
    },
    dropdown: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) vf = me.owner.mountVframe(id, '@./dropdown/index');
        vf.invoke('update', [ops]);
    },
    calendar: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) {
            vf = me.owner.mountVframe(id, '@./calendar/index');
        }
        vf.invoke('update', [ops]);
    },
    datepicker: function(ops) {
        var me = this;
        LoadView(me, '@./calendar/datepicker', function(Calendar) {
            Calendar.show(me, ops);
        });
    },
    colorpicker: function(ops) {
        var me = this;
        LoadView(me, '@./colorpicker/index', function(Colorpicker) {
            Colorpicker.show(me, ops);
        });
    },
    rangepicker: function(ops) {
        var me = this;
        LoadView(me, '@./calendar/rangepicker', function(Rangepicker) {
            Rangepicker.show(me, ops);
        });
    },
    pagination: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) {
            vf = me.owner.mountVframe(id, '@./pagination/index');
        }
        vf.invoke('update', [ops]);
    },
    tree: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) {
            vf = me.owner.mountVframe(id, '@./tree/index');
        }
        vf.invoke('update', [ops]);
    },
    listToTree: function(list, id, pId) {
        if (!list._processed) {
            list._processed = 1;
            id = id || 'id';
            pId = pId || 'pId';
            var map = {},
                listMap = {},
                rootList = [];
            for (var i = 0, max = list.length; i < max; i++) {
                var one = list[i];
                map[one[id]] = one;
                if (listMap[one[id]]) {
                    one.children = listMap[one[id]];
                }
                if (one[pId]) {
                    if (map[one[pId]]) {
                        var c = map[one[pId]].children || (map[one[pId]].children = []);
                        c.push(one);
                    } else {
                        if (!listMap[one[pId]]) listMap[one[pId]] = [one];
                        else listMap[one[pId]].push(one);
                    }
                } else {
                    rootList.push(one);
                }
            }
            list.list = rootList;
            list.map = map;
        }
        return list;
    },
    beginDrag: function(node, moveCallback, endCallback) {
        if (node) {
            ClearSelection();
            if (node.setCapture) {
                node.setCapture();
            }
            DragObject = {
                move: moveCallback,
                stop: endCallback,
                node: node,
                iMove: $.isFunction(moveCallback),
                iStop: $.isFunction(endCallback)
            };
            Doc.on('mousemove', DragMove)
                .on('mouseup', DragStop)
                .on('keydown mousewheel DOMMouseScroll', DragPrevent);
            Win.on('blur', DragStop);
            $(node).on('losecapture', DragStop);
        }
    },
    clearSelection: ClearSelection,
    endDrag: DragStop,
    nodeFromPoint: function(x, y) {
        var node = null;
        if (document.elementFromPoint) {
            if (!DragPrevent.$fixed && IsW3C) {
                DragPrevent.$fixed = true;
                DragPrevent.$add = document.elementFromPoint(-1, -1) !== null;
            }
            //console.dir(DragPrevent);
            if (DragPrevent.$add) {
                x += Win.scrollLeft();
                y += Win.scrollTop();
            }
            node = document.elementFromPoint(x, y);
            while (node && node.nodeType == 3) node = node.parentNode;
        }
        return node;
    }
});