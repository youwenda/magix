define("coms/exports",['magix','$'],function(require){
/*Magix ,$ */
/*
    author: xinglie.lkf@ taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-f7d',"a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}");
Magix.applyStyle('mp-fb7',".table{width:100%;max-width:100%;border-collapse:collapse;border-spacing:0}.table th{background-color:#ebebeb;font-weight:400;padding:7px 5px 6px;color:#999;text-align:left}.table tbody td,.table th{border-bottom:1px solid #e1e1e1}.table tbody td{padding:10px 5px 9px}.table tfoot td{background-color:#f7f7f7;border-bottom:1px solid #e1e1e1;padding:10px 14px}.table tbody tr:hover td{background-color:#ebebeb}.table tbody .operation{visibility:hidden}.table tbody tr:hover .operation{visibility:visible}.table-child{width:100%}.table-child thead th{border:0;background:none;border-bottom:1px dashed #e1e1e1}.table-child tbody td{border:0}.table-child tbody tr td{background:none!important;border-bottom:1px solid #e1e1e1}.table-child tbody tr:hover td{background:#ebebeb!important}.table-child tbody tr:hover .operation{visibility:visible!important}.table-child tbody tr:last-child td{border-bottom:none}.table-child tbody tr .operation{visibility:hidden!important;_visibility:visible}.table tbody tr:hover td.table-child-td{background:0}");
Magix.applyStyle('mp-e9d',".input,.textarea{display:inline-block;width:210px;height:18px;padding:2px 8px 3px;line-height:18px;color:#333;border:1px solid #ddd;border-top-color:#bbb;border-radius:2px;-webkit-transition:border linear .2s,box-shadow linear .2s;transition:border linear .2s,box-shadow linear .2s}.input:hover,.textarea:hover{border-color:#ccc;border-top-color:#999;box-shadow:inset 0 1px #f5f5f5}.input:focus,.textarea:focus{border-color:#488fcd;outline:0;box-shadow:0 0 8px rgba(72,143,205,.6)}.textarea{padding-top:4px;padding-right:4px;height:auto}.btn{box-sizing:content-box;display:inline-block;border:1px solid #ddd;*border:none;border-radius:2px;*margin-right:.3em;margin-bottom:0;padding:0 10px;*padding:1px 10px;width:auto;height:21px;line-height:21px;font-size:12px;font-weight:700;cursor:pointer;border-bottom-color:#bbb;background-color:#f4f4f4;background-image:-webkit-gradient(linear,0 0,0 100%,from(#f8f8f8),to(#eee));background-image:-webkit-linear-gradient(top,#f8f8f8,#eee);background-image:linear-gradient(top,#f8f8f8,#eee);background-repeat:repeat-x;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f8f8f8',endColorstr='#eeeeee',GradientType=0)}.btn,.btn:hover,.btn:visited{color:#333!important}.btn:hover{box-shadow:none;background-color:#ededed;background-image:-webkit-gradient(linear,0 0,0 100%,from(#f2f2f2),to(#e6e6e6));background-image:-webkit-linear-gradient(top,#f2f2f2,#e6e6e6);background-image:linear-gradient(top,#f2f2f2,#e6e6e6);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f2f2f2',endColorstr='#e6e6e6',GradientType=0)}.btn:active,.btn:hover{background-repeat:repeat-x}.btn:active{background-color:#ebebeb;background-image:-webkit-gradient(linear,0 0,0 100%,from(#e6e6e6),to(#f2f2f2));background-image:-webkit-linear-gradient(top,#e6e6e6,#f2f2f2);background-image:linear-gradient(top,#e6e6e6,#f2f2f2);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#e6e6e6',endColorstr='#f2f2f2',GradientType=0)}.btn-size45,.btn-xlarge{padding:0 20px;height:43px;line-height:43px;font-size:18px}.btn-large,.btn-size40{padding:0 20px;height:38px;line-height:38px;font-size:14px}.btn-medium,.btn-size30{height:28px;line-height:28px;padding:0 20px}.btn-size28,.btn-small{height:26px;line-height:26px;padding:0 20px}.btn-size25,.btn-xsmall{height:23px;line-height:23px}.validator-error{border:1px solid red}");
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
return Magix.View.merge({
    menu: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) vf = me.owner.mountVframe(id, 'coms/menu/index');
        vf.invoke('update', ops);
    },
    contextmenu: function(ops) {
        var me = this;
        LoadView(me, 'coms/menu/context', function(Contextmenu) {
            Contextmenu.show(me, ops);
        });
    },
    dropdown: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) vf = me.owner.mountVframe(id, 'coms/dropdown/index');
        vf.invoke('update', [ops]);
    },
    calendar: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) {
            vf = me.owner.mountVframe(id, 'coms/calendar/index');
        }
        vf.invoke('update', [ops]);
    },
    datepicker: function(ops) {
        var me = this;
        LoadView(me, 'coms/calendar/datepicker', function(Calendar) {
            Calendar.show(me, ops);
        });
    },
    colorpicker: function(ops) {
        var me = this;
        LoadView(me, 'coms/colorpicker/index', function(Colorpicker) {
            Colorpicker.show(me, ops);
        });
    },
    rangepicker: function(ops) {
        var me = this;
        LoadView(me, 'coms/calendar/rangepicker', function(Rangepicker) {
            Rangepicker.show(me, ops);
        });
    },
    pagination: function(id, ops) {
        var me = this;
        var vf = Vframe.get(id);
        if (!vf) {
            vf = me.owner.mountVframe(id, 'coms/pagination/index');
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
});