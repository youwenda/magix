/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var View = require('@coms/form/index');
var $ = require('$');
Magix.applyStyle('@form-addition.css');
module.exports = View.extend({
    tmpl: '@form-validation.html',
    ctor: function() {
        var me = this;
        me.leaveTip('表单有改动，您确认离开吗？', function() {
            return me.data.altered();
        });
    },
    render: function() {
        var me = this;
        me.data.set({
            list: [{
                test: 20
            }, {}],
            platforms: [{}],
            tests: [{
                inner: [{
                    test: 'ok'
                }]
            }]
        }).digest().snapshot();
        me.addValidator({
            'tests.*.inner.*.test': ['required', 'number', function() {
                console.log(arguments);
            }],
            'list.*.test': function(val, key) {
                if (!val) {
                    $('#list_' + key).addClass('validator-error');
                    return false;
                }
            },
            'platforms.*': function(val, key) {
                var result;
                if (!val.platformId) {
                    $('#p_' + key).addClass('validator-error');
                    result = false;
                }

                if (!val.operatorId) {
                    $('#o_' + key).addClass('validator-error');
                    result = false;
                }

                if (!val.version) {
                    $('#v_' + key).addClass('validator-error');
                    result = false;
                }
                return result;
            }
        });
    },
    'add<click>': function() {
        var me = this;
        var list = me.data.get('list');
        list.push({
            test: ''
        });
        me.data.set({
            list: list
        }).digest();
    },
    'remove<click>': function(e) {
        var me = this;
        var list = me.data.get('list');
        list.splice(e.params.index, 1);
        me.data.set({
            list: list
        }).digest();
    },
    'addPlatform<click>': function() {
        var me = this;
        var list = me.data.get('platforms');
        list.push({
            platformId: '',
            operatorId: ''
        });
        me.data.set({
            platforms: list
        }).digest();
    },
    'removePlatform<click>': function(e) {
        var me = this;
        var list = me.data.get('platforms');
        list.splice(e.params.index, 1);
        me.data.set({
            platforms: list
        }).digest();
    },
    'saveSnapshot<click>': function() {
        if (this.isValid()) {
            this.data.snapshot();
        }
    }
});