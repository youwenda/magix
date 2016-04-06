/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var FieldsSettings = require('./partials/table-settings-fields');
Magix.applyStyle('@table-settings.css');
var Fields = [{
    id: 'click',
    text: '点击量'
}, {
    id: 'ctr',
    text: '点击率'
}, {
    id: 'uv',
    text: 'UV'
}, {
    id: 'pv',
    text: 'PV'
}, {
    id: 'ip',
    text: 'IP'
}, {
    id: 'iq',
    text: 'IQ'
}, {
    id: 'ic',
    text: 'IC'
}, {
    id: 'click1',
    text: '点击量1'
}, {
    id: 'ctr1',
    text: '点击率1'
}, {
    id: 'uv1',
    text: 'UV1'
}, {
    id: 'pv1',
    text: 'PV1'
}, {
    id: 'ip1',
    text: 'IP1'
}, {
    id: 'iq1',
    text: 'IQ1'
}, {
    id: 'ic1',
    text: 'IC1'
}];
module.exports = Magix.View.extend({
    tmpl: '@table-settings.html',
    ctor: function() {
        var me = this;
        me.$checkedFields = ['ctr', 'uv', 'ic1', 'pv1'];
    },
    render: function() {
        var me = this;
        me.data.set({
            fieldsMap: Magix.toMap(Fields, 'id'),
            checkedFields: me.$checkedFields
        }).digest();
    },
    'showSettings<click>': function(e) {
        var current = e.current;
        var me = this;
        FieldsSettings.show(me, {
            dock: e.params.dock,
            fields: Fields,
            checkedFields: me.$checkedFields,
            ownerNodeId: current.id || (current.id = Magix.guid('ts_')),
            picked: function(fields) {
                me.$checkedFields = fields;
                me.render();
            }
        });
    }
});