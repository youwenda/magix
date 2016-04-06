/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Dialog = require('../../../coms/dialog/index');
module.exports = Magix.View.extend({
    tmpl: '@dialog.html',
    render: function() {
        var me = this;
        me.data.digest();
    },
    'alert<click>':function(){
        Dialog.alert(this,'test');
    },
    'confirm<click>':function(){
        Dialog.confirm(this,'test');
    },
    'view<click>':function(){
        Dialog.msgbox(this, {
            title:'提示信息view',
            view: 'app/views/coms/popover',
            dock: 'left',
            left: 200,
            top: 200,
            height: 400,
            width: 600
        });
    }
});