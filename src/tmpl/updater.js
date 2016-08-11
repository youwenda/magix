var Updater_HolderReg = /\u001f/g;
var Updater_ContentReg = /@(\d+)\-\u001f/g;
var Updater_Stringify = JSON.stringify;
var Updater_UpdateDOM = function(host, changed, updateFlags, renderData) {
    var view = host.$v;
    var tmplData = view.tmpl;
    var selfId = view.id;
    var build = function(tmpl, data) {
        return Tmpl(tmpl, data).replace(Updater_HolderReg, selfId);
    };
    var tmpl = tmplData.html;
    var list = tmplData.subs;
    if (changed || !host.$rd) {
        if (host.$rd && updateFlags && list) {
            var updatedNodes = {},
                keys;
            var one, updateTmpl, updateAttrs;
            var updateNode = function(node) {
                var id = node.id || (node.id = G_Id('n'));
                if (!updatedNodes[id]) {
                    //console.time('update:' + id);
                    updatedNodes[id] = 1;
                    var vf = one.view && Vframe_Vframes[id];
                    if (updateAttrs) {
                        for (var i = one.attrs.length - 1; i >= 0; i--) {
                            var attr = one.attrs[i];
                            var val = build(attr.v, renderData);
                            if (attr.p) {
                                node[attr.n] = val;
                            } else {
                                node.setAttribute(attr.n, val);
                            }
                        }
                    }
                    if (vf) {
                        vf.unmountView();
                    }
                    if (one.tmpl && updateTmpl) {
                        view.setHTML(id, build(one.tmpl, renderData));
                    }
                    if (vf) {
                        vf.mountView(build(one.view, renderData));
                    }
                    //console.timeEnd('update:' + id);
                }
            };
            for (var i = list.length - 1, update, q, mask, m; i >= 0; i--) { //keys
                updateTmpl = 0;
                updateAttrs = 0;
                one = list[i];
                update = 1;
                mask = one.mask;
                keys = one.pKeys;
                if (keys) {
                    q = keys.length;
                    while (--q >= 0) {
                        if (G_Has(updateFlags, keys[q])) {
                            update = 0;
                            break;
                        }
                    }
                }
                if (update) {
                    keys = one.keys;
                    q = keys.length;
                    update = 0;
                    while (--q >= 0) {
                        if (G_Has(updateFlags, keys[q])) {
                            update = 1;
                            if (!mask || (updateTmpl && updateAttrs)) {
                                updateTmpl = one.tmpl;
                                updateAttrs = one.attrs;
                                break;
                            }
                            m = mask.charAt(q);
                            updateTmpl = updateTmpl || m & 1;
                            updateAttrs = updateAttrs || m & 2;
                        }
                    }
                    if (update) {
                        update = '#' + selfId + ' ' + one.selector.replace(Updater_HolderReg, selfId);
                        var nodes = document.querySelectorAll(update);
                        q = 0;
                        while (q < nodes.length) {
                            updateNode(nodes[q++]);
                        }
                    }
                }
            }
        } else {
            var map,
                tmplment = function(m, guid) {
                    return map[guid].tmpl;
                },
                x;
            if (list) {
                if (!list.$) { //process once
                    list.$ = map = {};
                    x = list.length;
                    while (x > 0) {
                        var s = list[--x];
                        if (s.guid) {
                            map[s.guid] = s;
                            s.tmpl = s.tmpl.replace(Updater_ContentReg, tmplment);
                            delete s.guid;
                        }
                    }
                }
                map = list.$;
            }
            host.$rd = 1;
            var str = tmpl.replace(Updater_ContentReg, tmplment);
            view.setHTML(selfId, build(str, renderData));
        }
    }
};
var Updater = function(view) {
    var me = this;
    me.$v = view;
    me.$data = {};
    me.$json = {};
};
var UP = Updater.prototype;
G_Mix(UP, Event);
G_Mix(UP, {
    get: function(key) {
        var result = this.$data;
        if (key) result = result[key];
        return result;
    },
    set: function(obj) {
        var me = this;
        G_Mix(me.$data, obj);
        return me;
    },
    digest: function() {
        var me = this;
        var data = me.$data;
        var json = me.$json;
        var keys = {};
        var changed, val, key, valJSON, lchange;
        for (key in data) {
            val = data[key];
            lchange = 0;
            valJSON = Updater_Stringify(val);
            if (!G_Has(json, key)) {
                json[key] = valJSON;
                lchange = 1;
            } else {
                lchange = valJSON != json[key];
                json[key] = valJSON;
            }
            if (lchange) {
                keys[key] = changed = 1;
            }
        }
        Updater_UpdateDOM(me, changed, keys, data);
        if (changed) {
            me.fire('changed', {
                keys: keys
            });
            delete me.$lss;
        }
        return me;
    },
    snapshot: function() {
        var me = this;
        me.$ss = Updater_Stringify(me.$json);
        return me;
    },
    altered: function() {
        var me = this;
        if (me.$ss) { //存在快照
            if (!me.$lss) me.$lss = JSON.stringify(me.$json); //不存在比较的快照，生成
            return me.$ss != me.$lss; //比较2次快照是否一样
        }
        return true;
    }
});