define('app/views/demos/table-settings',['magix','./partials/table-settings-fields'],function(require){
/*Magix ,FieldsSettings */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var FieldsSettings = require('./partials/table-settings-fields');
Magix.applyStyle('mp-197',".mp-197-wrapper{margin:20px}.mp-197-fr{float:right}");
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
return Magix.View.extend({
    tmpl: "<div class=\"mp-197-wrapper\"><button class=\"btn\" mx-click=\"showSettings()\">设置</button> <button class=\"btn mp-197-fr\" mx-click=\"showSettings({dock:'right'})\">设置</button><table class=\"table\"><thead><tr mx-guid=\"x6dd1-\u001f\">@1-\u001f</tr></thead><tbody mx-guid=\"x6dd2-\u001f\">@2-\u001f</tbody><tfoot><tr><td mx-guid=\"x6dd3-\u001f\" colspan=\"<%=checkedFields.length+1%>\">xxx</td></tr></tfoot></table></div>",
tmplData:[{"guid":1,"keys":["checkedFields"],"tmpl":"<th>名称</th><%for(var i=0;i<checkedFields.length;i++){%><th><%=fieldsMap[checkedFields[i]].text%></th><%}%>","selector":"tr[mx-guid=\"x6dd1-\u001f\"]"},{"guid":2,"keys":["checkedFields"],"tmpl":"<%for(var i=0;i<200;i++){%><tr><td>测试<%=Math.random()%></td><%for(var j=0;j<checkedFields.length;j++){%><td><%=fieldsMap[checkedFields[j]].text+Math.random()%></td><%}%></tr><%}%>","selector":"tbody[mx-guid=\"x6dd2-\u001f\"]"},{"keys":["checkedFields"],"selector":"td[mx-guid=\"x6dd3-\u001f\"]","attrs":[{"n":"colspan","v":"<%=checkedFields.length+1%>"}]}],
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
});