/*
    author:xinglie.lkf@taobao.com
    轻量级组件基类，用于一些展示型网站，不想依赖KISSY组件或brix组件时，可以继承该基类写自已的轻量级组件

    examples:

    KISSY.add('app/comtest', function(S, ComsBase) {
        var Base = ComsBase.prototype;
        return ComsBase.extend({
            '.title<click>': function(e) {
                var current = S.one('#' + e.currentId).next('div');
                if (current.css('display') == 'none') {
                    current.css('display', 'block');
                } else {
                    current.css('display', 'none');
                }
            },
            destroy: function() {
                console.log('comtest destroy');
                Base.destroy.call(this);
            }
        }, function(root) {
            this.set('root', root);
        });
    }, {
        requires: ['exts/comsbase']
    });

    使用
        html:

        ...
        <div id="testRoot">
            <div class="title">toggle</div>
            <div style="width:200px;height:200px;background-color:#ccc"></div>
        </div>

        javascript:

        new ComTest('#testRoot');
 */
KISSY.add('exts/comsbase', function(S, View, Body, Magix, VOM) {
    var EvtMethodReg = /([^<>]+)<([\w,]+)>/;
    var CacheObj = {};
    var Encode = encodeURIComponent;
    var Decode = decodeURIComponent;
    var magixRootId = Magix.config('rootId');

    var ViewEventFn = function(e) {
        var params = e.params;
        var c = CacheObj[params.cId];
        if (c) {
            var entity = c.get(params.eId);
            if (entity) {
                var fn = entity[Decode(params.selector) + '<' + params.evt + '>'];
                if (fn) {
                    fn.call(entity, e);
                }
            }
        }
    };
    var Cache = function() {
        var me = this;
        me.$count = 0;
        me.$cache = {};
        me.id = S.guid('ccache');
        CacheObj[me.id] = me;
    };
    Cache.prototype.add = function(entity) {
        var me = this;
        if (!me.$count) {
            var o = {};
            var root = S.one(entity.get('root'));
            for (var p in entity) {
                var ms = p.match(EvtMethodReg);
                if (ms) {
                    var selector = ms[1];
                    var evt = ms[2];
                    var key = '__coms_' + entity.name + '_evts';
                    var val = key + '{eId:' + entity.id + ',evt:' + evt + ',selector:' + Encode(selector) + ',cId:' + me.id + '}';
                    o[key + '<' + evt + '>'] = ViewEventFn;
                    Body.act(evt, false, VOM);
                    if (selector.charAt(0) == '$') {
                        var node = S.one(entity.get(selector.substring(1)));
                        if (node) {
                            node.attr('mx-' + evt, val).attr('mx-owner', magixRootId);
                        }
                    } else if (root) {
                        root.all(selector).attr('mx-' + evt, val).attr('mx-owner', magixRootId);
                    }
                }
            }
            View.mixin(o);
        }
        me.$cache[entity.id] = entity;
        me.$count++;
    };
    Cache.prototype.remove = function(entity) {
        var me = this;
        delete me.$cache[entity.id];
        me.$count--;
        if (!me.$count) {
            for (var p in entity) {
                var ms = p.match(EvtMethodReg);
                if (ms) {
                    var evt = ms[2];
                    var key = '__coms_' + entity.name + '_evts';
                    delete View.prototype[key + '<' + evt + '>'];
                    Body.act(evt, true, VOM);
                }
            }
        }
    };
    Cache.prototype.get = function(id) {
        var c = this.$cache;
        return c[id];
    };

    //组件base
    var Base = function(ops) {
        var me = this;
        me.id = S.guid('coms');
        me.$attrs = {
            root: document.body
        };
        me.set(ops);
    };
    Base.extend = function(props, ctor, statics) {
        var me = this;
        if (!props) props = {};
        if (!props.name) props.name = S.guid('cname');
        var cache = new Cache();
        var Coms = function() {
            var me = this;
            Coms.superclass.constructor.apply(me, arguments);
            if (ctor) {
                ctor.apply(me, arguments);
            }
            cache.add(me);
        };
        Coms.$cache = cache;
        Coms.extend = me.extend;
        return S.extend(Coms, me, props, statics);
    };
    Base.prototype.destroy = function() {
        var me = this;
        var cache = me.constructor.$cache;
        if (cache) {
            cache.remove(me);
        }
    };
    Base.prototype.set = function(key, val) {
        var me = this;
        var attrs = me.$attrs;
        if (S.isObject(key)) {
            for (var p in key) {
                attrs[p] = key[p];
            }
        } else {
            attrs[key] = val;
        }
    };
    Base.prototype.get = function(key) {
        var me = this;
        var attrs = me.$attrs;
        var len = arguments.length;
        if (len) {
            return attrs[key];
        }
        return attrs;
    };
    return Base;
}, {
    requires: ['magix/view', 'magix/body', 'magix/magix', 'magix/vom', 'node']
});