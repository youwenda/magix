let Partial_ContentReg = /\d+\x1d/g;
let Partial_AttrReg = /([\w\-]+)(?:="([\s\S]*?)")?/g;
let Partial_UnescapeMap = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    '#34': '"',
    '#39': '\'',
    '#96': '`'
};
let Partial_UnescapeReg = /&([^;]+);/g;
let Partial_Unescape = (m, name) => Partial_UnescapeMap[name] || m;

let Partial_UpdateNode = (node, view, one,
    renderData, updateAttrs, updateTmpl, viewId, ref, file) => {
    if (node) {
        let id = IdIt(node), params;
        let hasMagixView, viewValue, vf = Vframe_Vframes[viewId];
        if (updateAttrs) {
            let attr = View_SetEventOwner(DEBUG ? Tmpl(one.attr, renderData, file) : Tmpl(one.attr, renderData), viewId),
                nowAttrs = {}, a, n, old, now, exist, f;
            attr.replace(Partial_AttrReg, (match, name, value) => nowAttrs[name] = value);
            for (a of one.attrs) {
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
                        ref.c = 1;
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
        if (hasMagixView) {
            vf.unmountVframe(id, viewValue);
        }
        if (updateTmpl) {
            view.beginUpdate(id);
            if (DEBUG) {
                params = View_SetEventOwner(Tmpl(one.tmpl, renderData, file), viewId);
            } else {
                params = View_SetEventOwner(Tmpl(one.tmpl, renderData), viewId);
            }
            $(node).html(params);
            ref.push(id);
        }
        if (hasMagixView && viewValue) {
            vf.mountVframe(id, viewValue);
        }
    }
};
let Partial_UpdateDOM = (updater, changedKeys, renderData) => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let view = vf && vf['@{vframe#view.entity}'],
        tmplObject;
    if (!view || view['@{view#sign}'] < 1 || !(tmplObject = view['@{view#template.object}'])) return;
    console.time('[partial time:' + selfId + ']');
    let tmpl = tmplObject.html;
    let list = tmplObject.subs;
    let ref = [];
    if (updater['@{updater#rendered}'] && changedKeys) {
        let keys, one, updateTmpl, updateAttrs, update, q, mask, m;
        //view.fire('update');
        for (one of list) { //keys
            updateTmpl = 0;
            updateAttrs = 0;
            update = 1;
            mask = one.mask;
            keys = one.pKeys;
            if (keys) {
                for (q of keys) {
                    if (G_Has(changedKeys, q)) {
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
                        m = mask[q];
                        updateTmpl = updateTmpl || m & 1;
                        updateAttrs = updateAttrs || m & 2;
                    }
                }
                if (update) {
                    keys = $(View_SetEventOwner(one[G_PATH], selfId));
                    for (q of keys) {
                        if (DEBUG) {
                            Partial_UpdateNode(q, view, one, renderData, updateAttrs, updateTmpl, selfId, ref, tmplObject.file);
                        } else {
                            Partial_UpdateNode(q, view, one, renderData, updateAttrs, updateTmpl, selfId, ref);
                        }
                    }
                }
            }
        }
        //view.fire('updated');
    } else if (!updater['@{updater#rendered}']) {
        if (DEBUG) {
            if (!tmpl && !list) {
                throw new Error('you need check tmpl:' + JSON.stringify(view.tmpl));
            }
        }
        if (!tmplObject[G_SPLITER]) {
            tmplObject[G_SPLITER] = 1;
            let tmplment = guid => tmplment[guid].tmpl,
                x, s;
            for (x = list.length; x--;) {
                s = list[x];
                if (s.s) {
                    tmplment[s.s] = s;
                    s.tmpl = s.tmpl.replace(Partial_ContentReg, tmplment);
                }
            }
            tmpl = tmplObject.html = tmpl.replace(Partial_ContentReg, tmplment);
        }
        updater['@{updater#rendered}'] = 1;
        vf = G_GetById(updater['@{updater#render.id}']);
        if (DEBUG) {
            Partial_UpdateNode(vf, view, { tmpl }, renderData, 0, 1, selfId, ref, tmplObject.file);
        } else {
            Partial_UpdateNode(vf, view, { tmpl }, renderData, 0, 1, selfId, ref);
        }
    }
    list = ref.length;
    if (list) {
        for (vf = 0; vf < list;) {
            view.endUpdate(ref[vf], ++vf < list);
        }
        /*#if(modules.naked){#*/
        G_Trigger(G_DOCUMENT, 'htmlchanged', {
            vId: selfId
        });
        /*#}else if(modules.kissy){#*/
        G_DOC.fire('htmlchanged', {
            vId: selfId
        });
        /*#}else{#*/
        G_DOC.trigger({
            type: 'htmlchanged',
            vId: selfId
        });
        /*#}#*/
    }
    view.fire('domready');
    console.timeEnd('[partial time:' + selfId + ']');
};