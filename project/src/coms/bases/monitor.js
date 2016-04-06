define("coms/bases/monitor",['$'],function(require){
/*$ */
/*
    author:xinglie.lkf@taobao.com
 */
var $ = require('$');
var ICounter = 0;
var Instances = [];
var Watcher = function(e) {
    for (var i = Instances.length - 1; i >= 0; i--) {
        var info = Instances[i];
        if (info.removed) {
            Instances.splice(i, 1);
        } else {
            var view = info.view;
            if (e.type != 'mousedown' || !view.inside(e.target)) {
                view.hide();
            }
        }
    }
};
var Add = function(view) {
    var info = Instances[view.id];
    if (info) {
        info.removed = true;
    }
    info = {
        view: view
    };
    Instances.push(info);
    Instances[view.id] = info;
};
var Remove = function(view) {
    var info = Instances[view.id];
    if (info) {
        info.removed = true;
    }
    delete Instances[view.id];
};
var Setup = function() {
    if (!ICounter) {
        $(document).on('mousedown', Watcher);
        $(window).on('resize', Watcher);
    }
    ICounter++;
};
var Teardown = function() {
    if (ICounter > 0) {
        ICounter--;
        if (!ICounter) {
            $(document).off('mousedown', Watcher);
            $(window).off('resize', Watcher);
        }
    }
};
return {
    add: Add,
    remove: Remove,
    setup: Setup,
    teardown: Teardown
};
});