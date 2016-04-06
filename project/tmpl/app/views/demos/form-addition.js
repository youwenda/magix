/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var View = require('@coms/form/index');
Magix.applyStyle('@form-addition.css');
module.exports = View.extend({
    tmpl: '@form-addition.html',
    ctor: function() {
        var me = this;
        me.leaveTip('表单有改动，您确认离开吗？', function() {
            return me.data.altered();
        });
        //me.render();
    },
    render: function() {
        var me = this;
        me.data.set({
            list: [{}],
            platforms: [],
        }).digest().snapshot();
    },
    'add<click>': function() {
        var me = this;
        var list = me.data.get('list');
        list.push({
            value: 20,
            platform: {
                id: 1
            }
        });
        me.data.digest();
    },
    'remove<click>': function(e) {
        var me = this;
        var list = me.data.get('list');
        list.splice(e.params.index, 1);
        me.data.digest();
    },
    'addPlatform<click>': function() {
        var me = this;
        var list = me.data.get('platforms');
        list.push({
            platformId: '',
            operatorId: ''
        });
        me.data.digest();
    },
    'removePlatform<click>': function(e) {
        var me = this;
        var list = me.data.get('platforms');
        list.splice(e.params.index, 1);
        me.data.digest();
    },
    'saveSnapshot<click>': function() {
        console.log(this.data.get());
        this.data.snapshot();
    }
});