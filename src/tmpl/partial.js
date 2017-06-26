var Partial_ContentReg = /\d+\u001d/g;
var Partial_AttrReg = /([\w\-:]+)(?:=(["'])([\s\S]*?)\2)?/g;
var Partial_UnescapeMap = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    'quot': '"',
    '#x27': '\'',
    '#x60': '`'
};
var Partial_UnescapeReg = /&([^;]+?);/g;
var Partial_Unescape = function(m, name) {
    return Partial_UnescapeMap[name] || m;
};
var Partial_UpdateNode = function(node, view, one, renderData, updateAttrs, updateTmpl, viewId) {
    var id = node.id || (node.id = G_Id());

    var hasMagixView, viewValue, vf;
    if (updateAttrs) {
        var attr = View_SetEventOwner(Tmpl(one.attr, renderData), viewId);
        var nowAttrs = {};
        attr.replace(Partial_AttrReg, function(match, name, q, value) {
            nowAttrs[name] = value;
        });
        for (var i = one.attrs.length - 1, a, n, old, now, f; i >= 0; i--) {
            a = one.attrs[i];
            n = a.n;
            f = a.f;
            if (a.v) {
                hasMagixView = 1;
                viewValue = nowAttrs[n];
            } else {
                old = a.p ? node[f || n] : node.getAttribute(n);
                now = a.b ? G_Has(nowAttrs, n) : nowAttrs[n] || '';
                if (old != now) {
                    if (a.p) {
                        if (a.q) now = now.replace(Partial_UnescapeReg, Partial_Unescape);
                        node[f || n] = now;
                    } else if (now) {
                        node.setAttribute(n, now);
                    } else {
                        node.removeAttribute(n);
                    }
                }
            }
        }
    }
    if (hasMagixView) {
        vf = Vframe_Vframes[id];
        if (vf) {
            vf[viewValue ? 'unmountView' : 'unmountVframe']();
        }
    }
    if (updateTmpl) {
        view.setHTML(id, Tmpl(one.tmpl, renderData));
    }
    if (hasMagixView && viewValue) {
        view.owner.mountVframe(id, viewValue);
    }
};
var Partial_UpdateDOM = function(updater, changedKeys, renderData) {
    var selfId = updater.$i;
    var vf = Vframe_Vframes[selfId];
    var view = vf && vf.$v,
        tmplObject;
    if (!view || !(tmplObject = view.tmpl)) return;
    var tmpl = tmplObject.html;
    var list = tmplObject.subs;
    if (updater.$rd && changedKeys) {
        var keys, one, updateTmpl, updateAttrs;

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
                    if (G_Has(changedKeys, keys[q])) {
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
                    if (G_Has(changedKeys, keys[q])) {
                        update = 1;
                        if (!mask || (updateTmpl && updateAttrs)) {
                            updateTmpl = one.tmpl;
                            updateAttrs = one.attr;
                            break;
                        }
                        m = mask.charAt(q);
                        updateTmpl = updateTmpl || m & 1;
                        updateAttrs = updateAttrs || m & 2;
                    }
                }
                if (update) {
                    var nodes = $(View_SetEventOwner(one.path, selfId));
                    q = 0;
                    while (q < nodes.length) {
                        Partial_UpdateNode(nodes[q++], view, one, renderData, updateAttrs, updateTmpl, selfId, vf);
                    }
                }
            }
        }
    } else {
        var map,
            tmplment = function(guid) {
                return map[guid].tmpl;
            },
            x;
        if (list) {
            if (!list.$) { //process once
                list.$ = map = {};
                x = list.length;
                while (x > 0) {
                    var s = list[--x];
                    if (s.s) {
                        map[s.s] = s;
                        s.tmpl = s.tmpl.replace(Partial_ContentReg, tmplment);
                        delete s.s;
                    }
                }
            }
            map = list.$;
        }
        updater.$rd = 1;
        var str = tmpl.replace(Partial_ContentReg, tmplment);
        view.setHTML(updater.$t, Tmpl(str, renderData));
    }
};