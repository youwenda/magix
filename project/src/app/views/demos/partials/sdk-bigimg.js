define("app/views/demos/partials/sdk-bigimg",['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var BigImgId = Magix.guid('bigimg');
Magix.applyStyle('mp-9b8',".mp-9b8-bigimg{position:absolute}.mp-9b8-bigimg div{background:#ddd;padding:10px;width:260px}.mp-9b8-bigimg img{width:100%}");
var CSSNames = {"bigimg":"mp-9b8-bigimg"}
var BigImg = Magix.View.extend({
    tmpl: "<div mx-mouseover=\"hover()\" mx-mouseout=\"hover()\"><img src=\"<%=img%>\" /></div>",
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
        view.owner.mountVframe(BigImgId, 'app/views/demos/partials/sdk-bigimg', {
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
return BigImg;
});