
let VR_UnmountVframs = (vf, n) => {
    let id = IdIt(n);
    if (vf['@{vframe#children}'][id]) {
        vf.unmountVframe(id, 1);
    } else {
        vf.unmountZone(id, 1);
    }
};
let VR_SetAttributes = (oldNode, newVDOM, ref, keepId) => {
    let c, key, value, i, tag = newVDOM['@{~v#node.tag}'];
    let oldAttributes = oldNode.attributes, nMap = newVDOM['@{~v#node.attrs.map}'];
    // Remove old attributes.
    for (i = oldAttributes.length; i--;) {
        key = oldAttributes[i].name;
        if (!G_Has(nMap, key)) {
            if (key == 'id') {
                if (!keepId) {
                    ref.d.push([oldNode, G_EMPTY]);
                }
            } else {
                ref.c = 1;
                oldNode.removeAttribute(key);
            }
        }
    }
    for (c of newVDOM['@{~v#node.attrs}']) {
        key = c['@{~v#node.attrs.key}'];
        value = TO_VDOM_Unescape(c['@{~v#node.attrs.value}']);
        if (key == 'id') {
            ref.d.push([oldNode, value]);
        } else if (oldNode.getAttribute(key) != value) {
            ref.c = 1;
            oldNode.setAttribute(key, value);
        }
    }

    let specials = TO_VDOM_SPECIAL_PROPS[tag];
    if (specials) {
        for (c of specials) {
            oldNode[c] = G_Has(nMap, c) ? c != G_VALUE || nMap[c] : c == G_VALUE && G_EMPTY;
        }
    }
};

let VR_SVGNS = 'http://www.w3.org/2000/svg';
let VR_CreateNode = (vnode, owner, ref, c, tag) => {
    tag = vnode['@{~v#node.tag}'];
    if (tag == TO_VDOM_TEXT_NODE) {
        return G_DOCUMENT.createTextNode(vnode['@{~v#node.html}']);
    }
    c = G_DOCUMENT.createElementNS(tag == 'svg' ? VR_SVGNS : owner.namespaceURI, tag);
    VR_SetAttributes(c, vnode, ref);
    if (vnode['@{~v#node.html}']) {
        c.innerHTML = vnode['@{~v#node.html}'];
    }
    return c;
};
let VR_SetChildNodes = (realNode, newVDOM, ref, vframe, data) => {
    let oldCount, newCount, i, oldChildren, newChildren, oc, nc, oldNode,
        compareKey, keyedNodes = {}, vf;
    oldChildren = realNode.childNodes;
    oldCount = oldChildren.length;
    newChildren = newVDOM['@{~v#node.children}'];
    newCount = newChildren.length;
    for (i = oldCount; i--;) {
        oc = oldChildren[i];
        compareKey = oc['@{node#auto.id}'] ? G_EMPTY : oc.id;
        if (!compareKey && oc.nodeType == 1) {
            compareKey = oc.getAttribute(G_Tag_Key) || (vf = Vframe_Vframes[compareKey], vf && vf['@{vframe#view.path}']);
        }
        if (compareKey) {
            compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
            compareKey.push(oc);
        }
    }

    for (i = 0; i < newCount; i++) {
        oc = oldChildren[i];
        nc = newChildren[i];
        compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
        if (compareKey && (compareKey = compareKey.pop())) {
            if (compareKey != oc) {//如果找到的节点和当前不同，则移动
                realNode.insertBefore(compareKey, oc);
            }
            VR_SetNode(compareKey, realNode, nc, ref, vframe, data);
        } else if (oc) {//有旧节点，则更新
            if (keyedNodes[oc['@{~v#node.compare.key}']]) {
                //oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                oldCount++;
                ref.c = 1;
                realNode.insertBefore(VR_CreateNode(nc, realNode, ref), oc);
            } else {
                VR_SetNode(oc, realNode, nc, ref, vframe, data);
            }
        } else {//添加新的节点
            realNode.appendChild(VR_CreateNode(nc, realNode, ref));
            ref.c = 1;
        }
    }
    for (i = newCount; i < oldCount; i++) {
        oldNode = realNode.lastChild;//删除多余的旧节点
        VR_UnmountVframs(vframe, oldNode);
        realNode.removeChild(oldNode);
        ref.c = 1;
    }
};

