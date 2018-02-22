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
    INPUT: [G_VALUE, 'checked'],
    TEXTAREA: [G_VALUE],
    OPTION: ['selected']
};
let I_SetAttributes = (oldNode, newNode, ref, keepId) => {
    let a, i, key, value;
    let oldAttributes = oldNode.attributes,
        newAttributes = newNode.attributes,
        nodeName = oldNode.nodeName;
    for (i = oldAttributes.length; i--;) {
        a = oldAttributes[i].name;
        if (!newNode.getAttribute(a)) {
            if (a == 'id') {
                if (!keepId) {
                    ref.d.push([oldNode, '']);
                }
            } else {
                ref.c = 1;
                oldNode.removeAttribute(a);
            }
        }
    }

    // Set new attributes.
    for (i = newAttributes.length; i--;) {
        a = newAttributes[i];
        key = a.name;
        value = a[G_VALUE];
        if (oldNode.getAttribute(key) != value) {
            if (key == 'id') {
                ref.d.push([oldNode, value]);
            } else {
                ref.c = 1;
                oldNode.setAttribute(key, value);
            }
        }
    }

    let specials = I_Specials[nodeName];
    if (specials) {
        for (i of specials) {
            if (oldNode[i] != newNode[i]) {//浏览器必须激活
                oldNode[i] = newNode[i];
            }
        }
    }
};


let I_SetChildNodes = (oldParent, newParent, ref, vframe, data) => {
    let oldNode = oldParent.firstChild;
    let newNode = newParent.firstChild;
    let tempNew, tempOld, extra = 0, nodeKey, foundNode, keyedNodes = {}, vf;
    // Extract keyed nodes from previous children and keep track of total count.
    while (oldNode) {
        extra++;
        tempOld = oldNode;
        nodeKey = tempOld.id;
        oldNode = oldNode.nextSibling;
        if (tempOld['@{node#auto.id}']) {
            vf = Vframe_Vframes[nodeKey];
            nodeKey = vf && vf['@{vframe#view.path}'];
        }
        if (nodeKey) {
            nodeKey = keyedNodes[nodeKey] || (keyedNodes[nodeKey] = []);
            nodeKey.push(tempOld);
        }
    }
    oldNode = oldParent.firstChild;
    while (newNode) {
        extra--;
        tempNew = newNode;
        newNode = newNode.nextSibling;
        nodeKey = tempNew.id;
        if (!nodeKey && tempNew.nodeType == 1) {
            nodeKey = tempNew.getAttribute(G_MX_VIEW);
            nodeKey = nodeKey && G_ParseUri(nodeKey)[G_PATH];
        }
        foundNode = keyedNodes[nodeKey];
        if (foundNode && (foundNode = foundNode.shift())) {
            if (foundNode != oldNode) {//如果找到的节点和当前不同，则移动
                oldParent.insertBefore(foundNode, oldNode);
            } else {
                oldNode = oldNode.nextSibling;
            }
            I_SetNode(foundNode, tempNew, oldParent, ref, vframe, data);
        } else if (oldNode) {
            tempOld = oldNode;
            nodeKey = tempOld.id;
            if (tempOld['@{node#auto.id}']) {
                vf = Vframe_Vframes[nodeKey];
                nodeKey = vf && vf['@{vframe#view.path}'];
            }
            if (nodeKey && keyedNodes[nodeKey]) {
                extra++;
                ref.c=1;
                // If the old child had a key we skip over it until the end.
                oldParent.insertBefore(tempNew, tempOld);
            } else {
                oldNode = oldNode.nextSibling;
                // Otherwise we diff the two non-keyed nodes.
                I_SetNode(tempOld, tempNew, oldParent, ref, vframe, data);
            }
        } else {
            // Finally if there was no old node we add the new node.
            oldParent.appendChild(tempNew);
            ref.c = 1;
        }
    }

    // If we have any remaining unkeyed nodes remove them from the end.
    while (extra-- > 0) {
        tempOld = oldParent.lastChild;
        I_UnmountVframs(vframe, tempOld);
        oldParent.removeChild(tempOld);
        ref.c = 1;
    }
};

let I_SetNode = (oldNode, newNode, oldParent, ref, vf, data) => {
    if (oldNode.nodeName === newNode.nodeName) {
        // Handle regular element node updates.
        if (oldNode.nodeType === 1) {

            // If we have the same nodename then we can directly update the attributes.

            let newMxView = newNode.getAttribute(G_MX_VIEW),
                newHTML = newNode.innerHTML;
            let updateAttribute, updateChildren, unmountOld,
                oldVf = Vframe_Vframes[oldNode.id],
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
            if (newMxView && oldVf &&
                oldVf['@{vframe#view.path}'] == uri[G_PATH]) {
                if (needUpdate) {
                    if (assign) {
                        params = uri[G_PARAMS];
                        //处理引用赋值
                        if (newMxView.indexOf(G_SPLITER) > -1) {
                            GSet_Params(data, params, params);
                        }
                        oldVf['@{vframe#template}'] = newHTML;
                        //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                        oldVf[G_PATH] = newMxView;//update ref
                        uri = {
                            node: newNode,
                            deep: !view['@{view#template.object}'],//无模板的组件深入比较子节点
                            //data: dataChanged,
                            html: htmlChanged
                        };
                        I_SetAttributes(oldNode, newNode, ref, 1);
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
                I_SetAttributes(oldNode, newNode, ref, oldVf && newMxView);
            }
            // Update all children (and subchildren).
            if (updateChildren) {
                //ref.c = 1;
                I_SetChildNodes(oldNode, newNode, ref, vf, data);
            }
        } else if (oldNode.nodeValue !== newNode.nodeValue) {
            oldNode.nodeValue = newNode.nodeValue;
        }
    } else {
        // we have to replace the node.
        I_UnmountVframs(vf, oldNode);
        oldParent.replaceChild(newNode, oldNode);
        ref.c = 1;
    }
};
let I_UpdateDOM = (updater) => {
    let selfId = updater['@{updater#view.id}'];
    let vf = Vframe_Vframes[selfId];
    let data = updater['@{updater#data}'];
    let view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [] },
        node = G_GetById(selfId),
        tmpl, html, x;
    if (view && view['@{view#sign}'] > 0 && (tmpl = view['@{view#template.object}'])) {
        console.time('[dom time:' + selfId + ']');
        html = View_SetEventOwner(tmpl(data), selfId);
        I_SetChildNodes(node, I_GetNode(html, node), ref, vf, data);
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
        view.fire('domready');
        console.timeEnd('[dom time:' + selfId + ']');
    }
};