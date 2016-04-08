define("app/views/demos/view-subs",['magix','../../../coms/form/index'],function(require){
/*Magix ,Form */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Form = require('../../../coms/form/index');
Magix.applyStyle('mp-514',".mp-514-wrapper{margin:50px}.mp-514-form-item{height:30px;line-height:30px;margin:5px 0}.mp-514-title{width:120px;text-align:right;margin-right:10px}.mp-514-content,.mp-514-title{float:left}.mp-514-w88{width:88px}");
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
return Form.extend({
    tmpl: "<div class=\"mp-514-wrapper\"><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">创意标题</div><div class=\"mp-514-content\"><input class=\"input\" /></div></div><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">创意类型</div><div class=\"mp-514-content\" id=\"types_<%=id%>\"></div></div><div id=\"type_vf_<%=id%>\" mx-vframe=\"true\">\n        loading...\n    </div><button class=\"btn\" mx-click=\"save();\">保存</button></div>",
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
        vf.mountView('app/views/demos/partials/view-subs-' + type, {
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
});