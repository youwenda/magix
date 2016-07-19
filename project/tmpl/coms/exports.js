/*
    author: xinglie.lkf@ taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('global@exports-reset.css');
Magix.applyStyle('global@exports-table.css');
Magix.applyStyle('global@exports-form.css');
Magix.applyStyle('global@exports-animate.css');
var Vframe = Magix.Vframe;
var LoadView = function(owner, path, callback) {
    seajs.use(path, owner.wrapAsync(function(T) {
        callback(T);
    }));
};

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
    }
});