let VR_SetNode = (realNode, oldParent, newVDOM, ref, vframe, data) => {
    let tag = realNode.nodeName.toLowerCase();
    if (tag == newVDOM['@{~v#node.tag}']) {
        if (tag == TO_VDOM_TEXT_NODE) {
            if (realNode.nodeValue != newVDOM['@{~v#node.html}']) {
                realNode.nodeValue = TO_VDOM_Unescape(newVDOM['@{~v#node.html}']);
            }
        } else if (!newVDOM['@{~v#node.attrs.map}'][G_Tag_Key] ||
            newVDOM['@{~v#node.attrs.map}'][G_Tag_Key] !=
            realNode.getAttribute(G_Tag_Key)) {
            let newMxView = newVDOM['@{~v#node.attrs.map}'][G_MX_VIEW],
                newHTML = newVDOM['@{~v#node.html}'];
            let updateAttribute = !newVDOM['@{~v#node.attrs.map}'][G_Tag_Attr_Key] || newVDOM['@{~v#node.attrs.map}'][G_Tag_Attr_Key] != realNode.getAttribute(G_Tag_Attr_Key),
                updateChildren, unmountOld,
                oldVf = Vframe_Vframes[realNode.id],
                assign, needUpdate,
                view, uri, params, htmlChanged/*, 
                    oldDataStringify, newDataStringify,dataChanged*/;
            /*
                如果存在新旧view，则考虑路径一致，避免渲染的问题
             */
            if (newMxView && oldVf) {
                view = oldVf['@{vframe#view.entity}'];
                assign = view['@{view#assign.fn}'];
                uri = G_ParseUri(newMxView);
                htmlChanged = newHTML != oldVf['@{vframe#template}'];
                needUpdate = newMxView.indexOf('?') > 0 || htmlChanged;
            }
            //旧节点有view,新节点有view,且是同类型的view
            if (newMxView && oldVf &&
                oldVf['@{vframe#view.path}'] == uri[G_PATH]) {
                if (needUpdate) {
                    //如果有assign方法,且有参数或html变化
                    if (assign) {
                        params = uri[G_PARAMS];
                        //处理引用赋值
                        if (newMxView.indexOf(G_SPLITER) > -1) {
                            GSet_Params(data, params, params);
                        }
                        oldVf['@{vframe#template}'] = newHTML;
                        //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                        oldVf[G_PATH] = newMxView;//update ref
                        //如果需要更新，则进行更新的操作
                        uri = {
                            inner: newHTML,
                            deep: !view['@{view#template.object}'],//无模板的组件深入比较子节点,
                            //data: dataChanged,
                            html: htmlChanged
                        };
                        if (updateAttribute) {
                            updateAttribute = G_EMPTY;
                            VR_SetAttributes(realNode, newVDOM, ref, 1);
                        }
                        if (G_ToTry(assign, [params, uri], view)) {
                            ref.v.push(view);
                        }
                        //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                        //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                        updateChildren = uri.deep;
                    } else {
                        unmountOld = 1;
                        updateChildren = 1;
                    }
                }
            } else {
                updateChildren = 1;
                unmountOld = oldVf;
            }
            if (unmountOld) {
                oldVf.unmountVframe(0, 1);
            }
            if (updateAttribute) {
                //ref.c = 1;
                if (unmountOld) ref.c = 1;
                VR_SetAttributes(realNode, newVDOM, ref, oldVf && newMxView);
            }
            // Update all children (and subchildren).
            //自闭合标签不再检测子节点
            if (updateChildren) {
                //ref.c = 1;
                VR_SetChildNodes(realNode, newVDOM, ref, vframe, data);
            }
        }
    } else {
        VR_UnmountVframs(vframe, realNode);
        oldParent.replaceChild(VR_CreateNode(newVDOM, oldParent, ref), realNode);
        ref.c = 1;
    }
};
let VR_UpdateDOM = updater => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let data = updater['@{updater#data}'];
    let view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [], v: [] },
        node = G_GetById(selfId),
        tmpl, html, x,
        vdom;
    if (view && view['@{view#sign}'] > 0 && (tmpl = view['@{view#template.object}'])) {
        console.time('[vrdom time:' + selfId + ']');
        console.time('[vrdom html to vdom:' + selfId + ']');
        html = tmpl(data, selfId);
        vdom = TO_VDOM(html);
        console.timeEnd('[vrdom html to vdom:' + selfId + ']');
        VR_SetChildNodes(node, vdom, ref, vf, data);
        for (x of ref.d) {
            x[0].id = x[1];
        }
        for (x of ref.v) {
            x['@{view#render.short}']();
        }
        if (ref.c) {
            view.endUpdate(selfId);
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
    }
    view.fire('domready');
    console.timeEnd('[vrdom time:' + selfId + ']');
};