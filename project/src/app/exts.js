define("app/exts",['magix','./services/service'],function(require){
/*Magix ,Service */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Service = require('./services/service');
Magix.applyStyle('mp-199',"body{font-size:12px;font-family:Microsoft YaHei,微软雅黑,STXihei,华文细黑,Georgia,Times New Roman,Arial,sans-serif;background-color:#fff;color:#333}@font-face{font-family:iconfont;src:url(//at.alicdn.com/t/font_1456730304_1793184.eot);src:url(//at.alicdn.com/t/font_1456730304_1793184.eot#iefix) format('embedded-opentype'),url(//at.alicdn.com/t/font_1456730304_1793184.woff) format('woff'),url(//at.alicdn.com/t/font_1456730304_1793184.ttf) format('truetype'),url(//at.alicdn.com/t/font_1456730304_1793184.svg#iconfont) format('svg')}.iconfont{font-family:iconfont;font-weight:400;font-style:normal;padding-right:9px;font-size:16px;display:inline-block;transform:translateY(2px)}.ellipsis{white-space:nowrap;word-wrap:normal;overflow:hidden;text-overflow:ellipsis;text-align:left}.inmain{margin-left:0;transition:margin-left .5s;-moz-transition:margin-left .5s;-webkit-transition:margin-left .5s;-o-transition:margin-left .5s;overflow:auto}.loading{padding:150px 0;text-align:center}.loading span{display:inline-block;width:40px;height:18px;background:url(http://img02.taobaocdn.com/tps/i2/T19ZHDXf4fXXc.LCDe-40-18.gif) no-repeat}.clearfix{overflow:auto;_height:1%}a,a:focus,a:hover{color:#999}a,a:active,a:focus,a:hover,a:visited{outline:0;text-decoration:none}a:focus,button:focus,div:focus,input:focus,textarea:focus{outline:none}");
Magix.View.merge({
    ctor: function() {
        this.$locker = {};
        this.on('rendercall', function() {
            this.$locker = {};
        });
    },
    request: function(key) {
        var me = this;
        var s = new Service();
        return me.capture(key || s.id, s, true);
    },
    lock: function(key, fn) {
        var locker = this.$locker;
        if (!Magix.has(locker)) {
            locker[key] = 1;
            fn();
        }
    },
    unlock: function(key) {
        var locker = this.$locker;
        delete locker[key];
    }
});
});