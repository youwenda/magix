/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add('magix/magix', function(S) {
    var Slice = [].slice;
    var Include = function(path) {
        var magixPackages = S.Config.packages.magix;
        var mPath = magixPackages.base || magixPackages.path || magixPackages.uri;

        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        console.log(url);
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    eval(Include('../tmpl/magix'));
    return Mix(Magix, {
        include: Include,
        use: function(name, fn) {
            S.use(name && (name + EMPTY), function(S) {
                if (fn) {
                    fn.apply(S, Slice.call(arguments, 1));
                }
            });
        },
        _a: S.isArray,
        _f: S.isFunction,
        _o: S.isObject,
        //isRegExp: S.isRegExp,
        _s: S.isString,
        _n: S.isNumber
    });
});