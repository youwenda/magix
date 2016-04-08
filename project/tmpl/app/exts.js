/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Service = require('./services/service');
Magix.applyStyle('global@exts-global.css');
Magix.View.merge({
    ctor: function() {
        this.$locker = {};
        this.on('rendercall', function() {
            this.$locker = {};
        });
    },
    request: function(key) {
        var me = this;
        var s = new Service();
        return me.capture(key || s.id, s, true);
    },
    lock: function(key, fn) {
        var locker = this.$locker;
        if (!Magix.has(locker)) {
            locker[key] = 1;
            fn();
        }
    },
    unlock: function(key) {
        var locker = this.$locker;
        delete locker[key];
    }
});