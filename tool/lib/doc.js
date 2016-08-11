module.exports = function(content) {
    var idCounter = 0;
    var resolveComments = function(c) {
        var cs = c.split(/\r\n|\r|\n/);
        var o = {
                //isa: 'OBJECT'
                id: 'm' + (++idCounter)
            },
            example;
        var processor = function(m, value) {
            var name;
            if (value.trim().charAt(0) == '@') {
                value = value.trim();
                var space = value.indexOf(' ');
                name = space >= 0 ? value.substring(1, space) : value.substring(1);
                value = space >= 0 ? value.substring(space + 1) : '';
            }
            if (!name && value) {
                if (example) {
                    o.example = (o.example ? o.example + '\r\n' : '') + value;
                } else {
                    o.desc = (o.desc ? o.desc + '\r\n' : '') + value;
                }
            }
            if (name == 'name') {
                o.name = value.trim();
            }
            if (name == 'example') {
                example = 1;
                o.example = (o.example ? o.example + '\r\n' : '') + value;
            }
            if (name == 'borrows') {
                if (!o.inherits) o.inherits = [];
                value.replace(/([\s\S]+) as ([\s\S]+)/, function(m, a, b) {
                    o.inherits.push({
                        alias: a,
                        as: b
                    });
                });
            }
            if (name == 'namespace') {
                o.isNamespace = true;
            }
            if (name == 'constructor') {
                o.isa = 'CONSTRUCTOR';
                o.isClass = true;
            }
            if (name == 'property') {
                if (!o.properties) o.properties = [];
                value.replace(/\{([^\}]+)\}\s+([\w\.\$]+)\s*([\S\s]*)/, function(m, type, param, desc) {
                    o.properties.push({
                        type: type,
                        desc: desc,
                        name: param,
                        id: 'm' + (++idCounter)
                    });
                });
            }
            if (name == 'param') {
                if (!o.params) o.params = [];
                var nameReg = /\s*\[([^\[\]]+)\]\s*/;
                value.replace(/\{([^\}]+)\}\s+([\w\.\[\]]+)\s*([\S\s]*)/, function(m, type, param, desc) {
                    var ms = param.match(nameReg);
                    var item = {
                        type: type,
                        desc: desc,
                        name: param
                    };
                    if (ms) {
                        item.isOptional = true;
                        item.name = ms[1];
                    }
                    o.params.push(item);
                });
            }
            if (name == 'event') {
                o.isEvent = true;
                if (o.name.indexOf('#') == -1 && o.name.indexOf('.prototype.') == -1) o.isStatic = true;
                o.name = o.name.replace(/^[\w\.]+[\.#]/, '');
            }
            if (name == 'return' || name == 'returns') {
                o.returns = value;
            }
            if (name == 'beta') {
                o.isOptional = true;
            }
            if (name == 'module') {
                o.needModule = value.trim();
            }
            if (name == 'lends') {
                o.lends = value.trim();
            }
        };
        for (var i = 0; i < cs.length; i++) {
            var line = cs[i];
            line.replace(/\s*\*?([\s\S]*)/, processor);
        }
        if (o.example) o.example = o.example.trim();
        return o;
    };
    var block = function(str) {
        var flags = [];
        var index = 0;
        var blocks = [];
        var next = function() {
            return str.charAt(index + 1);
        };
        var last = function() {
            var i = 1;
            while (!str.charAt(index - i).trim()) i++;
            return str.charAt(index - i);
        };
        var skipUntil = function(a, whole) {
            while (true) {
                if (whole) {
                    var s = str.substring(index, index + a.length);
                    if (s == a) {
                        index += a.length;
                        break;
                    }
                    index++;
                } else {
                    if (a.indexOf(str.charAt(++index)) >= 0 && last() != '\\') break;
                }
            }
        };
        while (index < str.length) {
            var c = str.charAt(index);
            if (c == '{') {
                flags.push({
                    start: index
                });
            } else if (c == '}') {
                var o = flags.pop();
                if (o) {
                    var s = str.substring(o.start, index + 1);
                    if (s.indexOf('/**') > -1) {
                        blocks.push(s);
                    }
                }
            }
            if (c == '/') { //注释与正则相关
                if (next() == '/') skipUntil('\r\n'); //单行注释
                else if (next() == '*') skipUntil('*/', true); //多行注释
                else if (last() == '=') {
                    var lastIndex = index;
                    skipUntil('/'); //上一个字符是＝号，则是正则
                    index++;
                    console.log('skip regex', str.substring(lastIndex, index));
                }

            }
            index++;
        }
        blocks.pop(); //弹出最外层的define
        return blocks;
    };
    var remain = function(blocks) {
        var remain = content;
        for (var i = blocks.length - 1; i >= 0; i--) {
            remain = remain.replace(blocks[i], '');
        }
        return remain;
    };
    var lends = function(o, name, block) {
        var reg = /\/\*\*([\s\S]+?)\*\/([^*\/]+?)[=:]/g;
        var isStatic = !/(?:#|\.prorotype)$/.test(name);
        var sname = name.replace(/(?:#|\.prototype)$/, '');
        block.replace(reg, function(m, c, n) {
            if (!o.methods) o.methods = [];
            c = resolveComments(c);
            c.memberOf = sname;
            c.name = n.replace(/\s|(?:[\s\S]*?\.)/g, '');
            if (isStatic && o.isa == 'CONSTRUCTOR') c.isStatic = true;
            o.methods.push(c);
        });
    };
    var root = function(remain) {
        var o = {};
        var reg = /\/\*\*([\s\S]+?)\*\//g;
        var ls = [];
        remain.replace(reg, function(m, c) {
            c = resolveComments(c); //
            if (c.name) {
                o[c.name] = c;
            }
            if (c.lends) { //简单修正最外层的
                var idx = remain.indexOf(m);
                var equal = remain.indexOf('*/', idx) + 2;
                equal = remain.indexOf('=', equal) + 1;
                ls.push({
                    name: c.lends,
                    sname: c.lends.replace(/(?:#|\.prototype)$/, ''),
                    block: remain.substring(idx, equal)
                });
            }
        });
        for (var i = 0, l; i < ls.length; i++) {
            l = ls[i];
            if (o[l.sname]) {
                lends(o[l.sname], l.name, l.block);
            }
        }
        return o;
    };
    var attach = function(root, blocks) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var m = block.match(/@lends\s+([\w#]+)/);
            var name = m && m[1];
            if (name) {
                var sname = name.replace(/(?:#|\.prototype)$/, '');
                block = block.replace(/\/\*[\s\S]*?@lends[\s\S]*?\*\//, '');
                var o = root[sname];
                block = block.replace(/\/\*\*([\s\S]+?)\*\//g, function(m, c) {
                    c = resolveComments(c);
                    c.memberOf = sname;
                    if (c.isEvent) {
                        if (!o.events) o.events = [];
                        o.events.push(c);
                        delete c.isEvent;
                        return '';
                    }
                    return m;
                });
                lends(o, name, block);
            }

        }
    };
    var cloneMethod = function(o) {
        var r = {};
        for (var p in o) {
            r[p] = o[p];
        }
        return r;
    };
    var borrows = function(root) {
        for (var p in root) {
            var one = root[p];
            if (one.inherits) {
                for (var i = 0; i < one.inherits.length; i++) {
                    var ih = one.inherits[i];
                    var ts = ih.alias.split('.');
                    var name = ts[0];
                    var m = ts[1];
                    var target = root[name];
                    if (target) {
                        var mds = target.methods;
                        for (var j = mds.length - 1; j >= 0; j--) {
                            var md = mds[j];
                            if (md.name == m) {
                                md = cloneMethod(md);
                                md.id = 'm' + (++idCounter);
                                if (ih.as.indexOf('#') !== 0) md.isStatic = true;
                                if (!one.methods) one.methods = [];
                                one.methods.push(md);
                            }
                        }
                    }
                }
            }
        }
    };
    var bs = block(content); //根据大括号分区块
    var rm = remain(bs); //分块后遗留的代码，主入口
    var main = root(rm); //全局根对象或类
    attach(main, bs); //处理借给
    borrows(main); //处理借到
    return main;
};