/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vdata', function(S, View) {
    var ViewData = function(view) {
        this.$attrs = {};
        this.$view = view;
    };
    var WrapFn = function(owner, fn) {
        return function() {
            return fn.call(this, owner);
        };
    };
    ViewData.prototype = {
        /**
         * 注册模板帮助方法
         * @param {Object} obj 包含方法的对象
         **/
        registerRenderers: function(obj) {
            var me = this;
            for (var group in obj) {
                var groups = obj[group];
                for (var n in groups) {
                    me.set(group + '_' + n, WrapFn(me.$view, groups[n]));
                }
            }
        },
        set: function(key, value) {
            if (S.isString(key)) {
                var wrap = {};
                wrap[key] = value;
                key = wrap;
            }
            var attrs = this.$attrs;
            for (var p in key) {
                attrs[p] = key[p];
            }
        },
        get: function(key) {
            return this.$attrs[key];
        },
        toJSON: function() {
            return this.$attrs;
        }
    };
    return View.mixin({

    }, function() {
        this.data = new ViewData(this);
    });
}, {
    requires: ['magix/view']
});