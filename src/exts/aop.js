/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/aop', function(S) {
    var Slice = [].slice;
    return {
        hook: function(host, name, aop) {
            var fn = host[name];
            if (S.isFunction(fn)) {
                host[name] = function() {
                    var args = arguments;
                    if (S.isFunction(aop.before)) {
                        aop.before.apply(host, args);
                    }
                    var ret = fn.apply(host, args);
                    if (S.isFunction(aop.after)) {
                        aop.after.apply(host, [ret].concat(Slice.call(args)));
                    }
                    return ret;
                };
            }
            return {
                reset: function() {
                    if (S.isFunction(fn)) {
                        host[name] = fn;
                    }
                }
            };
        }
    };
});