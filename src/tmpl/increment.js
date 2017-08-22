/*
    直接应用节点对比方案，需要解决以下问题
    1.　view销毁问题，节点是边对比边销毁或新增，期望是view先统一销毁，然后再统一渲染
    2.　需要识别view内的节点变化，如
        <div mx-viwe="app/view">
            <%for(var i=0;i<count;i++){%>
                <span><%=i%></span>
            <%}%>
        </div>
        从外层的div看，并没有变化，但是内部的节点发生了变化，该view仍然需要销毁
 */

//https://github.com/DylanPiercey/set-dom/blob/master/src/index.js
//https://github.com/patrick-steele-idem/morphdom
var I_WrapMap = {

    // Support: IE <=9 only
    option: [1, '<select multiple="multiple">', '</select>'],

    // XHTML parsers do not magically insert elements in the
    // same way that tag soup parsers do. So we cannot shorten
    // this by omitting <tbody> or other required elements.
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    area: [1, '<map>', '</map>'],
    param: [1, '<object>', '</object>'],
    all: [0, '', '']
};

var I_RTagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;
var I_RXhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;

// Support: IE <=9 only
I_WrapMap.optgroup = I_WrapMap.option;

I_WrapMap.tbody = I_WrapMap.tfoot = I_WrapMap.colgroup = I_WrapMap.caption = I_WrapMap.thead;
I_WrapMap.th = I_WrapMap.td;

var I_GetNode = function(html) {
    var tmp = G_DOCUMENT.createElement('div');

    // Deserialize a standard representation
    var tag = (I_RTagName.exec(html) || [0, ''])[1].toLowerCase();
    var wrap = I_WrapMap[tag] || I_WrapMap.all;
    tmp.innerHTML = wrap[1] + html.replace(I_RXhtmlTag, '<$1></$2>') + wrap[2];

    // Descend through wrappers to the right content
    var j = wrap[0];
    while (j--) {
        tmp = tmp.lastChild;
    }
    return tmp;
};
var ELEMENT_TYPE = 1;
var I_GetKey = function(node) {
    if (node.nodeType !== ELEMENT_TYPE) return;
    return node.id;
};
//https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
var I_Specials = ['checked', 'disabled', 'value'];
var I_SetAttributes = function(oldNode, newNode) {
    if (!oldNode.hasAttribute('mx-ua')) return; //没有要更新的属性
    var i, a, b, ns, name;
    var oldAttributes = oldNode.attributes,
        newAttributes = newNode.attributes,
        nodeName = oldNode.nodeName;

    if (nodeName == 'INPUT' || nodeName == 'TEXTAREA') {
        for (i = I_Specials.length; i--;) {
            name = I_Specials[i];
            if (oldNode[name] !== newNode[name]) {
                oldNode[name] = newNode[name];
            }
        }
    } else if (nodeName == 'OPTION') {
        if (oldNode.selected != newNode.selected) {
            oldNode.selected = newNode.selected;
        }
    }
    // Remove old attributes.
    for (i = oldAttributes.length; i--;) {
        a = oldAttributes[i];
        ns = a.namespaceURI;
        name = a.localName;
        b = newAttributes.getNamedItemNS(ns, name);
        if (!b) oldAttributes.removeNamedItemNS(ns, name);
    }

    // Set new attributes.
    for (i = newAttributes.length; i--;) {
        a = newAttributes[i];
        ns = a.namespaceURI;
        name = a.localName;
        b = oldAttributes.getNamedItemNS(ns, name);
        if (!b) {
            // Add a new attribute.
            //newAttributes.removeNamedItemNS(ns, name);
            oldAttributes.setNamedItemNS(a);
        } else if (b.value !== a.value) {
            // Update existing attribute.
            b.value = a.value;
        }
    }
};

var I_SetChildNodes = function(oldParent, newParent) {
    var checkOld, oldKey, checkNew, newKey, foundNode, keyedNodes;
    var oldNode = oldParent.firstChild;
    var newNode = newParent.firstChild;
    var extra = 0;

    // Extract keyed nodes from previous children and keep track of total count.
    while (oldNode) {
        extra++;
        checkOld = oldNode;
        oldKey = I_GetKey(checkOld);
        oldNode = oldNode.nextSibling;

        if (oldKey) {
            if (!keyedNodes) keyedNodes = {};
            keyedNodes[oldKey] = checkOld;
        }
    }

    // Loop over new nodes and perform updates.
    oldNode = oldParent.firstChild;
    while (newNode) {
        extra--;
        checkNew = newNode;
        newNode = newNode.nextSibling;

        if (keyedNodes && (newKey = I_GetKey(checkNew)) && (foundNode = keyedNodes[newKey])) {
            delete keyedNodes[newKey];
            // If we have a key and it existed before we move the previous node to the new position if needed and diff it.
            if (foundNode !== oldNode) {
                oldParent.insertBefore(foundNode, oldNode);
            } else {
                oldNode = oldNode.nextSibling;
            }

            I_SetNode(foundNode, checkNew);
        } else if (oldNode) {
            checkOld = oldNode;
            oldNode = oldNode.nextSibling;
            if (I_GetKey(checkOld)) {
                // If the old child had a key we skip over it until the end.
                oldParent.insertBefore(checkNew, checkOld);
            } else {
                // Otherwise we diff the two non-keyed nodes.
                I_SetNode(checkOld, checkNew);
            }
        } else {
            // Finally if there was no old node we add the new node.
            oldParent.appendChild(checkNew);
        }
    }

    // Remove old keyed nodes.
    for (oldKey in keyedNodes) {
        extra--;
        oldParent.removeChild(keyedNodes[oldKey]);
    }

    // If we have any remaining unkeyed nodes remove them from the end.
    while (--extra >= 0) {
        oldParent.removeChild(oldParent.lastChild);
    }
};

var I_SetNode = function(oldNode, newNode) {
    if (oldNode.nodeType === newNode.nodeType) {
        // Handle regular element node updates.
        if (oldNode.nodeType === ELEMENT_TYPE) {

            // Update all children (and subchildren).
            I_SetChildNodes(oldNode, newNode);

            // Update the elements attributes / tagName.
            if (oldNode.nodeName === newNode.nodeName) {
                // If we have the same nodename then we can directly update the attributes.
                I_SetAttributes(oldNode, newNode);
            } else {
                // Otherwise clone the new node to use as the existing node.
                var newPrev = newNode.cloneNode();
                // Copy over all existing children from the original node.
                while (oldNode.firstChild) newPrev.appendChild(oldNode.firstChild);
                // Replace the original node with the new one with the right tag.
                oldNode.parentNode.replaceChild(newPrev, oldNode);
            }
        } else {
            // Handle other types of node updates (text/comments/etc).
            // If both are the same type of node we can update directly.
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue;
            }
        }
    } else {
        // we have to replace the node.
        oldNode.parentNode.replaceChild(newNode, oldNode);
    }
};
var Increment = function(oldNode, newHTML) {
    var newNode = I_GetNode(newHTML);
    I_SetChildNodes(oldNode, newNode);
};