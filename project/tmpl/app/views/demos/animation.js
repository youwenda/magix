/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@animation.css');
var Names = 'names@animation.css[ball]';
var $ = require('$');
module.exports = Magix.View.extend({
    tmpl: '@animation.html',
    test: function(x) {
        var me = this;
        $('#ball_' + me.id).removeClass().addClass(x + ' animated ' + Names.ball).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass().addClass(Names.ball);
        });
    },
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
    },
    'exec<click>': function(e) {
        e.preventDefault();
        var anim = $('#animations').val();
        this.test(anim);
    }
});