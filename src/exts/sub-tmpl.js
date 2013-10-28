/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/sub-tmpl', function(S, View) {
    var SubTmplReg = /\{{2}#magix-tmpl-(\w+)\}{2}([\s\S]*?)\{{2}\/magix-tmpl-\1\}{2}/g;
    var IncludeReg = /\{{2}magix-include-(\w+)\}{2}/g;
    return View.mixin({
        getSubTmpl: function(name) {
            var me = this;
            var subs = me.$subTmpls;
            if (subs) {
                return subs[name] || '';
            }
            return '';
        }
    }, function() {
        var me = this;
        me.$subTmpls = {};
        me.on('inited', function() {
            me.template = me.template.replace(SubTmplReg, function(match) {
                match.replace(SubTmplReg, function(m, name, content) {
                    me.$subTmpls[name] = content;
                });
                return '';
            }).replace(IncludeReg, function(match, name) {
                return me.$subTmpls[name] || '';
            });
        });
    });
}, {
    requires: ['magix/view']
});