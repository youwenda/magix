define('coms/uploader/index',['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-ce9',".mp-ce9-pr{position:relative}.mp-ce9-file{left:0;top:0;bottom:0;right:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:100px;filter:alpha(opacity=0)}.mp-ce9-cnt,.mp-ce9-file{position:absolute}.mp-ce9-cnt{left:-999999px}");
var Uploader = Magix.Base.extend({
    destroy: function() {
        var me = this;
        me.$oust = 1;
    }
});
var Iframe = Uploader.extend({
    send: function(input) {
        var id = Magix.guid('up');
        $('body').append('<div id="' + id + '_temp" class="mp-ce9-cnt"><form target="' + id + '" enctype="multipart/form-data" method="post" action="test"></form><iframe name="' + id + '" id="' + id + '"></iframe></div>');
        var cnt = $('#' + id + '_temp');
        var form = cnt.find('form');
        form.append(input);
        var ifm = cnt.find('iframe');
        ifm.on('load', function() {
            setTimeout(function() {
                cnt.remove();
            }, 0);
        });
        form.submit();
    }
});
var XHR = Uploader.extend({
    send: function(input) {
        var data = new FormData();
        for (var i = 0; i < input.files.length; i++) {
            data.append(input.files[i].name, input.files[i]);
        }
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('post', 'test', true);
        xhr.upload.onprogress = function(e) {
             // var percent = Math.round((event.loaded / event.total) * 100)
             // console.log('[uploader]', file.name, event.loaded, event.total, percent + '%')
        };
        xhr.onerror = function(err) {
            console.log(err);
        };
        xhr.onload = function() {
            console.log(xhr.status);
            $(input).remove();
        };
        xhr.send(data);
    }
});
return Magix.View.extend({
    ctor: function() {
        var me = this;
        me.$uploader = new XHR();
        me.on('destroy', function() {
            me.$uploader.destroy();
        });
    },
    add: function() {
        var me = this;
        $('#' + me.id).append('<input type="file" class="mp-ce9-file" mx-change="upload()" name="file" />').addClass('mp-ce9-pr');
    },
    render: function() {
        var me = this;
        me.add();
        me.endUpdate();
    },
    'upload<change>': function(e) {
        this.$uploader.send(e.target);
        this.add();
    }
});
});