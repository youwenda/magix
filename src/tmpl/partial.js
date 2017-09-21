var Partial_ContentReg = /\d+\x1d/g;
var Partial_AttrReg = /([\w\-]+)(?:="([\s\S]*?)")?/g;
var Partial_UnescapeMap = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    '#34': '"',
    '#39': '\'',
    '#96': '`'
};
var Partial_UnescapeReg = /&([^;]+);/g;
var Partial_Unescape = function (m, name) {
    return Partial_UnescapeMap[name] || m;
};

var Partial_UpdateNode = function (node, view, one, renderData, updateAttrs, updateTmpl, viewId) {
    var id = node.id || (node.id = G_Id());

    var hasMagixView, viewValue, vf = view.owner;
    if (updateAttrs) {
        if (DEBUG) {
            var attr = View_SetEventOwner(Tmpl(one.attr, renderData, arguments[arguments.length - 1]), viewId);
            var nowAttrs = {};
            attr.replace(Partial_AttrReg, function (match, name, value) {
                nowAttrs[name] = value;
            });
            for (var i = one.attrs.length, a, n, old, now, exist, f; i--;) {
                a = one.attrs[i];
                n = a.n;
                f = a.f;
                if (a.v) {
                    hasMagixView = 1;
                    viewValue = nowAttrs[n];
                } else {
                    exist = G_Has(nowAttrs, n);
                    old = a.p ? node[f || n] : node.getAttribute(n);
                    now = a.b ? exist : nowAttrs[n] || G_EMPTY;
                    if (old !== now) {
                        if (a.p) {
                            //decode html
                            if (a.q) now.replace(Partial_UnescapeReg, Partial_Unescape);
                            node[f || n] = now;
                        } else if (exist) {
                            node.setAttribute(n, now);
                        } else {
                            node.removeAttribute(n);
                        }
                    }
                }
            }
        } else {
            var attr = View_SetEventOwner(Tmpl(one.attr, renderData), viewId);
            var nowAttrs = {};
            attr.replace(Partial_AttrReg, function (match, name, value) {
                nowAttrs[name] = value;
            });
            for (var i = one.attrs.length, a, n, old, now, exist, f; i--;) {
                a = one.attrs[i];
                n = a.n;
                f = a.f;
                if (a.v) {
                    hasMagixView = 1;
                    viewValue = nowAttrs[n];
                } else {
                    exist = G_Has(nowAttrs, n);
                    old = a.p ? node[f || n] : node.getAttribute(n);
                    now = a.b ? exist : nowAttrs[n] || G_EMPTY;
                    if (old !== now) {
                        if (a.p) {
                            //decode html
                            if (a.q) now.replace(Partial_UnescapeReg, Partial_Unescape);
                            node[f || n] = now;
                        } else if (exist) {
                            node.setAttribute(n, now);
                        } else {
                            node.removeAttribute(n);
                        }
                    }
                }
            }
        }
    }
    var nVf = Vframe_Vframes[id], mount, po, nPo, params;
    if (hasMagixView && !updateTmpl && nVf) {
        po = G_ParseUri(viewValue);
        params = po[G_PARAMS];
        nPo = G_ParseUri(nVf[G_PATH]);
        if (nPo[G_PATH] == po[G_PATH]) {
            if (viewValue.indexOf(G_SPLITER) > 0) {
                GSet_Params(view.$u, params, params);
            }
            nVf[G_PATH] = viewValue;
            mount = nVf.invoke('assign', params);
            if (mount) nVf.invoke('render');
        }
    }
    if (!mount) {
        if (hasMagixView) {
            vf.unmountVframe(id, viewValue);
        }
        if (updateTmpl) {
            /*#if(modules.updaterIncrement){#*/
            if (one.s) {
                view.beginUpdate(id);
                if (DEBUG) {
                    Updater_Increment(node, View_SetEventOwner(Tmpl(one.tmpl, renderData, arguments[arguments.length - 1]), viewId), viewId);
                } else {
                    Updater_Increment(node, View_SetEventOwner(Tmpl(one.tmpl, renderData), viewId), viewId);
                }
                view.endUpdate(id);
            } else {
                if (DEBUG) {
                    view.setHTML(id, Tmpl(one.tmpl, renderData, arguments[arguments.length - 1]));
                } else {

                    view.setHTML(id, Tmpl(one.tmpl, renderData));
                }
            }
            /*#}else{#*/
            if (DEBUG) {
                view.setHTML(id, Tmpl(one.tmpl, renderData, arguments[arguments.length - 1]));
            } else {

                view.setHTML(id, Tmpl(one.tmpl, renderData));
            }
            /*#}#*/
        }
        if (hasMagixView && viewValue) {
            vf.mountVframe(id, viewValue);
        }
    }
};
var Partial_UpdateDOM = function (updater, changedKeys, renderData) {
    var selfId = updater.$i;
    var vf = Vframe_Vframes[selfId];
    var view = vf && vf.$v,
        tmplObject;
    if (!view || !(tmplObject = view.tmpl)) return;
    var tmpl = tmplObject.html;
    var list = tmplObject.subs;
    if (updater.$rd && changedKeys) {
        var keys, one, updateTmpl, updateAttrs;

        for (var i = list.length, update, q, mask, m; i--;) { //keys
            updateTmpl = 0;
            updateAttrs = 0;
            one = list[i];
            update = 1;
            mask = one.mask;
            keys = one.pKeys;
            if (keys) {
                for (q = keys.length; q--;) {
                    if (G_Has(changedKeys, keys[q])) {
                        update = 0;
                        break;
                    }
                }
            }
            if (update) {
                update = 0;
                keys = one.keys;
                for (q = keys.length; q--;) {
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
                        if (DEBUG) {
                            Partial_UpdateNode(nodes[q++], view, one, renderData, updateAttrs, updateTmpl, selfId, tmplObject.file);
                        } else {
                            Partial_UpdateNode(nodes[q++], view, one, renderData, updateAttrs, updateTmpl, selfId);
                        }
                    }
                }
            }
        }
    } else {
        if (!tmplObject[G_SPLITER]) {
            tmplObject[G_SPLITER] = 1;
            var map = {},
                tmplment = function (guid) {
                    return map[guid].tmpl;
                },
                x, s;
            for (x = list.length; x--;) {
                s = list[x];
                if (s.s) {
                    map[s.s] = s;
                    s.tmpl = s.tmpl.replace(Partial_ContentReg, tmplment);
                }
            }
            tmpl = tmplObject.html = tmpl.replace(Partial_ContentReg, tmplment);
        }
        updater.$rd = 1;
        if (DEBUG) {
            view.setHTML(updater.$t, Tmpl(tmpl, renderData, tmplObject.file));
        } else {
            view.setHTML(updater.$t, Tmpl(tmpl, renderData));
        }
    }
};