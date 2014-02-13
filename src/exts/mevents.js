/*
    author:xinglie.lkf@taobao.com
 */
/*KISSY.add('exts/m-events', function(S, Body, Magix, SE) {
    Body.lib = function(node, vfId, type, remove) {
        var fn = remove ? SE.undelegate : SE.delegate;
        fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
    };
    Body.special(Magix.listToMap('tap,double-tap,pinch,swipe')); //其它的自已加
}, {
    requires: ['magix/body', 'magix/magix', 'event']
});*/
define('exts/mevents', ['magix/body', 'magix/event', 'magix/magix'], function(require) {
    var Body = require('magix/body');
    //var Event = require('magix/event');
    //var Magix = require('magix/magix');
    var Unbubbles = {
        tap: 1,
        longTap: 1,
        singleTap: 1,
        doubleTap: 1,
        swipe: 1,
        swipeLeft: 1,
        swipeRight: 1,
        swipeUp: 1,
        swipeDown: 1,
        mouseenter: 2,
        mouseleave: 2,
        focus: 2,
        blur: 2
    };
    Body.special(Unbubbles);

    Body.lib = function(node, type, remove, callback) {
        var realType = Unbubbles[type];
        if (realType == 1) {
            var action = remove ? 'off' : 'on';
            $(node)[action](type, callback);
        } else {
            var action = remove ? 'undelegate' : 'delegate';
            $(node)[action]('[mx-' + type + ']', type, callback);
        }
    };
    /*var OldAct = Body.act;
    var Infos = {
        '@': {
            host: window,
            events: {

            },
            callbacks: Magix.mix({

            }, Event)
        },
        '#': {
            host: document,
            events: {

            },
            callbacks: Magix.mix({

            }, Event)
        }
    };
    Body.act = function(type, remove, vom, fn) {
        console.log(arguments);
        var c = type.charAt(0);
        var info = Infos[c];
        if (info) {
            type = type.substring(1);
            var counter = info.events[type] || 0;
            var step = counter > 0 ? 1 : 0;
            counter += remove ? -step : step;
            if (!counter) {
                info.host['on' + type] = remove ? null : function(e) {
                    info.callbacks.fire(e.type);
                };
                if (!remove) {
                    counter = 1;
                }
            }
            info.callbacks[remove ? 'off' : 'on'](type, fn);
            info.events[type] = counter;
        } else {
            OldAct.call(Body, type, remove, vom);
        }
    };*/
});

/*
$(document.body).delegate('div','mouseenter',function(e){
    console.log(e);
});

'resize<@resize>':function(e){
};

 */