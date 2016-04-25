define('app/views/demos/api-monitor',['magix','../../services/service'],function(require){
/*Magix ,Service */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Service = require('../../services/service');
Magix.applyStyle('mp-c60',".mp-c60-wrapper{margin:50px}.mp-c60-wrapper button{margin-right:20px}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-c60-wrapper\"><button class=\"btn\" mx-click=\"request({type:1})\">API 1</button> <button class=\"btn\" mx-click=\"request({type:2})\">API 2</button> <button class=\"btn\" mx-click=\"request({type:404})\">API 404</button> <button class=\"btn\" mx-click=\"clear({type:1})\">Clear cache 1</button> <button class=\"btn\" mx-click=\"clear({type:2})\">Clear cache 2</button></div><div mx-view=\"app/views/demos/partials/monitor-popup\"></div>",
    render: function() {
        var me = this;
        me.data.digest();
    },
    'request<click>': function(e) {
        var type = e.params.type;
        var name = '';
        if (type == 1) {
            name = 'list';
        }
        if (type == 2) {
            name = 'list1';
        }
        if (type == 404) {
            name = 'list404';
        }
        this.request().all(name, function(err, bag) {
            console.log(err, bag);
        });
    },
    'clear<click>': function(e) {
        var type = e.params.type;
        var name = '';
        if (type == 1) {
            name = 'list';
        }
        if (type == 2) {
            name = 'list1';
        }
        Service.clear(name);
    }
});
});