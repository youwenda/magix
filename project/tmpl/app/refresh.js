/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var HolderReg = /\u001f/g;
var ContentReg = /@(\d+)\-\u001f/g;
var TmplCache = new Magix.Cache();
var BuildHTML = function(tmpl, data, id) {
    var fn = TmplCache.get(tmpl);
    if (!fn) {
        fn = $.tmpl(tmpl);
        TmplCache.set(tmpl, fn);
    }
    return fn(data).replace(HolderReg, id);
};
var Data = function() {
    var me = this;
    me.$data = {};
    me.$json = {};
};
var fn = Data.prototype;
Magix.mix(fn, Magix.Event);
Magix.mix(fn, {
    get: function(key) {
        var result = this.$data;
        if (key) result = result[key];
        return result;
    },
    set: function(key, val) {
        var me = this,
            data = me.$data;
        if ($.isPlainObject(key)) {
            Magix.mix(data, key);
        } else {
            data[key] = val;
        }
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
            try {
                valJSON = JSON.stringify(val);
            } catch (e) {
                lchange = e;
            }
            if (!Magix.has(json, key)) {
                json[key] = valJSON;
                lchange = 1;
            }
            if (!lchange) {
                lchange = valJSON != json[key];
                json[key] = valJSON;
            }
            if (lchange) {
                keys[key] = changed = 1;
            }
        }
        me.onapply(keys, changed, data);
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
        try {
            me.$ss = JSON.stringify(me.$json);
        } catch (e) {

        }
        return me;
    },
    altered: function() {
        var me = this;
        if (me.$ss) { //存在快照
            try {
                if (!me.$lss) me.$lss = JSON.stringify(me.$json); //不存在比较的快照，生成
                return me.$ss != me.$lss; //比较2次快照是否一样
            } catch (e) {
                console.error(e);
            }
        }
        return true;
    }
});
Magix.View.merge({
    ctor: function() {
        var me = this;
        me.data = new Data();
        me.data.onapply = function(keys, changed, data) {
            if (changed || !me.$rd) {
                me.updateHTML(keys, data);
            }
        };
    },
    toHTML: function(tmpl, data) {
        return BuildHTML(tmpl, data, this.id);
    },
    updateHTML: function(updateFlags, renderData) {
        var me = this;
        var selfId = me.id;
        if (me.$rd && updateFlags) {
            var list = me.tmplData;
            var updatedNodes = {},
                keys;
            var one, updateTmpl, updateAttrs;
            var updateNode = function(index, node) {
                var id = node.id || (node.id = Magix.guid('n'));
                if (!updatedNodes[id]) {
                    updatedNodes[id] = 1;
                    var vf = one.view && Magix.Vframe.get(id);
                    if (updateAttrs) {
                        for (var i = one.attrs.length - 1; i >= 0; i--) {
                            var attr = one.attrs[i];
                            var val = BuildHTML(attr.v, renderData);
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
                        me.setHTML(id, BuildHTML(one.tmpl, renderData, selfId));
                    }
                    if (vf) {
                        vf.mountView(BuildHTML(one.view, renderData, selfId));
                    }
                }
            };
            for (var i = list.length - 1, update, q, mask; i >= 0; i--) { //keys
                updateTmpl = 0;
                updateAttrs = 0;
                one = list[i];
                update = 1;
                mask = one.mask;
                keys = one.pKeys;
                if (keys) {
                    q = keys.length;
                    while (--q >= 0) {
                        if (Magix.has(updateFlags, keys[q])) {
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
                        if (Magix.has(updateFlags, keys[q])) {
                            update = 1;
                            if (!mask || (updateTmpl && updateAttrs)) {
                                break;
                            }
                            if (!updateTmpl && (mask.charAt(2 * q) & 1)) {
                                updateTmpl = 1;
                            }
                            if (!updateAttrs && (mask.charAt(2 * q + 1) & 1)) {
                                updateAttrs = 1;
                            }
                        }
                    }
                    if (update) {
                        if (!mask) {
                            if (one.tmpl) updateTmpl = 1;
                            if (one.attrs) updateAttrs = 1;
                        }
                        update = '#' + selfId + ' ' + one.selector.replace(HolderReg, selfId);
                        $(update).each(updateNode);
                    }
                }
            }
        } else {
            var map = {},
                tmplment = function(m, guid) {
                    return map[guid].tmpl;
                },
                tmplData = me.tmplData,
                x;
            if (tmplData) {
                if (!tmplData.$) { //process once
                    tmplData.$ = map;
                    x = tmplData.length;
                    while (x > 0) {
                        var s = tmplData[--x];
                        if (s.guid) {
                            map[s.guid] = s;
                            s.tmpl = s.tmpl.replace(ContentReg, tmplment);
                            delete s.guid;
                        }
                    }
                } else {
                    map = tmplData.$;
                }
            }
            var tmpl = me.tmpl.replace(ContentReg, tmplment);
            me.$rd = 1;
            me.setHTML(selfId, BuildHTML(tmpl, renderData, selfId));
        }
    }
});