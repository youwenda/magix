/*
    author:xinglie.lkf@taobao.com
 */
var $ = require('$');
var Win = $(window);
var Doc = $(document);
var IsW3C = window.getComputedStyle;
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

module.exports = {
    begin: function(node, moveCallback, endCallback) {
        DragStop();
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
    fromPoint: function(x, y) {
        var node = null;
        if (document.elementFromPoint) {
            if (!DragPrevent.$fixed && IsW3C) {
                DragPrevent.$fixed = true;
                DragPrevent.$add = document.elementFromPoint(-1, -1) !== null;
            }
            if (DragPrevent.$add) {
                x += Win.scrollLeft();
                y += Win.scrollTop();
            }
            node = document.elementFromPoint(x, y);
            while (node && node.nodeType == 3) node = node.parentNode;
        }
        return node;
    },
    clear: ClearSelection,
    end: DragStop
};