let Q_EM = {
    '&': 'amp',
    '<': 'lt',
    '>': 'gt',
    '"': '#34',
    '\'': '#39',
    '\`': '#96'
};
let Q_ER = /[&<>"'\`]/g;
let Q_Safeguard = v => '' + (v == null ? '' : v);
let Q_EncodeReplacer = m => `&${Q_EM[m]};`;
let Q_Encode = v => Q_Safeguard(v).replace(Q_ER, Q_EncodeReplacer);

let Q_Ref = ($$, v, k, f) => {
    for (f = $$[G_SPLITER]; --f;)
        if ($$[k = G_SPLITER + f] === v) return k;
    $$[k = G_SPLITER + $$[G_SPLITER]++] = v;
    return k;
};
let Q_UM = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A'
};
let Q_URIReplacer = m => Q_UM[m];
let Q_URIReg = /[!')(*]/g;
let Q_EncodeURI = v => encodeURIComponent(Q_Safeguard(v)).replace(Q_URIReg, Q_URIReplacer);

let Q_QR = /[\\'"]/g;
let Q_EncodeQ = v => Q_Safeguard(v).replace(Q_QR, '\\$&');
//let Q_VfToVNodes={};
let Q_Create = (tag/*, views*/, children, props, unary) => {
    //html=tag+to_array(attrs)+children.html
    let token;
    if (tag) {
        props = props || {};
        let compareKey = G_EMPTY,
            hasMxv,
            prop, value, c,
            reused = {},
            outerHTML = '<' + tag,
            innerHTML = G_EMPTY,
            newChildren = [],
            prevNode;
        for (prop in props) {
            value = props[prop];
            //布尔值
            if (value === false || value == G_NULL) {
                continue;
            } else if (value === true) {
                value = G_EMPTY;
            }
            if (prop == 'id') {//如果有id优先使用
                compareKey = value;
            } else if (prop == G_MX_VIEW && value && !compareKey) {
                //否则如果是组件,则使用组件的路径做为key
                compareKey = G_ParseUri(value)[G_PATH];
            } else if (prop == G_Tag_Key && !compareKey) {
                compareKey = value;
            } else if (prop == G_Tag_View_Key) {
                hasMxv = 1;
            }
            props[prop] = value;
            outerHTML += ` ${prop}="${value}"`;
        }
        if (unary) {
            outerHTML += '/>';
        } else {
            outerHTML += '>';
            if (children) {
                for (c of children) {
                    innerHTML += c['@{~v#node.outer.html}'];
                    //merge text node
                    if (prevNode &&
                        c['@{~v#node.tag}'] == V_TEXT_NODE &&
                        prevNode['@{~v#node.tag}'] == V_TEXT_NODE) {
                        //prevNode['@{~v#node.html}'] += c['@{~v#node.html}'];
                        prevNode['@{~v#node.outer.html}'] += c['@{~v#node.outer.html}'];
                    } else {
                        //reused node if new node key equal old node key
                        if (c['@{~v#node.compare.key}']) {
                            reused[c['@{~v#node.compare.key}']] = 1;
                        }
                        //force diff children
                        if (c['@{~v#node.has.mxv}'] ||
                            V_SPECIAL_PROPS[c['@{~v#node.tag}']]) {
                            hasMxv = 1;
                        }
                        prevNode = c;
                        newChildren.push(c);
                    }
                }
            }
            outerHTML += innerHTML + `</${tag}>`;
        }
        // if (props[G_MX_VIEW]) {
        //     views.push(newChildren);
        // }
        token = {
            '@{~v#node.outer.html}': outerHTML,
            '@{~v#node.html}': innerHTML,
            '@{~v#node.compare.key}': compareKey,
            '@{~v#node.tag}': tag,
            '@{~v#node.has.mxv}': hasMxv,
            '@{~v#node.attrs.map}': props,
            '@{~v#node.children}': newChildren,
            '@{~v#node.reused}': reused,
            '@{~v#node.self.close}': unary
        };
    } else {
        token = {
            '@{~v#node.tag}': V_TEXT_NODE,
            //'@{~v#node.html}': children,
            '@{~v#node.outer.html}': children
        };
    }
    return token;
};