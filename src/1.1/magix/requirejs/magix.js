/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define('magix/magix', function() {

    var Include = function(path, mxext) {
        var mPath = require.s.contexts._.config.paths[mxext ? 'mxext' : 'magix'];
        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    eval(Include('../tmpl/magix'));
    var ToString = Object.prototype.toString;

    return Mix(Magix, {
        include: Include,
        use: function(name, fn) {
            if (!$.isArray(name)) {
                name = [name];
            }
            if (name) {
                require(name, fn);
            } else if (fn) {
                fn();
            }
        },
        _a: $.isArray,
        _f: $.isFunction,
        _o: function(o) {
            return ToString.call(o) == '[object Object]';
        },
        _s: function(str) {
            return ToString.call(str) == '[object String]';
        },
        _n: function(v) {
            return ToString.call(v) == '[object Number]';
        },
        /*isRegExp: function(r) {
            return ToString.call(r) == '[object RegExp]';
        },*/
        extend: function(ctor, base, props, statics) {
            ctor.superclass = base.prototype;
            base.prototype.constructor = base;
            var T = function() {};
            T.prototype = base.prototype;
            ctor.prototype = new T();
            Magix.mix(ctor.prototype, props);
            Magix.mix(ctor, statics);
            ctor.prototype.constructor = ctor;
            return ctor;
        }
    });
});