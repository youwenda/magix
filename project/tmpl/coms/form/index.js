/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var NumReg = /^\d*$/; //允许空字符串
var Rules = {
    required: function(val) {
        return $.trim(val);
    },
    number: function(val) {
        return NumReg.test(val);
    }
};
var TestRules = function(fn, data, key, ref) {
    if ($.isFunction(fn)) {
        if (fn(data, key) === false) {
            ref.failed = true;
        }
    } else {
        if (!$.isArray(fn)) fn = [fn];
        var processor = fn[fn.length - 1];
        for (var i = 0; i < fn.length - 1; i++) {
            var rule = Rules[fn[i]];
            if (rule && !rule(data)) {
                ref.failed = true;
                processor(fn[i], key);
                break;
            }
        }
    }
};
var WalkRules = function(data, parts, fn, key, ref) {
    if (!parts.length) {
        TestRules(fn, data, key, ref);
        return;
    }
    var all;
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part == '*') {
            all = true;
            break;
        } else {
            data = data[part];
        }
    }
    if (all) {
        if ($.isArray(data)) {
            for (var j = 0; j < data.length; j++) {
                WalkRules(data[j], parts.slice(i + 1), fn, j, ref);
            }
        } else {
            for (var p in data) {
                WalkRules(data[p], parts.slice(i + 1), fn, p, ref);
            }
        }
    } else {
        TestRules(fn, data, key, ref);
    }
};
module.exports = Magix.View.extend({
    addValidator: function(rules) {
        var me = this;
        me.$rules = rules;
    },
    isValid: function() {
        var me = this;
        var rules = me.$rules;
        var json = me.data.get();
        var ref = {
            failed: false
        };
        for (var p in rules) {
            var parts = p.split('.');
            var data = json,
                fn = rules[p];
            WalkRules(data, parts, fn, p, ref);
        }
        return !ref.failed;
    },
    isSubViewValid: function() {
        var me = this;
        var children = me.owner.children();
        for (var i = 0; i < children.length; i++) {
            var d = children[i].invoke('isValid');
            if (d === false) {
                return false;
            }
        }
        return true;
    },
    'setValue<change>': function(e) {
        var params = e.params;
        var me = this;
        var object = me.data.get();
        var ps = params.path.split('.');
        var key = ps.pop(),
            temp;
        while (object && ps.length) {
            temp = ps.shift();
            object = object[temp];
        }
        var value = $(e.current).val();
        if (object) {
            object[key] = value;
        } else {
            console.warn(params.path);
        }
    }
});