/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
module.exports = Magix.View.extend({
    tmpl: '@tree.html',
    render: function() {
        var me = this;
        me.data.set({
            a: Magix.guid(),
            b: Magix.guid(),
            checked: !me.data.get('checked'),
            pMap: {
                a: 1,
                c: 1
            },
            height: 10 + me.data.get('height') || 0,
            permissions: ['a', 'b', 'c', 'd']
        }).digest();
    },
    'change<click>': function() {
        this.render();
    },
    'changeMap<click>': function() {
        var data = this.data;
        var r = function() {
            return Math.random() < 0.5;
        };
        var pMap = {
            a: r(),
            b: r(),
            c: r(),
            d: r()
        };
        data.set({
            pMap: pMap
        }).digest();
    }
});