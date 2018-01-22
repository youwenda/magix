let revisableReg = /@\{[a-zA-Z\.0-9\-\~#]+\}/g;
let vkeys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let variable = count => { //压缩变量
    let result = '',
        temp;
    do {
        temp = count % vkeys.length;
        result = vkeys.charAt(temp) + result;
        count = (count - temp) / vkeys.length;
    }
    while (count);
    return result;
};
let counter = Object.create(null);
let cache = Object.create(null);
let userMap = Object.create(null);
let userCache = Object.create(null);
let md5 = (text, key, prefix) => {
    if (userCache[text]) {
        return userCache[text];
    }
    if (!counter[key]) {
        counter[key] = 0;
    }
    if (!cache[key]) {
        cache[key] = Object.create(null);
    }
    let rstr = cache[key][text];
    if (rstr) {
        return rstr;
    }
    let c = counter[key];
    do {
        rstr = variable(c++);
        if (prefix) {
            rstr = prefix + rstr;
        }
    } while (userMap[rstr]);
    counter[key] = c;
    cache[key][text] = rstr;
    return rstr;
};
module.exports = {
    map(m) {
        for (let p in m) {
            userCache[p] = m[p];
            userMap[m[p]] = 1;
        }
    },
    process(tmpl) {
        tmpl = tmpl.replace(revisableReg, m => {
            return md5(m, m.split('#')[0], '$');
        });
        //console.log(cache,userCache);
        return tmpl;
    }
};