define("app/services/service",['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var TenMins = 10 * 60 * 1000;
var Service = Magix.Service.extend(function(bag, callback) {
    //console.log(bag.get('url'));
    $.ajax({
        url: bag.get('url'),
        complete: function(xhr, text) {
            if (text == 'error') {
                callback({
                    msg: xhr.statusText
                });
            } else {
                //console.log(xhr.responseText);
                bag.set('data', $.parseJSON(xhr.responseText));
                callback();
            }
        }
    });
});
Service.add([{
    name: 'list',
    url: Env.cdn + 'apis/list.json',
    cache: TenMins
}, {
    name: 'list1',
    url: Env.cdn + 'apis/list1.json',
    cache: TenMins
}, {
    name: 'list404',
    url: Env.cdn + 'apis/list404.json'
}]);
return Service;
});