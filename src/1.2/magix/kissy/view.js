/**
 * @fileOverview view类
 * @author 行列
 * @version 1.2
 */
KISSY.add('magix/view', function(S, Magix, Event, Router, IO) {
    var Delegates = {
        mouseenter: 2,
        mouseleave: 2
    };
    var DOMEventLibBind = function(node, type, cb, remove, scope, direct) {
        S.use('event', function(S, SE) {
            var flag = Delegates[type];
            if (!direct && flag == 2) {
                flag = (remove ? 'un' : EMPTY) + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            } else {
                flag = remove ? 'detach' : ON;
                SE[flag](node, type, cb, scope);
            }
        });
    };
    eval(Magix.include('../tmpl/view'));
    var Suffix = '?t=' + S.now();
    var Mods = S.Env.mods;

    /*var ProcessObject = function(props, proto, enterObject) {
        for (var p in proto) {
            if (S.isObject(proto[p])) {
                if (!Has(props, p)) props[p] = {};
                ProcessObject(props[p], proto[p], 1);
            } else if (enterObject) {
                props[p] = proto[p];
            }
        }
    };*/

    var Tmpls = {}, Locker = {};
    VProto.fetchTmpl = function(path, fn) {
        var me = this;
        var hasTemplate = 'tmpl' in me;
        if (!hasTemplate) {
            if (Has(Tmpls, path)) {
                fn(Tmpls[path]);
            } else {
                var info = Mods[path];
                var url;
                if (info) {
                    url = info.uri || info.fullpath;
                    url = url.slice(0, url.indexOf(path) + path.length);
                }
                var file = url + '.html';
                var l = Locker[file];
                var onload = function(tmpl) {
                    fn(Tmpls[path] = tmpl);
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = Locker[file] = [onload];
                    IO({
                        url: file + Suffix,
                        complete: function(data, status) {
                            SafeExec(l, data || status);
                            delete Locker[file];
                        }
                    });
                }
            }
        } else {
            fn(me.tmpl);
        }
    };
    View.extend = function(props, statics, ctor) {
        var me = this;
        if (Magix._f(statics)) {
            ctor = statics;
            statics = null;
        }
        var BaseView = function(a) {
            me.call(this, a);
            if (ctor) {
                ctor.call(this, a);
            }
        };
        BaseView.extend = me.extend;
        return S.extend(BaseView, me, props, statics);
    };

    return View;
}, {
    requires: ['magix/magix', 'magix/event', 'magix/router', 'io']
});