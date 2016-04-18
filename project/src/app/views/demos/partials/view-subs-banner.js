define("app/views/demos/partials/view-subs-banner",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
;
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div class=\"mp-514-form-item\"><div class=\"mp-514-title\">创意尺寸</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" /> X <input class=\"input mp-514-w88\" /></div></div>",
    render: function() {
        var me = this;
        setTimeout(me.wrapAsync(function() {
            me.data.digest();
        }), 10000);
    }
});
});