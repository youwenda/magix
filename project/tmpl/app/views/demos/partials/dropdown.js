/*
    author:xinglie.lkf@taobao.com
 */
var View = require('@coms/dropdown/index');
var $ = require('$');
var Platforms = [{
    id: '',
    text: '请选择平台'
}, {
    id: 'ios',
    text: 'iOS版本'
}, {
    id: 'android',
    text: 'Android版本'
}, {
    id: 'mac',
    text: 'Mac版本'
}, {
    id: 'window',
    text: 'Window版本'
}];
var Operators = [{
    id:'',
    text:'请选择操作'
},{
    id: '<',
    text: '小于'
}, {
    id: '<=',
    text: '小于等于'
}, {
    id: '=',
    text: '等于'
}, {
    id: '>',
    text: '大于'
}, {
    id: '>=',
    text: '大于等于'
}];
module.exports = View.extend({
    ctor: function(extra) {
        var me = this;
        me.$selected = extra.selected;
        me.$type = extra.type;
    },
    render: function() {
        var me = this;
        me.update({
            list: me.$type == 'operator' ? Operators : Platforms,
            selected: me.$selected,
            picked: function(e) {
                $('#' + me.id).val(e.id).trigger('change');
            }
        });
    }
});