/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@monitor-popup.css');
var Service = require('../../../services/service');
module.exports = Magix.View.extend({
    tmpl: '@monitor-popup.html',
    ctor: function() {
        var me = this;
        Service.on('begin', function(e) {
            me.logService(e);
        });
        Service.on('end', function(e) {
            me.logService(e);
        });
    },
    render: function() {
        var me = this;
        me.data.set({
            list: []
        }).digest();
    },
    logService: function(e) {
        var me = this;
        var list = me.data.get('list') || [];
        if (e.type == 'begin') {
            list.unshift({
                type: '开始请求',
                name: e.bag.get('name'),
                url: e.bag.get('url'),
                cache: e.bag.get('cache'),
                result: '-'
            });
        } else {
            list.unshift({
                type: '结束请求',
                name: e.bag.get('name'),
                url: e.bag.get('url'),
                result: e.error ? e.error.msg : '成功',
                cache: e.bag.get('cache'),
            });
        }
        me.data.set({
            list: list
        }).digest();
    }
});