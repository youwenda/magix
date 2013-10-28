/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/home', function(S, View) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
        }
    });
}, {
    requires: ['mxext/view']
});