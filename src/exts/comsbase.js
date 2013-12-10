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
    var Mix = Magix.mix;
    var EvtMethodReg = /([^<>]+)<([\w]+)>/;

    var Caches = {
        counter: {},
        entities: {}
    };
    var Encode = encodeURIComponent;
    var Decode = decodeURIComponent;
    var MagixRootId = Magix.config('rootId');

    /**
     * 扩展到view原型上的方法，辅助组件事件的调整
     */
    var ViewEventFn = function(e) {
        var params = e.params;
        var entity = Caches.entities[params.eId];

        if (entity) {
            var fn = entity[Decode(params.src)];
            if (fn) {
                fn.call(entity, e);
            }
        }
    };
    /**
     * 扩展方法到view的原型上
     * @param {Base} entity  组件对象
     * @param {Strig} name    组件名称
     * @param {Boolean} _delete 是否删除，内部调用时使用
     */
    var AttachView = function(entity, name, _delete) {
        var o = {};
        for (var p in entity) {
            var ms = p.match(EvtMethodReg);
            if (ms) {
                var evt = ms[2];
                var key = '__coms_' + name + '_evts';
                if (_delete) {
                    delete View.prototype[key + '<' + evt + '>'];
                } else {
                    o[key + '<' + evt + '>'] = ViewEventFn;
                }
                Body.act(evt, _delete, VOM);
            }
        }
        if (!_delete) {
            View.mixin(o);
        }
    };
    /**
     * 从view原型上删除事件辅助方法
     * @param {Base} entity  组件对象
     * @param {Strig} name    组件名称
     */
    var DetachView = function(entity, name) {
        AttachView(entity, name, true);
    };

    //组件base
    var Base = function(ops) {
        var me = this;
        me.id = S.guid('com');
        Caches.entities[me.id] = me;
        me.$attrs = {
            root: document.body
        };
        me.set(ops);
    };
    Base.extend = function(props, ctor, statics) {
        var me = this;
        var Coms = function() {
            var me = this;
            var name = Coms.xname;
            var counter = Caches.counter;
            Coms.superclass.constructor.apply(me, arguments);
            if (ctor) {
                ctor.apply(me, arguments);
            }
            if (!counter[name]) {
                counter[name] = 0;
                AttachView(me, name);
            }
            counter[name]++;
            me.attachAttrs();
        };
        Coms.xname = S.guid('cname');
        Coms.extend = me.extend;
        return S.extend(Coms, me, props, statics);
    };
    Mix(Base.prototype, {
        /**
         * 设置属性
         * @param {String|Object} key 对象或字符串
         * @param {Object} val 任意值
         */
        set: function(key, val) {
            var me = this;
            var attrs = me.$attrs;
            if (S.isObject(key)) {
                for (var p in key) {
                    attrs[p] = key[p];
                }
            } else {
                attrs[key] = val;
            }
        },
        /**
         * 获取属性
         * @param  {String} key 根据key获取对应的属性值
         * @return {Object}
         */
        get: function(key) {
            var me = this;
            var attrs = me.$attrs;
            var len = arguments.length;
            if (len) {
                return attrs[key];
            }
            return attrs;
        },
        /**
         * 向DOM添加属性
         * @param  {String} zone    DOM区域id
         * @param  {Boolean} _delete 是否是删除添加的属性
         */
        attachAttrs: function(zone, _delete) {
            var me = this;
            if (!zone) {
                zone = me.get('root');
            }
            var root = S.one(zone);
            var name = me.constructor.xname;
            var action = _delete ? 'removeAttr' : 'attr';
            if (root) {
                if (!_delete) {
                    root.all('[mx-ei]').removeAttr('mx-ei');
                }
                for (var p in me) {
                    var ms = p.match(EvtMethodReg);
                    if (ms) {
                        var selector = ms[1];
                        var evt = ms[2];
                        var key = '__coms_' + name + '_evts';
                        var val = key + '{eId:' + me.id + ',src:' + Encode(p) + '}';

                        if (selector.charAt(0) == '$') {
                            selector = me.get(selector.substring(1));
                        }
                        root.all(selector)[action]('mx-' + evt, val)[action]('mx-owner', MagixRootId);
                    }
                }
            }
        },
        /**
         * 删除添加的属性
         * @param  {String} zone    DOM区域id
         */
        detachAttrs: function(zone) {
            this.attachAttrs(zone, true);
        },
        /**
         * 销毁组件
         */
        destroy: function() {
            var me = this;
            var name = me.constructor.xname;
            var counter = Caches.counter[name];
            delete Caches.entities[me.id];
            if (counter > 0) {
                Caches.counter[name]--;
                if (counter == 1) {
                    DetachView(me, name);
                }
            }
        }
    });
    return Base;
}, {
    requires: ['magix/view', 'magix/body', 'magix/magix', 'magix/vom', 'node']
});