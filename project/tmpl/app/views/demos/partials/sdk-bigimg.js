/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var BigImgId = Magix.guid('bigimg');
Magix.applyStyle('@sdk-bigimg.css');
var CSSNames = 'names@sdk-bigimg.css';
var BigImg = Magix.View.extend({
    tmpl: '@sdk-bigimg.html',
    ctor: function(extra) {
        var me = this;
        me.$img = extra.img;
        me.$anchor = extra.anchor;
    },
    render: function() {
        var me = this;
        me.data.set({
            img: me.$img
        }).digest();
        var anchor = $(me.$anchor);
        var offset = anchor.offset();
        var width = anchor.outerWidth();
        $('#' + me.id).offset({
            left: offset.left + width,
            top: offset.top
        });
    },
    'hover<mouseover,mouseout>': function(e) {
        if (e.type == 'mouseout') {
            BigImg.start();
        } else {
            BigImg.stop();
        }
    }
}, {
    show: function(view, img, anchor) {
        var node = $('#' + BigImgId);
        var me = this;
        me.stop();
        node.show();
        if (!node.size()) {
            $(document.body).append('<div id="' + BigImgId + '" class="' + CSSNames.bigimg + '" />');
        }
        view.owner.mountVframe(BigImgId, '@moduleId', {
            img: img,
            anchor: anchor
        });
    },
    stop: function() {
        clearTimeout(this.$timer);
    },
    start: function() {
        this.$timer = setTimeout(function() {
            $('#' + BigImgId).hide();
        }, 150);
    },
    hide: function() {
        var me = this;
        me.stop();
        me.start();
    },
    destroy: function() {
        var me = this;
        me.stop();
        $('#' + BigImgId).remove();
    }
});
module.exports = BigImg;