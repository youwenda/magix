define("coms/calendar/datepicker",['magix','$','../bases/picker'],function(require){
/*Magix ,$ ,Picker */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Picker = require('../bases/picker');
var Base = Picker.prototype;
var Vframe = Magix.Vframe;
return Picker.extend({
    tmpl: "<div id=\"cal_<%=id%>\"></div>",
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
        me.calendar('cal_' + me.id);
    },
    update: function(ops) {
        var me = this;
        var vf = Vframe.get('cal_' + me.id);
        var picked = ops.picked;
        ops.picked = function(e) {
            me.hide();
            if (picked) {
                Magix.toTry(picked, e);
            }
        };
        vf.invoke('update', [ops]);
        me.show();
    }
}, {
    show: function(view, ops) {
        var id = ops.id;
        if (!id) {
            id = 'dp_' + ops.ownerNodeId;
        }
        var vf = Magix.Vframe.get(id);
        if (!vf) {
            $('body').append('<div id="' + id + '" />');
            vf = view.owner.mountVframe(id, 'coms/calendar/datepicker', ops);
        }
        vf.invoke('update', [ops]);
    }
});
});