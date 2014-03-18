/**
 * @fileOverview view类
 * @author 行列
 * @version 1.1
 */
KISSY.add('magix/view', function(S, Magix, Event, Body, IO) {

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
    View.prototype.fetchTmpl = function(path, fn) {
        var me = this;
        var hasTemplate = 'template' in me;
        if (!hasTemplate) {
            if (Has(Tmpls, path)) {
                fn(Tmpls[path]);
            } else {
                var info = Mods[me.path];
                if (info) {
                    var url = info.uri || info.fullpath;
                    path = url.slice(0, url.indexOf(path) + path.length);
                }
                var file = path + '.html';
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
            fn(me.template);
        }
    };

    View.extend = function(props, ctor, statics) {
        var me = this;
        var BaseView = function() {
            BaseView.superclass.constructor.apply(this, arguments);
            if (ctor) {
                SafeExec(ctor, arguments, this);
            }
        };
        BaseView.extend = me.extend;
        return S.extend(BaseView, me, props, statics);
    };

    return View;
}, {
    requires: ['magix/magix', 'magix/event', 'magix/body', 'ajax']
});