let V_UnmountVframs = (vf, n) => {
    let id = IdIt(n);
    if (vf['@{vframe#children}'][id]) {
        vf.unmountVframe(id, 1);
    } else {
        vf.unmountZone(id, 1);
    }
};
let V_SVGNS = 'http://www.w3.org/2000/svg';
let V_SetAttributes = (oldNode, lastVDOM, newVDOM, ref) => {
    let c, key, value, tag = lastVDOM['@{~v#node.tag}'],
        nMap = newVDOM['@{~v#node.attrs.map}'];
    if (lastVDOM) {
        for (c of lastVDOM['@{~v#node.attrs}']) {
            key = c['@{~v#node.attrs.key}'];
            if (!G_Has(nMap, key)) {//如果旧有新木有
                if (key == 'id') {
                    ref.d.push([oldNode, G_EMPTY]);
                } else {
                    ref.c = 1;
                    oldNode.removeAttribute(key);
                }
            }
        }
    }
    for (c of newVDOM['@{~v#node.attrs}']) {
        key = c['@{~v#node.attrs.key}'];
        value = c['@{~v#node.attrs.value}'];
        //旧值与新值不相等
        if (!lastVDOM || lastVDOM['@{~v#node.attrs.map}'][key] !== value) {
            value = TO_VDOM_Unescape(value);
            if (key == 'id') {
                ref.d.push([oldNode, value]);
            } else {
                ref.c = 1;
                oldNode.setAttribute(key, value);
            }
        }
    }
    let specials = TO_VDOM_SPECIAL_PROPS[tag];
    if (specials) {
        for (c of specials) {
            oldNode[c] = G_Has(nMap, c) ? c != G_VALUE || nMap[c] : c == G_VALUE && G_EMPTY;
        }
    }
};

let V_CreateNode = (vnode, owner, ref, c, tag) => {
    tag = vnode['@{~v#node.tag}'];
    if (tag == TO_VDOM_TEXT_NODE) {
        return G_DOCUMENT.createTextNode(vnode['@{~v#node.html}']);
    }
    c = G_DOCUMENT.createElementNS(tag == 'svg' ? V_SVGNS : owner.namespaceURI, tag);
    V_SetAttributes(c, 0, vnode, ref);
    c.innerHTML = vnode['@{~v#node.html}'];
    return c;
};
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, data) => {
    let oldCount, newCount, i, j, oldChildren, newChildren, oc, nc, oldNode,
        nodes = realNode.childNodes, compareKey,
        orn, ovn, keyedNodes;
    if (!lastVDOM) {//view首次初始化，通过innerHTML快速更新
        ref.c = 1;
        realNode.innerHTML = newVDOM['@{~v#node.html}'];
    } else {
        oldChildren = lastVDOM['@{~v#node.children}'];
        oldCount = oldChildren.length;
        newChildren = newVDOM['@{~v#node.children}'];
        newCount = newChildren.length;
        keyedNodes = {};
        for (i = 0; i < oldCount; i++) {
            oc = oldChildren[i];
            compareKey = oc['@{~v#node.compare.key}'];
            if (compareKey) {
                compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
                compareKey.push({
                    '@{~v#old.list.node}': nodes[i],
                    '@{~v#old.vlist.node}': oc
                });
            }
        }

        for (i = 0; i < newCount; i++) {
            oc = oldChildren[i];
            nc = newChildren[i];
            compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
            if (compareKey && (compareKey = compareKey.shift())) {
                orn = compareKey['@{~v#old.list.node}'];
                ovn = compareKey['@{~v#old.vlist.node}'];
                if (orn != nodes[i]) {//如果找到的节点和当前不同，则移动
                    oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                    for (j = oldChildren.length; j--;) {//从后向前清理虚拟dom
                        if (oldChildren[j] == ovn) {
                            oldChildren.splice(j, 1);
                            break;
                        }
                    }
                    realNode.insertBefore(orn, nodes[i]);
                }
                V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data);
            } else if (oc) {//有旧节点，则更新
                if (keyedNodes[oc['@{~v#node.compare.key}']]) {
                    oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                    oldCount++;
                    ref.c = 1;
                    realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                } else {
                    V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data);
                    //ref.c = 1;
                }
            } else {//添加新的节点
                realNode.appendChild(V_CreateNode(nc, realNode, ref));
                ref.c = 1;
            }
        }
        for (i = newCount; i < oldCount; i++) {
            oldNode = realNode.lastChild;//删除多余的旧节点
            V_UnmountVframs(vframe, oldNode);
            realNode.removeChild(oldNode);
            ref.c = 1;
        }
    }
};

