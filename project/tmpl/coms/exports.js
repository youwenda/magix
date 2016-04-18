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
    if (DragObject.iMove) {
        DragObject.move(event, DragObject.pos);
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
    beginDrag: function(event, node, moveCallback, endCallback) {
        node = Magix.node(node);
        if (node) {
            event.preventDefault();
            ClearSelection();
            if (node.setCapture) {
                node.setCapture();
            }
            DragObject = {
                move: moveCallback,
                stop: endCallback,
                node: node,
                pos: event,
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