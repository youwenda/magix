/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Form = require('@coms/form/index');
Magix.applyStyle('@view-subs.css');
var Types = [{
    id: 'banner',
    text: '横幅'
}, {
    id: 'float',
    text: '浮动'
}, {
    id: 'popup',
    text: '浮窗'
}];
module.exports = Form.extend({
    tmpl: '@view-subs.html',
    render: function() {
        var me = this;
        var creative = {
            name: 'test',
            type: 'float',
            stayTime: 100,
            delayTime: 200,
            others: []
        };
        me.data.set({
            creative: creative,
            id: me.id
        }).digest();
        me.dropdown('types_' + me.id, {
            list: Types,
            width: 210,
            selected: creative.type,
            picked: function(e) {
                me.renderByType(e.id);
            }
        });
        me.share('listData', [1, 2, 3, 4, 5]);
        me.renderByType(creative.type);
    },
    renderByType: function(type) {
        var me = this;
        var vf = Magix.Vframe.get('type_vf_' + me.id);
        vf.mountView('@./partials/view-subs-' + type, {
            creative: me.data.get('creative')
        });
    },
    'save<click>': function() {
        console.time('save');
        console.log(this.isSubViewValid());
        console.log(this.data.get('creative'));
        console.timeEnd('save');
    }
});