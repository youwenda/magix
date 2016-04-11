define("app/views/coms/inputmask",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div style=\"margin:50px\"><input class=\"input\" mx-vframe=\"true\" mx-view=\"coms/inputmask/index?mask=9999-aaaa-w*ww99\" /><input class=\"input\" mx-vframe=\"true\" mx-view=\"coms/inputmask/index?mask=999.999.999.999\" placeholder=\"IPV4\" /></div>",
    render: function() {
        var me = this;
        me.data.digest();
    }
});
});