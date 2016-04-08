var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var fs = require('fs');
var path = require('path');
var sep = path.sep;
var sepRegTmpl = sep.replace(/\\/g, '\\\\');
var configs = {
    excludeTmplFolders: [],
    generateJSFile: function() {
        return '';
    },
    atAttrIf: function(name, tmpl) {
        return tmpl;
    }
};
var md5Cache = {};
var md5ResultKey = '_$%';
var md5 = function(text) {
    if (md5Cache[text]) return md5Cache[text];
    var buf = new Buffer(text);
    var str = buf.toString('binary');
    str = crypto.createHash('md5').update(str).digest('hex');
    var c = 0;
    var rstr = str.substring(c, c + 3);
    while (md5Cache[md5ResultKey + rstr] == 1) { //不同的文件，但生成了相同的key
        c++;
        rstr = str.substring(c, c + 3);
    }
    md5Cache[text] = rstr;
    md5Cache[md5ResultKey + rstr] = 1;
    return rstr;
};
var fileCaches = {};
var readFile = function(file) {
    if (fileCaches.hasOwnProperty(file)) {
        return fileCaches[file];
    }
    var c = fs.readFileSync(file) + '';
    return (fileCaches[file] = c);
};
var fileDependencies = {};
var addFileDepend = function(file, dependFrom, dependTo) {
    var list = fileDependencies[file];
    if (!list) {
        list = fileDependencies[file] = {};
    }
    list[dependFrom] = dependTo;
};
var runFileDepend = function(file) {
    var list = fileDependencies[file];
    if (list) {
        for (var p in list) {
            processFile(p, list[p], true);
        }
    }
};
var processAts = function(fileContent, cssNamesKey) {
    var cssAtNamesKeyReg = /(^|[\s\}])@([a-z\-]+)\s*([\w\-]+)?\{([^\{\}]*)\}/g;
    var cssKeyframesReg = /(^|[\s\}])(@(?:-webkit-)?keyframes)\s+([\w\-]+)/g;
    var contents = [];
    fileContent = fileContent.replace(cssKeyframesReg, function(m, head, keyframe, name) {
        contents.push(name);
        return head + keyframe + ' ' + cssNamesKey + '-' + name;
    });
    fileContent = fileContent.replace(cssAtNamesKeyReg, function(match, head, key, name, content) {
        if (key == 'font-face') {
            var m = content.match(/font-family\s*:\s*(['"])?([\w\-]+)\1/);
            if (m) {
                contents.push(m[2]);
            }
        }
        return match;
    });
    while (contents.length) {
        var t = contents.pop();
        var reg = new RegExp(':\\s*([\'"])?' + t.replace(/[\-#$\^*()+\[\]{}|\\,.?\s]/g, '\\$&') + '\\1', 'g');
        fileContent = fileContent.replace(reg, ':$1' + cssNamesKey + '-' + t + '$1');
    }
    return fileContent;
};

var processCSS = function(nano, content, from, to, moduleId) {
    var cssTmplReg = /(['"])(global|ref|names)?@([^'"]+)\.css(?:\1);?/g;
    var cssNamesMap = {};
    var gCSSNamesMap = {};
    var cssNamesKey;
    var cssNameReg = /(\.)([\w\-]+)(?=[^\{\}]*?\{)/g;
    var addToGlobalCSS = true;
    var cssNameProcessor = function(m, dot, name) {
        var result = dot + (cssNamesMap[name] = cssNamesKey + '-' + name);
        if (addToGlobalCSS) {
            gCSSNamesMap[name] = cssNamesMap[name];
        }
        return result;
    };
    return new Promise(function(resolve) {
        var data = {
            content: content,
            file: from,
            moduleId: moduleId
        };
        if (cssTmplReg.test(content)) {
            var count = 0;
            content = content.replace(cssTmplReg, function(m, q, prefix, name) {
                count++;
                if (name.indexOf('/') >= 0 && name.charAt(0) != '.') {
                    name = resolveAtPath('"@' + name + '"', moduleId).slice(1, -1);
                }
                var file = path.resolve(path.dirname(from) + sep + name + '.css');
                if (fs.existsSync(file)) {
                    addFileDepend(file, from, to);
                    var fileContent = readFile(file);
                    nano.process(fileContent).then(function(r) {
                        fileContent = r.css;
                        var cssId = extractModuleId(file);
                        cssNamesKey = configs.prefix + md5(cssId);
                        if (prefix != 'global') {
                            addToGlobalCSS = prefix != 'names';
                            cssNamesMap = {};
                            fileContent = fileContent.replace(cssNameReg, cssNameProcessor);
                            fileContent = processAts(fileContent, cssNamesKey);
                        }
                        var substr = holder + md5(m) + holder;
                        var replacement;
                        if (prefix == 'names') {
                            replacement = JSON.stringify(cssNamesMap);
                        } else if (prefix == 'ref') {
                            replacement = '';
                        } else {
                            replacement = '\'' + cssNamesKey + '\',' + JSON.stringify(fileContent);
                        }
                        content = content.replace(substr, replacement);
                        count--;
                        if (!count) {
                            data.map = gCSSNamesMap;
                            data.content = content;
                            resolve(data);
                        }
                    }, function(error) {
                        console.log(file, error);
                    });
                    return holder + md5(m) + holder;
                } else {
                    count--;
                    return '\'unfound:' + name + '.css\'';
                }
            });
            if (!count) {
                resolve(data);
            }
        } else {
            resolve(data);
        }
    });
};
var anchor = '-\u001e';
var tmplCommandAnchorReg = /\&\d+\-\u001e/g;
var tmplCommandAnchorRegTest = /\&\d+\-\u001e/;

var storeTmplCommands = function(tmpl, store) {
    var idx = 0;
    return tmpl.replace(configs.tmplCommand, function(match) {
        if (!store[match]) {
            store[match] = '&' + idx + anchor;
            store['&' + idx + anchor] = match;
            idx++;
        }
        return store[match];
    });
};
var tagReg = /<([\w]+)([^>]*?)mx-keys\s*=\s*"([^"]+)"([^>]*?)>/g;
var holder = '-\u001f';
var pureTagReg = /<\w+[^>]*>/g;
var addGuid = function(tmpl, key, refGuidToKeys) {
    var g = 0;
    return tmpl.replace(tagReg, function(match, tag, preAttrs, keys, attrs, tKey) {
        g++;
        tKey = 'mx-guid="x' + key + g + holder + '"';
        refGuidToKeys[tKey] = keys;
        return '<' + tag + preAttrs + tKey + attrs + '>';
    });
};
var subReg = (function() {
    var temp = '<([\\w]+)[^>]*?(mx-guid="x[^"]+")[^>]*?>(#)</\\1>';
    var start = 12;
    while (start--) {
        temp = temp.replace('#', '(?:<\\1[^>]*>#</\\1>|[\\s\\S])*?');
    }
    temp = temp.replace('#', '(?:[\\s\\S]*?)');
    return new RegExp(temp, 'ig');
}());

var classReg = /class=(['"])([^'"]+)(?:\1)/g;
var classNameReg = /(\s|^|\b)([\w\-]+)(?=\s|$|\b)/g;
var attrsNameValueReg = /([^\s]+)=(["'])([\s\S]+?)\2/ig;
var selfCloseTag = /<(\w+)\s+[^>]*?(mx-guid="x[^"]+")[^>]*?\/>/g;
var attrProps = {
    'class': 'className',
    'value': 'value',
    'checked': 'checked',
    '@disabled': 'disabled',
    '@checked': 'checked',
    '@readonly': 'readonly'
};
var fixedAttrPropsTags = {
    'input': 1,
    'select': 1,
    'textarea': 1
};

var commandAnchorRecover = function(tmpl, refTmplCommands) {
    return tmpl.replace(tmplCommandAnchorReg, function(match) {
        var value = refTmplCommands[match];
        return value;
    });
};
var addAttrs = function(tag, tmpl, info, keysReg, refTmplCommands) {
    return tmpl.replace(attrsNameValueReg, function(match, name, quote, content) {
        var hasKey = false,
            aInfo;
        if (tmplCommandAnchorRegTest.test(content)) {
            content = content.replace(tmplCommandAnchorReg, function(match) {
                var value = refTmplCommands[match];
                if (!hasKey) {
                    for (var i = 0; i < keysReg.length; i++) {
                        if (keysReg[i].test(value)) {
                            hasKey = true;
                            break;
                        }
                    }
                }
                return value;
            });
            if (hasKey) {
                var key = attrProps[name];
                aInfo = {
                    n: key || name,
                    v: content
                };
                if (key && fixedAttrPropsTags[tag] == 1) {
                    aInfo.p = true;
                }
                if (name.charAt(0) == '@') {
                    aInfo.v = configs.atAttrIf(name.slice(1), aInfo.v);
                }
                info.attrs.push(aInfo);
            }
        }
        if (name == 'mx-vframe') {
            info.vf = true;
        }
        return match;
    });
};
var expandAtAttr = function(tmpl, refTmplCommands) {
    return tmpl.replace(pureTagReg, function(match) {
        return match.replace(attrsNameValueReg, function(match, name, quote, content) {
            if (name.charAt(0) == '@') {
                content = commandAnchorRecover(content, refTmplCommands);
                match = configs.atAttrIf(name.slice(1), content);
            }
            return match;
        });
    });
};
var buildTmpl = function(tmpl, refGuidToKeys, refTmplCommands, cssNamesMap, g, list, parentOwnKeys) {
    if (!list) {
        list = [];
        g = 0;
    }
    var subs = [];
    tmpl = tmpl.replace(subReg, function(match, tag, guid, content) { //清除子模板后
        var ownKeys = {};
        for (var p in parentOwnKeys) {
            ownKeys[p] = parentOwnKeys[p];
        }
        var tmplInfo = {
            guid: ++g,
            keys: [],
            tmpl: content,
            selector: tag + '[' + guid + ']',
            attrs: []
        };
        var keysReg = [];
        if (parentOwnKeys) {
            tmplInfo.pKeys = Object.keys(parentOwnKeys);
        }
        var datakey = refGuidToKeys[guid];
        var keys = datakey.split(',');
        for (var i = 0, key; i < keys.length; i++) {
            key = keys[i].trim();
            tmplInfo.keys.push(key);
            ownKeys[key] = 1;
            keysReg.push(new RegExp('\\b' + key + '\\b'));
        }
        list.push(tmplInfo);
        var remain;
        if (tag == 'textarea') {
            remain = addAttrs(tag, match, tmplInfo, keysReg, refTmplCommands);
            tmplInfo.attrs.push({
                n: 'value',
                v: commandAnchorRecover(tmplInfo.tmpl, refTmplCommands),
                p: true
            });
            delete tmplInfo.guid;
            delete tmplInfo.tmpl;
        } else {
            remain = match.replace(content, '@' + g + holder);
            remain = addAttrs(tag, remain, tmplInfo, keysReg, refTmplCommands);
            subs.push({
                tmpl: content,
                ownKeys: ownKeys,
                tmplInfo: tmplInfo
            });
        }
        return remain;
    });
    tmpl = tmpl.replace(selfCloseTag, function(match, tag, guid) {
        var tmplInfo = {
            keys: [],
            selector: tag + '[' + guid + ']',
            attrs: []
        };
        var keysReg = [];
        var datakey = refGuidToKeys[guid];
        var keys = datakey.split(',');
        for (var i = 0, key; i < keys.length; i++) {
            key = keys[i].trim();
            tmplInfo.keys.push(key);
            keysReg.push(new RegExp('\\b' + key + '\\b'));
        }
        list.push(tmplInfo);
        return addAttrs(tag, match, tmplInfo, keysReg, refTmplCommands);
    });
    tmpl = expandAtAttr(tmpl, refTmplCommands);
    while (subs.length) {
        var sub = subs.shift();
        var i = buildTmpl(sub.tmpl, refGuidToKeys, refTmplCommands, cssNamesMap, g, list, sub.ownKeys);
        sub.tmplInfo.tmpl = i.tmpl;
    }
    if (cssNamesMap) {
        tmpl = tmpl.replace(classReg, function(m, q, c) {
            return 'class=' + q + c.replace(classNameReg, function(m, h, n) {
                return h + (cssNamesMap[n] ? cssNamesMap[n] : n);
            }) + q;
        });
    }
    tmpl = commandAnchorRecover(tmpl, refTmplCommands);
    return {
        list: list,
        tmpl: tmpl
    };
};


var fileTmplReg = /(\btmpl\s*:\s*)?(['"])@([^'"]+)\.html(?:\2)/g;
var htmlCommentCelanReg = /<!--[\s\S]*?-->/g;
var htmlTagCleanReg = />\s+</g;
var processTmpl = function(result) {
    return new Promise(function(resolve) {
        var cssNamesMap = result.map,
            from = result.file,
            moduleId = result.moduleId;
        var c = result.content.replace(fileTmplReg, function(match, key, quote, name) {
            if (name.indexOf('/') >= 0 && name.charAt(0) != '.') {
                name = resolveAtPath('"@' + name + '"', moduleId).slice(1, -1);
            }
            var file = path.resolve(path.dirname(from) + sep + name + '.html');
            var fileContent = name;
            if (fs.existsSync(file)) {
                fileContent = readFile(file);
                fileContent = fileContent.replace(htmlCommentCelanReg, '').trim();
                if (key) {
                    var guid = md5(from);
                    var refGuidToKeys = {},
                        refTmplCommands = {};
                    fileContent = storeTmplCommands(fileContent, refTmplCommands); //模板命令移除，防止影响分析

                    fileContent = fileContent.replace(htmlTagCleanReg, '><'); //简单压缩
                    fileContent = addGuid(fileContent, guid, refGuidToKeys);
                    var info = buildTmpl(fileContent, refGuidToKeys, refTmplCommands, cssNamesMap);
                    fileContent = JSON.stringify(info.tmpl);
                    if (info.list.length)
                        fileContent += ',\r\n' + 'tmplData:' + JSON.stringify(info.list);
                    return key + fileContent;
                } else {
                    fileContent = JSON.stringify(fileContent);
                    return fileContent;
                }
            }
            return match;
        });
        resolve(c);
    });
};
var copyFile = function(from, to, callback) {
    if (fs.existsSync(from)) {
        var folders = path.dirname(to).split(sep);
        var p = '';
        while (folders.length) {
            p += folders.shift() + sep;
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p);
            }
        }
        var content = readFile(from);
        if (callback) {
            callback(content).then(function(c) {
                fs.writeFileSync(to, c);
            });
        } else {
            fs.writeFileSync(to, content);
        }
    }
};
var walk = function(folder, callback) {
    var files = fs.readdirSync(folder);
    files.forEach(function(file) {
        var p = folder + sep + file;
        var stat = fs.lstatSync(p);
        if (stat.isDirectory()) {
            walk(p, callback);
        } else {
            callback(p);
        }
    });
};
var relativePathReg = /(['"])@([^\/]+)(\S+?)(?=\\?\1)/g;
var resolveAtPath = function(content, from) {
    var folder = from.substring(0, from.lastIndexOf('/') + 1);
    return content.replace(relativePathReg, function(m, q, l, p) {
        if (l.charAt(0) == '.')
            return q + path.normalize(folder + l + p);

        return q + path.relative(folder, l + p);
    });
};
var jsReg = /\.js$/i;
var sepReg = new RegExp(sepRegTmpl, 'g');
var startSlashReg = /^\//;
var extractModuleId = function(file) {
    return file.replace(configs.moduleIdRemoved, '')
        .replace(jsReg, '')
        .replace(sepReg, '/')
        .replace(startSlashReg, '');
};
var processFile = function(from, to, inwatch) { // d:\a\b.js  d:\c\d.js
    from = path.resolve(from);
    to = path.resolve(to);
    delete fileCaches[from];
    for (var i = configs.excludeTmplFolders.length - 1; i >= 0; i--) {
        if (from.indexOf(configs.excludeTmplFolders[i]) >= 0) {
            return copyFile(from, to);
        }
    }
    var depsReg = /(?:var\s+([^=]+)=\s*)?require\(([^\(\)]+)\);?/g;
    var exportsReg = /module\.exports\s*=\s*/;
    var moduleIdReg = /(['"])(@moduleId)\1/g;
    if (jsReg.test(from)) {
        copyFile(from, to, function(content) {
            return new Promise(function(resolve) {
                var deps = [];
                var vars = [];
                var noKeyDeps = [];
                var hasExports;
                var moduleId = extractModuleId(from);
                if (exportsReg.test(content)) {
                    content = content.replace(exportsReg, 'return ');
                    hasExports = true;
                }
                content = content.replace(depsReg, function(match, key, str) {
                    str = resolveAtPath(str, moduleId);
                    if (key) {
                        vars.push(key);
                        deps.push(str);
                    } else {
                        noKeyDeps.push(str);
                    }
                    return configs.removeRequire ? '' : match;
                });
                deps = deps.concat(noKeyDeps);
                processCSS(configs.nano, content, from, to, moduleId).then(processTmpl).then(function(content) {
                    content = content.replace(moduleIdReg, '$1' + moduleId + '$1');
                    content = resolveAtPath(content, moduleId);
                    var temp = {
                        moduleId: moduleId,
                        content: content,
                        requires: deps,
                        vars: vars,
                        hasExports: hasExports
                    };
                    var tmpl = configs.generateJSFile(temp);
                    resolve(tmpl);
                });
            });
        });
    } else {
        var extname = path.extname(from);
        if (configs.onlyAllows[extname]) {
            if (inwatch && fileDependencies[from]) { //只更新依赖项
                runFileDepend(from);
                return;
            }
            if (extname == '.html' || extname == '.css') {
                var name = path.basename(from, extname);
                var ns = name.split('-');
                var found;
                while (ns.length) {
                    var tname = ns.join('-');
                    var jsf = path.dirname(from) + sep + tname + '.js';
                    ns.pop();
                    if (fs.existsSync(jsf)) {
                        found = true;
                        var aimFile = path.dirname(to) + sep + path.basename(jsf);
                        addFileDepend(from, jsf, aimFile);
                        if (inwatch) {
                            processFile(jsf, aimFile, inwatch);
                        }
                        break;
                    }
                }
                if (!found) {
                    copyFile(from, to);
                }
            } else {
                copyFile(from, to);
            }
        }
    }
};
module.exports = {
    config: function(config) {
        for (var p in config) {
            configs[p] = config[p];
        }
        configs.excludeTmplFolders = configs.excludeTmplFolders.map(function(str) {
            return path.resolve(str);
        });
    },
    prefix: 'unset',
    removeFile: function(file) {
        delete fileCaches[file];
        delete fileDependencies[file];
    },
    processFile: processFile,
    walk: walk,
    copyFile: copyFile
};