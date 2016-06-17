define('app/views/demos/tags',['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-997',".mp-997-m100{margin:100px}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-997-m100\" id=\"tag1\"></div><div class=\"mp-997-m100\" id=\"tag2\"></div>",
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
});