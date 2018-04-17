
let _getHTML = (vnode,withTag) => {
  let c,key,value,tag,prefix,content
  tag = vnode['@{~v#node.tag}']
  content = vnode['@{~v#node.html}']
  if(tag == TO_VDOM_TEXT_NODE) return content
  
  if(tag && withTag){
      prefix = '<' + tag + ' ' 
      for (c of vnode['@{~v#node.attrs}']) {
          key = c['@{~v#node.attrs.key}'];
          value = c['@{~v#node.attrs.value}'];
          prefix +=  ' ' + key + '="' + TO_VDOM_Unescape(value)+'"';
      }
      if(vnode['@{~v#node.self.close}']){
          return prefix + ' />'
      }else{
          return prefix + ' >'+ content + '</'+tag+'>'
      }
  }else{
    return content
  }
}

let V_GetOuterNodehtml = (vnode) => {

    if(vnode['@{~v#node.outer.html}']){
      return vnode['@{~v#node.outer.html}']
    }
    vnode['@{~v#node.outer.html}'] = _getHTML(vnode,true)

    return vnode['@{~v#node.outer.html}']
}

let V_GetNodehtml = (vnode,withTag) => {

    if(vnode['@{~v#node.html}']){
      return _getHTML(vnode,withTag)
    }

    let content = ''
    if(Array.isArray(vnode)){
        vnode.forEach(function(node){
            content += V_GetNodehtml(node,withTag)
        })
    }else{
        if(vnode['@{~v#node.children}'].length > 0){
          content = V_GetNodehtml(vnode['@{~v#node.children}'],true)
        }
    }
    vnode['@{~v#node.html}'] = content

    return _getHTML(vnode,withTag)
}

let tmplMxEventReg = /mx-(?!view|vframe|owner|autonomy|datafrom|guid|ssid|dep|html|static)([a-zA-Z]+)/;

let V_CreatElement = function(tag,attrs,...children){

    let vdom = {}
    let compareKey = ''
    let view = this
    attrs = attrs || {}
    children = children || []

    // 如果发现是组件实例，那么我们需要做个别名转换
    if(tag instanceof Function){
        if(!Magix.addView){
            console.error('unsupport template tag,function tag must use magix webpack');
            return 
        }
        let guid = G_Id('_mv_')
        attrs['mx-view'] = guid
        Magix.addView(guid,tag)  // 这样后续可以通过guid 找到这个实例
        tag = 'div'  // 默认用div是不是不好
    }

    vdom['@{~v#node.attrs.map}'] = attrs
    vdom['@{~v#node.attrs}'] = []

    Object.keys(attrs).forEach(function(attrKey){
        
        // compareKey的处理
        if (attrKey == 'id') {//如果有id优先使用
            compareKey = attrs[attrKey];
        } else if (attrKey == G_MX_VIEW && attrs[attrKey] && !compareKey) {
            //否则如果是组件,则使用组件的路径做为key
            compareKey = G_ParseUri(attrs[attrKey])[G_PATH]
        } else if (attrKey == 'mxs') {
            if (!compareKey) compareKey = attrs[attrKey];
        }

        // eventName的处理，我觉得可以直接用另外一种去做。直接是fn
        if (tmplMxEventReg.test(attrKey)) {
            var name = attrs[attrKey]; // 支持直接传递函数了
            var prop = void 0;
            var efid = '';
            if (name instanceof Function) {
                efid = G_Id('_efn_')
                name = efid + '()'; // 使用一个代替
                // 将这个函数存起来，等待后面去调用
                prop = view.constructor[G_PROTOTYPE];
                prop[efid + G_SPLITER + 'click'] = attrs[attrKey];
            }
            attrs[attrKey] = view.id + '\x1e' + name;
        }

        vdom['@{~v#node.attrs}'].push({
            '@{~v#node.attrs.key}':attrKey,
            '@{~v#node.attrs.value}':attrs[attrKey]
        })
    })

    // 如果是mx-view，那么属性需要特殊处理
    if(attrs['mx-view']){
        let mxViewParams = [] // attrs['mx-view'].indexOf('?') !== -1 ? '' : '?'
        let mxAttr = null
        let sKey,viewKey,mxViewParamsString
        vdom['@{~v#node.attrs}'].forEach(function(attr){
            if(attr['@{~v#node.attrs.key}'] === 'mx-view'){
                mxAttr = attr
            }else if(attr['@{~v#node.attrs.key}'].trim().startsWith('view-')){
                // 如果属性的值是个变量，而不是字符串 ？ 暂时区分不出来，干脆全部当做透传变量吧
                sKey = G_SPLITER + G_Id('sk')  // 如果是string是否可以优化下，以string为key
                view.updater['@{updater#data}'][sKey] = attr['@{~v#node.attrs.value}'] // 先存起来
                attr['@{~v#node.attrs.value}'] = sKey
                vdom['@{~v#node.attrs.map}'][attr['@{~v#node.attrs.key}']] = sKey

                viewKey = attr['@{~v#node.attrs.key}'].replace('view-','')  // view-xxx => xxx
                mxViewParams.push(viewKey + '=' + sKey)
            }
        })
        mxViewParamsString = mxAttr['@{~v#node.attrs.value}'] + '?' + mxViewParams.join('&')
        mxAttr['@{~v#node.attrs.value}'] = mxViewParamsString
        attrs['mx-view'] = mxViewParamsString
    }

    if(tag){
        vdom['@{~v#node.tag}'] = tag
        vdom['@{~v#node.compare.key}'] = compareKey
    }

    vdom['@{~v#node.children}'] = []

    children.forEach(function(child){
        if(G_IsObject(child)){
            vdom['@{~v#node.children}'].push(child)
        }else{
            // 针对text需要做处理
            vdom['@{~v#node.children}'].push({
                '@{~v#node.html}': child,
                '@{~v#node.tag}' : TO_VDOM_TEXT_NODE
            })
        }
    })

    return vdom
}


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
    let c, key, value,
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
};

