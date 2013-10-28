/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/helpers/crox', function(S, Magix) {
    var CroxCache = Magix.cache();
    return {
        render: function(tmpl, data) {
            if (!window.Crox) {
                throw new Error('please import Crox');
            }
            var crox = CroxCache.get(tmpl);
            if (!crox) {
                crox = new window.Crox(tmpl);
                crox = crox.genJsFn();
                CroxCache.set(tmpl, crox);
            }
            return crox(data || {});
        }
    };
}, {
    requires: ['magix/magix']
});