/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var FormView = require('@coms/form/index');
var $ = require('$');
Magix.applyStyle('@benchmark.css');
if (!Date.now) {
    Date.now = function() {
        return new Date().valueOf();
    };
}
module.exports = FormView.extend({
    tmpl: '@benchmark.html',
    render: function() {
        var me = this;
        me.data.set({
            rows: 50,
            cols: 20,
            id: me.id,
            list: []
        }).digest();
    },
    'render<click>': function() {
        var me = this;
        var data = me.data;
        var rows = data.get('rows') | 0;
        var cols = data.get('cols') | 0;
        var list = [];
        for (var i = 0, temp; i < rows; i++) {
            temp = [];
            for (var j = 0; j < cols; j++) {
                temp.push(i + '-' + j + Math.random());
            }
            list.push(temp);
        }

        var now = Date.now();
        data.set({
            list: list
        }).digest();
        $('#time_' + me.id).html(Date.now() - now);
    }
});