let V_SpecialDiff = (oldNode, lastVDOM, newVDOM) => {
    let tag = lastVDOM['@{~v#node.tag}'], c, now;
    let specials = TO_VDOM_SPECIAL_PROPS[tag];
    let nMap = newVDOM['@{~v#node.attrs.map}'];
    let result = 0;
    if (specials) {
        for (c of specials) {
            now = G_Has(nMap, c) ? c != G_VALUE || nMap[c] : c == G_VALUE && G_EMPTY;
            if (oldNode[c] != now) {
                result = 1;
                oldNode[c] = now;
            }
        }
    }
    return result;
};
let V_CreateNode = (vnode, owner, ref, c, tag) => {
    tag = vnode['@{~v#node.tag}'];
    if (tag == TO_VDOM_TEXT_NODE) {
        return G_DOCUMENT.createTextNode(vnode['@{~v#node.html}']);
    }
    let nHtml = V_GetNodehtml(vnode);
    c = G_DOCUMENT.createElementNS(tag == 'svg' ? V_SVGNS : owner.namespaceURI, tag);
    V_SetAttributes(c, 0, vnode, ref);
    if (nHtml) {
        c.innerHTML = nHtml;
    }
    return c;
};
let V_GenKeyedNodes = (vnodes, nodes, start, end) => {
    let keyed = {}, i = end, v, key;
    for (; i >= start; i--) {
        v = vnodes[i];
        key = v['@{~v#node.compare.key}'];
        if (key) {
            key = keyed[key] || (keyed[key] = []);
            key.push({
                '@{~v#old.list.node}': nodes[i],
                '@{~v#old.vlist.node}': v
            });
        }
    }
    return keyed;
};
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, data, keys) => {
    if (lastVDOM) {//view首次初始化，通过innerHTML快速更新
        let i, oi = 0,
            oldChildren = lastVDOM['@{~v#node.children}'],
            newChildren = newVDOM['@{~v#node.children}'], oc, nc,
            oldCount = oldChildren.length, newCount = newChildren.length,
            reused = newVDOM['@{~v#node.reused}'],
            nodes = realNode.childNodes, compareKey,
            orn, ovn, keyedNodes = {};
        for (i = oldCount; i--;) {
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
        /* let oldStartIdx = 0,
             oldEndIdx = oldCount - 1,
             newStartIdx = 0,
             newEndIdx = newCount - 1,
             oldStartVNode = oldChildren[oldStartIdx],
             oldEndVNode = oldChildren[oldEndIdx],
             newStartVNode = newChildren[newStartIdx],
             newEndVNode = newChildren[newEndIdx];
 
         while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
             if (newStartVNode['@{~v#node.compare.key}'] == oldStartVNode['@{~v#node.compare.key}']) {
                 V_SetNode(nodes[newStartIdx], realNode, oldStartVNode, newStartVNode, ref, vframe, data);
                 newStartVNode = newChildren[++newStartIdx];
                 oldStartVNode = oldChildren[++oldStartIdx];
             } else if (newEndVNode['@{~v#node.compare.key}'] == oldEndVNode['@{~v#node.compare.key}']) {
                 V_SetNode(nodes[newEndIdx], realNode, oldEndVNode, newEndVNode, ref, vframe, data);
                 newEndVNode = newChildren[--newEndIdx];
                 oldEndVNode = oldChildren[--oldEndIdx];
             } else {
                 if (!keyedNodes) keyedNodes = V_GenKeyedNodes(oldChildren, nodes, oldStartIdx, oldEndIdx);
 
             }
         }
         if (newStartIdx > newEndIdx) {
             for (i = oldStartIdx; i <= oldEndIdx; i++) {
                 oi = nodes[oldStartIdx];//删除多余的旧节点
                 V_UnmountVframs(vframe, oi);
                 realNode.removeChild(oi);
                 ref.c = 1;
             }
         }*/

        /*#if(modules.updaterAsync){#*/
        for (i = 0; i < newCount; i++) {
            oc = oldChildren[i];
            nc = newChildren[i];
            compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
            if (compareKey && (compareKey = compareKey.pop())) {
                orn = compareKey['@{~v#old.list.node}'];
                ovn = compareKey['@{~v#old.vlist.node}'];
                if (orn != nodes[i]) {//如果找到的节点和当前不同，则移动
                    oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                    for (oi = oldChildren.length; oi--;) {//从后向前清理虚拟dom
                        if (oldChildren[oi] == ovn) {
                            oldChildren.splice(oi, 1);
                            break;
                        }
                    }
                    realNode.insertBefore(orn, nodes[i]);
                }
                Async_AddTask(vframe, V_SetNode, nodes[i], realNode, oc, nc, ref, vframe, data, keys);
            } else if (oc) {//有旧节点，则更新
                if (keyedNodes[oc['@{~v#node.compare.key}']] &&
                    reused[oc['@{~v#node.compare.key}']]) {
                    oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                    oldCount++;
                    ref.c = 1;
                    realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                } else {
                    Async_AddTask(vframe, V_SetNode, nodes[i], realNode, oc, nc, ref, vframe, data, keys);
                }
            } else {//添加新的节点
                oldChildren.push(nc);
                realNode.appendChild(V_CreateNode(nc, realNode, ref));
                ref.c = 1;
            }
        }
        oi = oldCount - newCount;
        if (oi > 0) {
            oldChildren.splice(-oi);
        }
        /*#}else{#*/
        for (i = 0; i < newCount; i++) {
            do {
                oc = oldChildren[oi++];
            } while (oc && oc['@{~v#vnode.moved}']);
            nc = newChildren[i];
            compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
            if (compareKey && (compareKey = compareKey.pop())) {
                orn = compareKey['@{~v#old.list.node}'];
                ovn = compareKey['@{~v#old.vlist.node}'];
                if (orn != nodes[i]) {//如果找到的节点和当前不同，则移动
                    // oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                    // for (j = oldChildren.length; j--;) {//从后向前清理虚拟dom
                    //     if (oldChildren[j] == ovn) {
                    //         oldChildren.splice(j, 1);
                    //         break;
                    //     }
                    // }
                    ovn['@{~v#vnode.moved}'] = 1;
                    oc = ovn;
                    realNode.insertBefore(orn, nodes[i]);
                }
                V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data, keys);
            } else if (oc) {//有旧节点，则更新
                if (keyedNodes[oc['@{~v#node.compare.key}']] &&
                    reused[oc['@{~v#node.compare.key}']]) {
                    //oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                    oldCount++;
                    oi--;
                    ref.c = 1;
                    realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                } else {
                    V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, data, keys);
                    //ref.c = 1;
                }
            } else {//添加新的节点
                realNode.appendChild(V_CreateNode(nc, realNode, ref));
                ref.c = 1;
            }
        }
        /*#}#*/
        for (i = newCount; i < oldCount; i++) {
            oi = nodes[newCount];//删除多余的旧节点
            V_UnmountVframs(vframe, oi);
            realNode.removeChild(oi);
            ref.c = 1;
        }
    } else {
        ref.c = 1;
        realNode.innerHTML = V_GetNodehtml(newVDOM);
    }
};
/*#if(modules.updaterAsync){#*/
let V_CopyVNode = (lastVDOM, newVDOM, withChildren, p) => {
    for (p in lastVDOM) {
        if (withChildren || p != '@{~v#node.children}') {
            delete lastVDOM[p];
        }
    }
    for (p in newVDOM) {
        if (withChildren || p != '@{~v#node.children}') {
            lastVDOM[p] = newVDOM[p];
        }
    }
};
/*#}#*/
let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, data, keys) => {
    if (DEBUG) {
        if (oldParent.nodeName == 'TEMPLATE') {
            console.error('unsupport template tag');
        }
        if ((realNode.nodeName == '#text' && lastVDOM['@{~v#node.tag}'] != '#text') || (
            realNode.nodeName != '#text' && realNode.nodeName.toLowerCase() != lastVDOM['@{~v#node.tag}'])) {
            console.error('Your code is not match the DOM tree generated by the browser. near:' + V_GetNodehtml(lastVDOM) + '. Is that you lost some tags or modified the DOM tree?');
        }
    }
    let lastAMap = lastVDOM['@{~v#node.attrs.map}'],
        newAMap = newVDOM['@{~v#node.attrs.map}'];
    if (V_SpecialDiff(realNode, lastVDOM, newVDOM) ||
        G_Has(lastAMap, 'mxv') ||
        V_GetOuterNodehtml(lastVDOM) != V_GetOuterNodehtml(newVDOM)) {
        if (lastVDOM['@{~v#node.tag}'] == newVDOM['@{~v#node.tag}']) {
            if (lastVDOM['@{~v#node.tag}'] == TO_VDOM_TEXT_NODE) {
                if (V_GetNodehtml(lastVDOM) != V_GetNodehtml(newVDOM)) {
                    ref.c = 1;
                    /*#if(modules.updaterAsync){#*/
                    lastVDOM['@{~v#node.html}'] = newVDOM['@{~v#node.html}'];
                    /*#}#*/
                    realNode.nodeValue = TO_VDOM_Unescape(newVDOM['@{~v#node.html}']);
                }
            } else if (!lastAMap[G_Tag_Key] || lastAMap[G_Tag_Key] != newAMap[G_Tag_Key]) {
                let newMxView = newAMap[G_MX_VIEW],
                    newHTML = V_GetNodehtml(newVDOM);
                let updateAttribute = !newAMap[G_Tag_Attr_Key] || lastAMap[G_Tag_Attr_Key] != newAMap[G_Tag_Attr_Key],
                    updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[realNode.id],
                    assign,
                    view,
                    uri = newMxView && G_ParseUri(newMxView),
                    params,
                    htmlChanged,
                    paramsChanged/*, 
                    oldDataStringify, newDataStringify,dataChanged*/;
                /*
                    如果存在新旧view，则考虑路径一致，避免渲染的问题
                 */

                /*
                    只检测是否有参数控制view而不检测数据是否变化的原因：
                    例：view内有一input接收传递的参数，且该input也能被用户输入
                    var d1='xl';
                    var d2='xl';
                    当传递第一份数据时，input显示值xl，这时候用户修改了input的值且使用第二份数据重新渲染这个view，问input该如何显示？
                */
                //旧节点有view,新节点有view,且是同类型的view
                if (newMxView && oldVf &&
                    oldVf['@{vframe#view.path}'] == uri[G_PATH] &&
                    (view = oldVf['@{vframe#view.entity}'])) {
                    htmlChanged = newHTML != V_GetNodehtml(lastVDOM);
                    paramsChanged = newMxView != oldVf[G_PATH];
                    assign = lastAMap[G_Tag_View_Key];
                    if (!htmlChanged && !paramsChanged && assign) {
                        params = assign.split(G_COMMA);
                        for (assign of params) {
                            if (G_Has(keys, assign)) {
                                paramsChanged = 1;
                                break;
                            }
                        }
                    }
                    if (paramsChanged || htmlChanged) {
                        assign = view['@{view#assign.fn}'];
                        //如果有assign方法,且有参数或html变化
                        if (assign) {
                            params = uri[G_PARAMS];
                            //处理引用赋值
                            if (newMxView.indexOf(G_SPLITER) > -1) {
                                G_TranslateData(data, params);
                            }
                            //oldVf['@{vframe#template}'] = newHTML;
                            //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                            oldVf[G_PATH] = newMxView;//update ref
                            //如果需要更新，则进行更新的操作
                            uri = {
                                node: newVDOM,
                                html: newHTML,
                                deep: !view['@{view#template.object}'],
                                inner: htmlChanged,
                                query: paramsChanged
                            };
                            updateAttribute = 1;
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
                    } else {
                        updateAttribute = 1;
                    }
                } else {
                    updateChildren = 1;
                    unmountOld = oldVf;
                }
                if (unmountOld) {
                    ref.c = 1;
                    oldVf.unmountVframe(0, 1);
                }
                if (updateAttribute) {
                    V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
                }
                // Update all children (and subchildren).
                //自闭合标签不再检测子节点
                if (updateChildren &&
                    !(newVDOM['@{~v#node.self.close}'] &&
                        lastVDOM['@{~v#node.self.close}'])) {
                    //ref.c = 1;
                    V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, data, keys);
                }
                /*#if(modules.updaterAsync){#*/
                V_CopyVNode(lastVDOM, newVDOM);
                /*#}#*/
            }
        } else {
            /*#if(modules.updaterAsync){#*/
            V_CopyVNode(lastVDOM, newVDOM, 1);
            /*#}#*/
            V_UnmountVframs(vframe, realNode);
            oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
            ref.c = 1;
        }
    }
};