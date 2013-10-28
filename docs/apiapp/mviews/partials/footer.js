/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/footer', function(S, View) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
        }
    });
}, {
    requires: ['mxext/view']
});