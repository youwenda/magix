/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Router = Magix.Router;
Magix.applyStyle('@index.css');
module.exports = Magix.View.extend({
    tmpl: '@index.html',
    render: function() {
        var me = this;
        me.endUpdate();
        me.data.onchanged = function(e) {
            if (e.keys.index && me.$picked) {
                me.$picked({
                    index: me.data.get('index')
                });
            }
        };
    },
    cal: function() {
        var me = this;
        var data = me.data;
        var index = data.get('index');
        var pages = data.get('pages');
        if (index > pages) index = pages;
        var step = data.get('step');
        var middle = step / 2 | 0;
        var start = Math.max(1, index - middle);
        var end = Math.min(pages, start + step - 1);
        start = Math.max(1, end - step + 1);
        var offset;
        if (start <= 2) { //=2 +1  =1  +2
            offset = 3 - start;
            if (end + offset < pages) {
                end += offset;
            }
        }
        if (end + 2 > pages) {
            offset = 2 - (pages - end);
            if ((start - offset) > 1) {
                start -= offset;
            }
        }
        if (start == 3) {
            start -= 1;
        }
        if (end + 2 == pages) {
            end += 1;
        }
        data.set({
            index: index,
            start: start,
            end: end
        }).digest();
    },
    update: function(ops) {
        var me = this;
        var pages = Math.ceil((ops.total || 1) / (ops.size || 20));
        var index = ops.index || 1;
        me.data.set({
            path: Router.parse().path,
            step: ops.step || 7,
            index: index,
            pages: pages
        });
        me.$picked = ops.picked;
        me.cal();
    },
    'toPage<click>': function(e) {
        e.preventDefault();
        var me = this;
        me.data.set({
            index: e.params.page
        });
        me.cal();
    },
    'toPrev<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var idx = data.get('index');
        data.set({
            index: idx - 1
        });
        this.cal();
    },
    'toNext<click>': function(e) {
        e.preventDefault();
        var data = this.data;
        var idx = data.get('index');
        data.set({
            index: idx + 1
        });
        this.cal();
    }
});