/*
    author:xinglie.lkf@taobao.com
    extend:

        parent:{{@magix-tmpl-xxx}}
        sub:{{#magix-tmpl-xxx}}content{{/magix-tmpl-xxx}}

        parent:{{@magix-tmpl-all}}
        sub:content

    subtmpl:

        {{@magix-inner-xxx}}

        {{#magix-inner-xxx}}
        content
        {{/magix-inner-xxx}}
 */
KISSY.add('exts/vtmpl', function(S, View) {
    var Base = View.prototype;
    var Load = Base.load;
    var EmptyObject = {};
    var Mods = S.Env.mods;

    var DefaultContent = '{{@magix-tmpl-all}}';
    var TmplReg = /\{\{#magix-tmpl-(\w+)\}\}([\s\S]*?)\{\{\/magix-tmpl-\1\}\}/g;
    var TmplIncludeReg = /\{\{@magix-tmpl-(\w+)\}\}/g;

    var InnerTmplReg = /\{\{#magix-inner-(\w+)\}\}([\s\S]*?)\{\{\/magix-inner-\1\}\}/g;
    var InnerTmplIncludeReg = /\{\{@magix-inner-(\w+)\}\}/g;

    var FindExtendTmpls = function(entity) {
        var proto = entity.constructor.prototype;
        var result = [{
            path: entity.path,
            ctx: proto,
            ownTmpl: proto.hasOwnProperty('template')
        }];
        while (proto) {
            var tmpl = proto.extendTmpl;
            var parent = proto.constructor.superclass;
            if (tmpl && parent) {
                var ctor = parent.constructor;
                if (!ctor.path) {
                    for (var p in Mods) {
                        if (Mods[p].value == ctor || Mods[p].exports == ctor) {
                            ctor.path = p;
                            break;
                        }
                    }
                }
                result.push({
                    path: ctor.path,
                    ctx: parent,
                    ownTmpl: parent.hasOwnProperty('template')
                });
            }
            proto = parent;
        }
        return result;
    };
    var FetchTmpls = function(tmpls, done, preTmpl) {
        var item = tmpls.pop();
        if (item) {
            item.ctx.fetchTmpl.call(item.ownTmpl ? item.ctx : EmptyObject, item.path, function(tmpl) {
                var subTmpls = {};
                tmpl.replace(TmplReg, function(match, name, content) {
                    subTmpls[name] = content;
                });
                FetchTmpls(tmpls, done, preTmpl.replace(TmplIncludeReg, function(match, name) {
                    if (name == 'all') {
                        return tmpl;
                    }
                    return subTmpls[name] || '';
                }));
            });
        } else {
            done(preTmpl);
        }
    };
    return View.mixin({
        load: function() {
            var me = this;
            var args = arguments;
            var sign = me.sign;
            FetchTmpls(FindExtendTmpls(me), function(tmpl) {
                if (sign == me.sign) {
                    me.template = me.hasTmpl ? tmpl : me.wrapMxEvent(tmpl);
                    Load.apply(me, args);
                }
            }, DefaultContent);
        },
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
            me.template = me.template.replace(InnerTmplReg, function(match) {
                match.replace(InnerTmplReg, function(m, name, content) {
                    me.$subTmpls[name] = content;
                });
                return '';
            }).replace(InnerTmplIncludeReg, function(match, name) {
                return me.$subTmpls[name] || '';
            });
        });
    });
}, {
    requires: ['magix/view']
});