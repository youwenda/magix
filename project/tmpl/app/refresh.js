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
var Diff = function(val, json, key) {
    if (!Magix.has(json, key)) {
        try {
            json[key] = JSON.stringify(val);
        } catch (e) {

        }
        return true;
    }
    try {
        var str1 = JSON.stringify(val);
        var str2 = json[key];
        if (str1 != str2) {
            json[key] = str1;
            return true;
        }
    } catch (e) { //无法调用stringfy
        return true;
    }
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
        var changed;
        for (var p in data) {
            if (Diff(data[p], json, p)) {
                keys[p] = 1;
                changed = 1;
            }
        }
        me.onapply(keys, changed);
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
        me.data.onapply = function(keys, changed) {
            if (changed || !me.$rd) {
                me.updateHTML(keys);
            }
        };
    },
    toHTML: function(tmpl, data) {
        return BuildHTML(tmpl, data, this.id);
    },
    updateHTML: function(updateFlags) {
        //console.time('update');
        console.log(updateFlags);
        var me = this;
        //console.log(me);
        if (me.$rd && updateFlags) {
            var list = me.tmplData;
            var updatedNodes = {};
            var one, renderData = me.data.get();
            var updateNode = function(index, node) {
                var id = node.id;
                if (!id) node.id = id = Magix.guid('n');
                if (!updatedNodes[id]) {
                    updatedNodes[id] = 1;
                    var vf = one.vf && Magix.Vframe.get(id);
                    var view;
                    for (var i = one.attrs.length - 1; i >= 0; i--) {
                        var attr = one.attrs[i];
                        var val = BuildHTML(attr.v, renderData);
                        if (attr.p) {
                            node[attr.n] = val;
                        } else {
                            node.setAttribute(attr.n, val);
                        }
                        if (vf && attr.n == 'mx-view') {
                            view = val;
                        }
                    }
                    if (view) {
                        vf.unmountView();
                    }
                    if (one.tmpl) {
                        me.setHTML(id, BuildHTML(one.tmpl, renderData, me.id));
                    }
                    if (view) {
                        vf.mountView(view);
                    }
                }
            };
            if (!list) {
                Magix.config().error('this.tmplData is empty', me);
            }
            //console.log(list);
            for (var i = list.length - 1, ignore, q; i >= 0; i--) { //keys
                one = list[i];
                ignore = 0;
                if (one.pKeys) {
                    q = one.pKeys.length;
                    while (--q >= 0) {
                        if (Magix.has(updateFlags, one.pKeys[q])) {
                            ignore = 1;
                            break;
                        }
                    }
                }
                if (!ignore) {
                    var update = 0;
                    for (var y = one.keys.length - 1; y >= 0; y--) {
                        if (Magix.has(updateFlags, one.keys[y])) {
                            update = 1;
                            break;
                        }
                    }
                    if (update) {
                        //console.time('batchUpdate:' + one.selector);
                        var nodes = $('#' + me.id + ' ' + one.selector.replace(HolderReg, me.id));
                        nodes.each(updateNode);
                        //console.timeEnd('batchUpdate:' + one.selector);
                    }
                }
            }
        } else {
            //console.log(me.tmplData, me);
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
            me.$rd = true;
            me.setHTML(me.id, BuildHTML(tmpl, me.data.get(), me.id));
        }
        //console.timeEnd('update');
    }
});