let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, data) => {
    if (DEBUG) {
        if (oldParent.nodeName == 'TEMPLATE') {
            console.error('unsupport template tag');
        }
        if ((realNode.nodeName == '#text' && lastVDOM['@{~v#node.tag}'] != '#text') || (
            realNode.nodeName != '#text' && realNode.nodeName.toLowerCase() != lastVDOM['@{~v#node.tag}'])) {
            console.error('Your code is not match the DOM tree generated by the browser. near:' + lastVDOM['@{~v#node.html}'] + '. Is that you lost some tags or modified the DOM tree?');
        }
    }
    if (lastVDOM['@{~v#node.tag}'] == newVDOM['@{~v#node.tag}']) {
        if (lastVDOM['@{~v#node.tag}'] == TO_VDOM_TEXT_NODE) {
            if (lastVDOM['@{~v#node.html}'] != newVDOM['@{~v#node.html}']) {
                realNode.nodeValue = TO_VDOM_Unescape(newVDOM['@{~v#node.html}']);
            }
        } else {
            let newMxView = newVDOM['@{~v#node.attrs.map}'][G_MX_VIEW],
                newHTML = newVDOM['@{~v#node.html}'];
            let updateAttribute, updateChildren, unmountOld,
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
                htmlChanged = newHTML != lastVDOM['@{~v#node.html}'];
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
                        //oldVf['@{vframe#template}'] = newHTML;
                        //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                        oldVf[G_PATH] = newMxView;//update ref
                        //如果需要更新，则进行更新的操作
                        uri = {
                            inner: newHTML,
                            deep: !view['@{view#template.object}'],//无模板的组件深入比较子节点,
                            //data: dataChanged,
                            html: htmlChanged
                        };
                        V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
                        if (G_ToTry(assign, [params, uri], view)) {
                            view['@{view#render.short}']();
                        }
                        //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                        //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                        updateChildren = uri.deep;
                    } else {
                        unmountOld = 1;
                        updateChildren = 1;
                        updateAttribute = 1;
                    }
                }
            } else {
                updateAttribute = 1;
                updateChildren = 1;
                unmountOld = oldVf;
            }
            if (unmountOld) {
                oldVf.unmountVframe(0, 1);
            }
            if (updateAttribute) {
                //ref.c = 1;
                V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
            }
            // Update all children (and subchildren).
            //自闭合标签不再检测子节点
            if (updateChildren && !newVDOM['@{~v#node.self.close}'] && !lastVDOM['@{~v#node.self.close}']) {
                //ref.c = 1;
                V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, data);
            }
        }
    } else {
        V_UnmountVframs(vframe, realNode);
        oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
        ref.c = 1;
    }
};

let V_UpdateDOM = updater => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let data = updater['@{updater#data}'];
    let view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [] },
        node = G_GetById(selfId),
        tmpl, html, x,
        vdom;
    if (view && view['@{view#sign}'] > 0 && (tmpl = view['@{view#template.object}'])) {
        console.time('[vdom time:' + selfId + ']');
        console.time('[vdom html to vdom:' + selfId + ']');
        html = View_SetEventOwner(tmpl(data), selfId);
        vdom = TO_VDOM(html);
        console.timeEnd('[vdom html to vdom:' + selfId + ']');
        V_SetChildNodes(node, updater['@{updater#vdom}'], vdom, ref, vf, data);
        updater['@{updater#vdom}'] = vdom;
        for (x of ref.d) {
            x[0].id = x[1];
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
    console.timeEnd('[vdom time:' + selfId + ']');
};