let V_Specials = {
    input_value: 1,
    input_checked: 1,
    input_disabled: 1,
    input_readonly: 1,
    textarea_value: 1,
    textarea_checked: 1,
    textarea_disabled: 1,
    textarea_readonly: 1,
    option_selected: 1
};

let VSelfClose = {
    area: 1,
    br: 1,
    col: 1,
    embed: 1,
    hr: 1,
    img: 1,
    input: 1,
    param: 1,
    source: 1,
    track: 1,
    wbr: 1
};
let V_TEXT_NODE = 3;
let V_SVGNS = 'http://www.w3.org/2000/svg';
let V_OpenReg = /^<([a-z\d]+)((?:\s+[-A-Za-z\d_]+(?:="[^"]*")?)*)\s*(\/?)>/,
    V_AttrReg = /([-A-Za-z\d_]+)(?:="([^"]*)")?/g,
    V_CloseReg = /^<\/[a-z\d+]+>/;
let VDOM = input => {
    let count = input.length,
        current = 0,
        last = 0,
        chars,
        currentParent = {
            '@{~v#node.children}': [],
            '@{~v#node.html}': input
        },
        index,
        temp,
        match,
        tag,
        attrs,
        unary,
        stack = [{
            '@{~v#node}': currentParent
        }],
        em,
        amap,
        text,
        id,
        getAttrs = (tag, attr) => {
            attr.replace(V_AttrReg, (m, key, value) => {
                if (key == 'id') id = value;
                attrs.push({
                    '@{~v#node.attrs.key}': key,
                    '@{~v#node.attrs.special}': V_Specials[tag + '_' + key],
                    '@{~v#node.attrs.value}': value
                });
                amap[key] = value;
            });
        };
    while (current < count) {
        chars = 1;
        temp = input.slice(current);
        if (temp.indexOf('</') == 0) {
            match = temp.match(V_CloseReg);
            if (match) {
                currentParent = stack.pop();
                em = currentParent['@{~v#node}'];
                attrs = input.slice(currentParent['@{~v#content.start.pos}'], current);
                if (em['@{~v#node.tag}'] == 'textarea') {
                    em['@{~v#node.attrs}'].push({
                        '@{~v#node.attrs.key}': 'value',
                        '@{~v#node.attrs.value}': attrs,
                        '@{~v#node.attrs.special}': 1
                    });
                    em['@{~v#node.attrs.map}'].value = attrs;
                    em['@{~v#node.children}'] = G_EMPTY_ARRAY;
                } else {
                    em['@{~v#node.html}'] = attrs;
                }
                currentParent = stack[stack.length - 1]['@{~v#node}'];
                current += match[0].length;
                chars = 0;
            }
        } else if (temp[0] == '<') {
            match = temp.match(V_OpenReg);
            if (match) {
                tag = match[1];
                unary = match[3] || VSelfClose[tag];
                attrs = [];
                amap = {};
                id = '';
                getAttrs(tag, match[2]);
                em = {
                    '@{~v#node.id}': id,
                    '@{~v#node.tag}': tag,
                    '@{~v#node.attrs}': attrs,
                    '@{~v#node.attrs.map}': amap,
                    '@{~v#node.children}': []
                };
                current += match[0].length;
                currentParent['@{~v#node.children}'].push(em);
                if (!unary) {
                    stack.push({
                        '@{~v#node}': em,
                        '@{~v#content.start.pos}': current
                    });
                    currentParent = em;
                }
                chars = 0;
            }
        }
        if (chars) {
            index = temp.indexOf('<');
            if (index < 0) {
                text = temp;
            } else {
                text = temp.substring(0, index);
            }
            current += text.length;
            em = {
                '@{~v#node.tag}': V_TEXT_NODE,
                '@{~v#node.html}': text
            };
            currentParent['@{~v#node.children}'].push(em);
        }
        if (DEBUG) {
            if (last == current) {
                throw new Error('bad input:' + temp);
            }
            last = current;
        }
    }
    return currentParent;
};

let V_UnmountVframs = (vf, n) => {
    let id = IdIt(n);
    if (vf['@{vframe#children}'][id]) {
        vf.unmountVframe(id, 1);
    } else {
        vf.unmountZone(id, 1);
    }
};
let V_SetAttributes = (oldNode, lastVDOM, newVDOM, ref) => {
    let c, key, value;
    for (c of lastVDOM['@{~v#node.attrs}']) {
        key = c['@{~v#node.attrs.key}'];
        if (!G_Has(newVDOM['@{~v#node.attrs.map}'], key)) {//如果旧有新木有
            if (c['@{~v#node.attrs.special}']) {//特殊的属性
                if (key == 'value') {//value的话就清空
                    oldNode.value = '';
                } else {//其它特殊值则设置为false
                    oldNode[key] = false;
                }
            } else if (key == 'id') {
                ref.d.push([oldNode, '']);
            } else {//不是特殊值则删除
                oldNode.removeAttribute(key);
            }
        }
    }
    for (c of newVDOM['@{~v#node.attrs}']) {
        key = c['@{~v#node.attrs.key}'];
        value = c['@{~v#node.attrs.value}'];
        //旧值与新值不相等
        if (lastVDOM['@{~v#node.attrs.map}'][key] != value) {
            if (c['@{~v#node.attrs.special}']) {
                if (key == 'value') {
                    oldNode.value = value;
                } else {
                    oldNode[key] = true;
                }
            } else if (key == 'id') {
                ref.d.push([oldNode, value]);
            } else {
                oldNode.setAttribute(key, value);
            }
        }
    }
};
let V_CreateNode = (vnode, owner, ref, t, c, key, value, ns, tag) => {
    tag = vnode['@{~v#node.tag}'];
    if (tag == V_TEXT_NODE) {
        return G_DOCUMENT.createTextNode(vnode['@{~v#node.html}']);
    }
    ns = tag == 'svg' ? V_SVGNS : owner.namespaceURI;
    t = G_DOCUMENT.createElementNS(ns, tag);
    t.innerHTML = vnode['@{~v#node.html}'];
    for (c of vnode['@{~v#node.attrs}']) {
        key = c['@{~v#node.attrs.key}'];
        value = c['@{~v#node.attrs.value}'];
        if (c['@{~v#node.attrs.special}']) {
            if (key == 'value') {
                t.value = value;
            } else {
                t[key] = true;
            }
        } else if (key == 'id') {
            ref.d.push([t, value]);
        } else {
            t.setAttribute(key, value);
        }
    }
    return t;
};
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, data, keys) => {
    let oldCount, newCount, i, j, oldChildren, newChildren, oc, nc, oldNode,
        nodes = realNode.childNodes, id,
        foundNode, orn, ovn,
        keyedNodes = {};
    if (!lastVDOM) {//view首次初始化，通过innerHTML快速更新
        ref.c = 1;
        realNode.innerHTML = newVDOM['@{~v#node.html}'];
    } else {
        oldChildren = lastVDOM['@{~v#node.children}'];
        oldCount = oldChildren.length;
        newChildren = newVDOM['@{~v#node.children}'];
        newCount = newChildren.length;
        for (i = 0; i < oldCount; i++) {
            oc = oldChildren[i];
            id = oc['@{~v#node.id}'];
            if (id) {
                keyedNodes[id] = {
                    '@{~v#old.list.node}': nodes[i],
                    '@{~v#old.vlist.node}': oc
                };
            }
        }

        for (i = 0; i < newCount; i++) {
            oc = oldChildren[i];
            nc = newChildren[i];
            id = nc['@{~v#node.id}'];
            if ((foundNode = keyedNodes[id])) {
                orn = foundNode['@{~v#old.list.node}'];
                ovn = foundNode['@{~v#old.vlist.node}'];
                if (orn != nodes[i]) {//如果找到的节点和当前不同，则移动
                    oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                    for (j = oldChildren.length; j--;) {//从后向前清理虚拟dom
                        if (oldChildren[j]['@{~v#node.id}'] == id) {
                            oldChildren.splice(j, 1);
                            break;
                        }
                    }
                    realNode.insertBefore(orn, nodes[i]);
                }
                V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data, keys);
            } else if (oc) {//有旧节点，则更新
                if (keyedNodes[oc['@{~v#node.id}']]) {
                    oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                    oldCount++;
                    realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                } else {
                    V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data, keys);
                }
            } else {//添加新的节点
                realNode.appendChild(V_CreateNode(nc, realNode, ref));
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

let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, data, keys) => {
    if (lastVDOM['@{~v#node.tag}'] == newVDOM['@{~v#node.tag}']) {
        if (lastVDOM['@{~v#node.tag}'] == V_TEXT_NODE) {
            if (lastVDOM['@{~v#node.html}'] != newVDOM['@{~v#node.html}']) {
                realNode.nodeValue = newVDOM['@{~v#node.html}'];
            }
        } else {
            let newMxView = newVDOM['@{~v#node.attrs.map}'][G_MX_VIEW],
                newHTML = newVDOM['@{~v#node.html}'];
            let updateAttribute, updateChildren, unmountOld,
                oldVf = Vframe_Vframes[realNode.id],
                view, uri, params, htmlChanged, deep/*, 
                    oldDataStringify, newDataStringify,dataChanged*/;
            /*
                如果存在新旧view，则考虑路径一致，避免渲染的问题
             */
            if (newMxView && oldVf) {
                /*
                新旧两个view路径相同，则需要考虑
                1.　没有模板的view，可能依赖dom节点，所以要销毁旧的，渲染子节点
                2.　是否有引用传递的数据，如果有则使用json.stringify来比较数据是否变化
                    细节：循环引用的数据序列化时会出错，如果出错，则全新渲染
                */
                //oldDataStringify = oldVf['@{vframe#data.stringify}'];
                view = oldVf['@{vframe#view.entity}'];
                uri = G_ParseUri(newMxView);
                params = uri[G_PARAMS];
                //处理引用赋值
                if (newMxView.indexOf(G_SPLITER) > -1) {
                    GSet_Params(data, params, params);
                }
                //newDataStringify = G_TryStringify(data, uri);
                //dataChanged = oldDataStringify != newDataStringify;
                htmlChanged = newHTML != oldVf['@{vframe#template}'];
                deep = !view['@{view#template.object}'];//无模板的组件深入比较子节点
                // if (deep ||//无模板的组件
                //   htmlChanged //||//innerHTML有变化
                //!oldDataStringify ||//数据无法stringify
                //dataChanged) {//新旧stringify出的值不一样
                //如果新旧是同一类型的view且有assign方法，则调用组件的方法进行更新
                if (oldVf['@{vframe#view.path}'] == uri[G_PATH] &&
                    view['@{view#assign.fn}']) {
                    oldVf['@{vframe#template}'] = newHTML;
                    //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                    oldVf[G_PATH] = newMxView;//update ref
                    //如果需要更新，则进行更新的操作
                    uri = {
                        keys,
                        inner: newHTML,
                        deep,
                        //data: dataChanged,
                        html: htmlChanged
                    };
                    V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
                    if (G_ToTry(view['@{view#assign.fn}'], [params, uri], view)) {
                        view['@{view#render.short}']();
                    }
                    //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                    //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                    updateChildren = uri.deep;
                } else {
                    //否则自动更新，销毁旧的，更新子节点
                    unmountOld = 1;
                    updateChildren = 1;
                    updateAttribute = 1;
                }
                //}
            } else {
                updateAttribute = 1;
                updateChildren = 1;
                unmountOld = oldVf;
            }
            if (unmountOld) {
                oldVf.unmountVframe(0, 1);
            }
            if (updateAttribute) {
                V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
            }
            // Update all children (and subchildren).
            //自闭合标签不再检测子节点
            if (updateChildren && !VSelfClose[newVDOM['@{~v#node.tag}']]) {
                ref.c = 1;
                V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, data, keys);
            }
        }
    } else {
        V_UnmountVframs(vframe, realNode);
        oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
        ref.c = 1;
    }
};

let V_ContentReg = /\d+\x1d/g;
let V_UpdateDOM = (updater, data, changed, keys) => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [] },
        node = G_GetById(selfId),
        tmpl, html, x,
        vdom;
    if (view && view['@{view#sign}'] > 0 && (tmpl = view['@{view#template.object}'])) {
        console.time('[vdom time:' + selfId + ']');
        if (changed) {
            console.time('[vdom html to vdom:' + selfId + ']');
            html = View_SetEventOwner(tmpl(G_SPLITER, data), selfId);
            vdom = VDOM(html);
            console.timeEnd('[vdom html to vdom:' + selfId + ']');
            V_SetChildNodes(node, updater['@{updater#vdom}'], vdom, ref, vf, data, keys);
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
    }
};