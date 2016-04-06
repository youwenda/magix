/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Service = require('../../services/service');
Magix.applyStyle('@api-monitor.css');
module.exports = Magix.View.extend({
    tmpl: '@api-monitor.html',
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