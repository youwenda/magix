let TO_VDOM_SELF_CLOSE = {
    input: 1,
    br: 1,
    hr: 1,
    img: 1,
    embed: 1,
    source: 1,
    area: 1,
    param: 1,
    col: 1,
    track: 1,
    wbr: 1
};
let TO_VDOM_SPECIAL_PROPS = {
    input: [G_VALUE, 'checked'],
    textarea: [G_VALUE],
    option: ['selected']
};
/*#if(modules.updaterVRDOM){#*/
let TO_VDOM_TEXT_NODE = '#text';
/*#}else if(modules.updaterVDOM){#*/
let TO_VDOM_TEXT_NODE = G_COUNTER;
/*#}#*/
if (DEBUG) {
    TO_VDOM_TEXT_NODE = '#text';
}
let TO_VDOM_OpenReg = /^<([a-z\d]+)((?:\s+[-A-Za-z\d_]+(?:="[^"]*")?)*)\s*(\/?)>/,
    TO_VDOM_AttrReg = /([-A-Za-z\d_]+)(?:="([^"]*)")?/g,
    TO_VDOM_CloseReg = /^<\/[a-z\d+]+>/;

let TO_VDOM_UnescapeMap = {};
let TO_VDOM_UnescapeReg = /&#?[^\W]+;?/g;
let TO_VDOM_Temp = G_DOCUMENT.createElement('div');
let TO_VDOM_UnescapeCallback = m => {
    if (!G_Has(TO_VDOM_UnescapeMap, m)) {
        TO_VDOM_Temp.innerHTML = m;
        TO_VDOM_UnescapeMap[m] = TO_VDOM_Temp.innerText;
    }
    return TO_VDOM_UnescapeMap[m];
};
let TO_VDOM_Unescape = str => str.replace(TO_VDOM_UnescapeReg, TO_VDOM_UnescapeCallback);
let TO_VDOM = input => {
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
        stack = [currentParent],
        em,
        amap,
        text,
        unary,
        compareKey;//新旧vnode的比较key
    while (current < count) {
        chars = 1;
        temp = input.slice(current);
        if (temp[0] == '<') {
            if (temp[1] == '/') {
                match = temp.match(TO_VDOM_CloseReg);
                if (match) {
                    em = stack.pop();
                    attrs = input.slice(em['@{~v#content.start.pos}'], current);
                    if (em['@{~v#node.tag}'] == 'textarea') {
                        em['@{~v#node.attrs}'].push({
                            '@{~v#node.attrs.key}': G_VALUE,
                            '@{~v#node.attrs.value}': attrs
                        });
                        em['@{~v#node.attrs.map}'][G_VALUE] = attrs;
                        em['@{~v#node.children}'] = G_EMPTY_ARRAY;
                    } else {
                        em['@{~v#node.html}'] = attrs;
                    }
                    currentParent = stack[stack.length - 1];
                    current += match[0].length;
                    chars = 0;
                }
            } else {
                match = temp.match(TO_VDOM_OpenReg);
                if (match) {
                    tag = match[1];
                    attrs = [];
                    amap = {};
                    compareKey = G_EMPTY;
                    match[2].replace(TO_VDOM_AttrReg, (m, key, value) => {
                        value = value || G_EMPTY;
                        if (key == 'id') {//如果有id优先使用
                            compareKey = value;
                        } else if (key == G_MX_VIEW && value && !compareKey) {
                            //否则如果是组件,则使用组件的路径做为key
                            compareKey = G_ParseUri(value)[G_PATH];
                        } else if (key == 'mxs') {
                            if (!compareKey) compareKey = value;
                        }
                        attrs.push({
                            '@{~v#node.attrs.key}': key,
                            '@{~v#node.attrs.value}': value
                        });
                        amap[key] = value;
                    });
                    current += match[0].length;
                    unary = match[3] || G_Has(TO_VDOM_SELF_CLOSE, tag);
                    if (DEBUG) {
                        if (TO_VDOM_SELF_CLOSE[tag] && !match[3]) {
                            console.error('avoid use tag:' + tag + ' without self close slash. near:' + match[0]);
                        }
                    }
                    em = {
                        '@{~v#node.compare.key}': compareKey,
                        '@{~v#node.tag}': tag,
                        '@{~v#node.attrs}': attrs,
                        '@{~v#node.attrs.map}': amap,
                        '@{~v#node.children}': [],
                        '@{~v#content.start.pos}': current
                    };
                    currentParent['@{~v#node.children}'].push(em);
                    if (unary) {
                        em['@{~v#node.self.close}'] = 1;
                    } else {
                        stack.push(em);
                        if (DEBUG) {
                            stack[stack.length - 1]['@{~v#tag.start.pos}'] = current - match[0].length;
                        }
                        currentParent = em;
                    }
                    chars = 0;
                }
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
                '@{~v#node.tag}': TO_VDOM_TEXT_NODE,
                '@{~v#node.html}': text
            };
            currentParent['@{~v#node.children}'].push(em);
        }

        if (last == current) {
            break;
        }
        if (DEBUG) {
            if (last == current) {
                throw new Error('bad input:' + temp);
            }
            last = current;
        }
    }
    if (DEBUG && stack.length > 1) {
        throw new Error('parsing failure:' + input);
    }
    return currentParent;
};
