/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@tags.css');
module.exports = Magix.View.extend({
    tmpl: '@tags.html',
    render: function() {
        var me = this;
        me.request().all('list', function(err, bag) {
            var selected = [
                'abc',
                'abc123123123123123123123aaabbbdddadfasdfasdfasdfasdf',
                'abc',
                'abc'
            ];
            me.data.digest();
            me.owner.mountVframe('tag1', 'coms/inputag/index', {
                selected: selected,
                list: bag.get('data', [])
            });

            me.owner.mountVframe('tag2', 'coms/inputag/tree', {
                selected: ['1','2'],
                list: bag.get('data', [])
            });
        });
    }
});