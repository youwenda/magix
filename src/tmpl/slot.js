/*
    slot
*/

let Slot_Slot = 'slot';
let Slot_RemoveReg = /\s+slot(\s*=\s*"[^"]*")?/g;
/*#if(modules.updaterQuick){#*/
let Slot = {
    from(nodes) {
        let map = {}, n, nMap, slot, c;
        for (n of nodes) {
            nMap = n['@{~v#node.attrs.map}'];
            if ((slot = nMap[Slot_Slot])) {
                delete nMap[Slot_Slot];
                n['@{~v#node.outer.html}'] = n['@{~v#node.outer.html}'].replace(Slot_RemoveReg, '');
                c = map[slot];
                if (c) {
                    if (!c.length) {
                        c = map[slot] = [c];
                    }
                    c.push(n);
                } else {
                    map[slot] = n;
                }
            }
        }
        return map;
    }
};
/*#}else{#*/
let Slot_Default = 'default';
let Slot = {
    from(node) {
        let map = {}, n, sn, dom = node.nodeType;
        let named, nodes = dom ? node.childNodes : node['@{~v#node.children}'];
        for (n of nodes) {
            if (dom ? n.nodeType == dom && n.hasAttribute(Slot_Slot) : G_Has(n['@{~v#node.attrs.map}'], Slot_Slot)) {
                named = 1;
                sn = (dom ? n.getAttribute(Slot_Slot) : n['@{~v#node.attrs.map}'][Slot_Slot]) || Slot_Default;
                map[sn] = (dom ? n.outerHTML : n['@{~v#node.outer.html}']).replace(Slot_RemoveReg, '');
            }
        }
        if (!named) {
            map[Slot_Default] = (dom ? node.innerHTML : node['@{~v#node.html}']).replace(Slot_RemoveReg, '');
        }
        return map;
    }
};
/*#}#*/
Magix.Slot = Slot;