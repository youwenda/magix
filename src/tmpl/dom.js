/*
2017.8.1
    直接应用节点对比方案，需要解决以下问题
    1.　view销毁问题，节点是边对比边销毁或新增，期望是view先统一销毁，然后再统一渲染
    2.　需要识别view内的节点变化，如
        <div mx-viwe="app/view">
            <%for(let i=0;i<count;i++){%>
                <span><%=i%></span>
            <%}%>
        </div>
        从外层的div看，并没有变化，但是内部的节点发生了变化，该view仍然需要销毁
2018.1.10
    组件情况：
    1. 组件带模板，最常见的情况
    2. 组件带模板，还有可能访问dom节点，如<mx-dropdown><i value="1">星期一</i></mx-dropdown>
    3. 组件没有模板
    

    组件前后数据是否一致，通过JSON.stringify序列化比较
    比较组件节点内的html片断是否变化

    渲染情况：
    1.　通过标签渲染
    2.　动态渲染
 */

//https://github.com/DylanPiercey/set-dom/blob/master/src/index.js
//https://github.com/patrick-steele-idem/morphdom
let I_SVGNS = 'http://www.w3.org/2000/svg';
let I_WrapMap = {

    // Support: IE <=9 only
    option: [1, '<select multiple>'],

    // XHTML parsers do not magically insert elements in the
    // same way that tag soup parsers do. So we cannot shorten
    // this by omitting <tbody> or other required elements.
    thead: [1, '<table>'],
    col: [2, '<table><colgroup>'],
    tr: [2, '<table><tbody>'],
    td: [3, '<table><tbody><tr>'],
    area: [1, '<map>'],
    param: [1, '<object>'],
    g: [1, `<svg xmlns="${I_SVGNS}">`],
    all: [0, '']
};

let I_RTagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;
// Support: IE <=9 only
I_WrapMap.optgroup = I_WrapMap.option;

I_WrapMap.tbody = I_WrapMap.tfoot = I_WrapMap.colgroup = I_WrapMap.caption = I_WrapMap.thead;
I_WrapMap.th = I_WrapMap.td;
let I_Doc = G_DOCUMENT.implementation.createHTMLDocument(G_EMPTY);
let I_Base = I_Doc.createElement('base');
I_Base.href = G_DOCUMENT.location.href;
I_Doc.head.appendChild(I_Base);

let I_UnmountVframs = (vf, n) => {
    let id = IdIt(n);
    if (vf['@{vframe#children}'][id]) {
        vf.unmountVframe(id, 1);
    } else {
        vf.unmountZone(id, 1);
    }
};
let I_GetNode = (html, node) => {
    let tmp = I_Doc.createElement('div');
    // Deserialize a standard representation
    let tag = I_SVGNS == node.namespaceURI ? 'g' : (I_RTagName.exec(html) || [0, ''])[1].toLowerCase();
    let wrap = I_WrapMap[tag] || I_WrapMap.all;
    tmp.innerHTML = wrap[1] + html;

    // Descend through wrappers to the right content
    let j = wrap[0];
    while (j--) {
        tmp = tmp.lastChild;
    }
    return tmp;
};
//https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
let I_Specials = {
    INPUT: ['value', 'checked', 'disabled', 'readonly'],
    OPTION: ['selected']
};
I_Specials.TEXTAREA = I_Specials.INPUT;
let I_PartialAttrs = {
    'style': 1,
    'id': 1
};
let I_SetAttributes = (oldNode, newNode, ref, mxNode, flags) => {
    let a, b, i, ns, s;
    let oldAttributes = oldNode.attributes,
        newAttributes = newNode.attributes,
        nodeName = oldNode.nodeName, lazySetId;
    let specials = I_Specials[nodeName];
    if (specials) {
        for (s of specials) {
            if (oldNode[s] != newNode[s]) {//浏览器必须激活
                oldNode[s] = newNode[s];
            }
        }
    }
    // Remove old attributes.
    for (i = oldAttributes.length; i--;) {
        a = oldAttributes[i];
        s = a.localName;
        if (!flags || !G_Has(flags, s)) {
            ns = a.namespaceURI;
            b = newAttributes.getNamedItemNS(ns, s);
            if (!b && (!mxNode || s != 'id')) {
                if (s == 'id' && oldNode['@{node#auto.id}']) {
                    oldNode['@{node#auto.id}'] = 0;
                }
                oldAttributes.removeNamedItemNS(ns, s);
            }
        }
    }

    // Set new attributes.
    for (i = newAttributes.length; i--;) {
        a = newAttributes[i];
        s = a.localName;
        if (flags != I_PartialAttrs || !G_Has(flags, s)) {
            ns = a.namespaceURI;
            b = oldAttributes.getNamedItemNS(ns, s);
            lazySetId = mxNode && s == 'id';
            if (lazySetId) {
                nodeName = a.value;
                a.value = '';
            }
            if (!b) {
                // Add a new attribute.
                newAttributes.removeNamedItemNS(ns, s);
                oldAttributes.setNamedItemNS(a);
                if (lazySetId) ref.d.push([a, nodeName]);
            } else if (b.value !== a.value) {
                // Update existing attribute.
                b.value = a.value;
                if (lazySetId) ref.d.push([b, nodeName]);
            }
        }
    }
};

let I_SetChildNodes = (oldParent, newParent, ref, vf, data, keys) => {
    let oldNode = oldParent.firstChild;
    let newNode = newParent.firstChild;
    let tempNew, tempOld, extra = 0, nodeKey, foundNode, keyedNodes = {};
    // Extract keyed nodes from previous children and keep track of total count.
    while (oldNode) {
        extra++;
        tempOld = oldNode;
        nodeKey = tempOld.id;
        oldNode = oldNode.nextSibling;
        if (nodeKey && !tempOld['@{node#auto.id}']) {
            keyedNodes[nodeKey] = tempOld;
        }
    }
    oldNode = oldParent.firstChild;
    while (newNode) {
        extra--;
        tempNew = newNode;
        newNode = newNode.nextSibling;
        if ((nodeKey = tempNew.id) && (foundNode = keyedNodes[nodeKey])) {
            delete keyedNodes[nodeKey];
            // If we have a key and it existed before we move the previous node to the new position if needed and diff it.
            if (foundNode !== oldNode) {
                oldParent.insertBefore(foundNode, oldNode);
            } else {
                oldNode = oldNode.nextSibling;
            }

            I_SetNode(foundNode, tempNew, oldParent, ref, vf, data, keys);
        } else if (oldNode) {
            nodeKey = oldNode.id;
            tempOld = oldNode;
            oldNode = oldNode.nextSibling;
            if (nodeKey && keyedNodes[nodeKey]) {
                extra++;
                // If the old child had a key we skip over it until the end.
                oldParent.insertBefore(tempNew, tempOld);
            } else {
                // Otherwise we diff the two non-keyed nodes.
                I_SetNode(tempOld, tempNew, oldParent, ref, vf, data, keys);
            }
        } else {
            // Finally if there was no old node we add the new node.
            oldParent.appendChild(tempNew);
            ref.c = 1;
        }
    }
    // Remove old keyed nodes.
    for (nodeKey in keyedNodes) {
        extra--;
        tempOld = keyedNodes[nodeKey];
        I_UnmountVframs(vf, tempOld);
        oldParent.removeChild(tempOld);
        ref.c = 1;
    }

    // If we have any remaining unkeyed nodes remove them from the end.
    while (--extra >= 0) {
        tempOld = oldParent.lastChild;
        I_UnmountVframs(vf, tempOld);
        oldParent.removeChild(tempOld);
        ref.c = 1;
    }
};

let I_SetNode = (oldNode, newNode, oldParent, ref, vf, data, keys) => {
    if (oldNode.nodeType === newNode.nodeType) {
        // Handle regular element node updates.
        if (oldNode.nodeType === 1) {

            // Update the elements attributes / tagName.
            if (oldNode.nodeName === newNode.nodeName) {
                // If we have the same nodename then we can directly update the attributes.

                let newMxView = newNode.getAttribute(G_MX_VIEW),
                    newHTML = newNode.innerHTML;
                let updateAttribute, updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[oldNode.id],
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
                            node: newNode,
                            deep,
                            //data: dataChanged,
                            html: htmlChanged
                        };
                        I_SetAttributes(oldNode, newNode, ref, 1, I_PartialAttrs);
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
                    I_SetAttributes(oldNode, newNode, ref, oldVf && newMxView);
                }
                // Update all children (and subchildren).
                if (updateChildren) {
                    ref.c = 1;
                    I_SetChildNodes(oldNode, newNode, ref, vf, data, keys);
                }
            } else {
                // Otherwise clone the new node to use as the existing node.
                //let newPrev = newNode.cloneNode();
                // Copy over all existing children from the original node.
                //while (oldNode.firstChild) newPrev.appendChild(oldNode.firstChild);
                // Replace the original node with the new one with the right tag.
                I_UnmountVframs(vf, oldNode);
                oldParent.replaceChild(newNode, oldNode);
                ref.c = 1;
            }
        } else {
            // Handle other types of node updates (text/comments/etc).
            // If both are the same type of node we can update directly.
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue;
                ref.c = 1;
            }
        }
    } else {
        // we have to replace the node.
        I_UnmountVframs(vf, oldNode);
        oldParent.replaceChild(newNode, oldNode);
        ref.c = 1;
    }
};

let I_ContentReg = /\d+\x1d/g;
let I_UpdateDOM = (updater, data, changed, keys) => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [] },
        node = G_GetById(selfId),
        tmpl, html, x;
    if (view && view['@{view#sign}'] > 0 && (tmpl = view['@{view#template.object}'])) {
        console.time('[dom time:' + selfId + ']');
        if (changed) {
            html = View_SetEventOwner(tmpl(G_SPLITER, data), selfId);
            I_SetChildNodes(node, I_GetNode(html, node), ref, vf, data, keys);
            for (x of ref.d) {
                x[0].value = x[1];
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
        console.timeEnd('[dom time:' + selfId + ']');
    }
};