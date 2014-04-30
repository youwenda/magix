/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.1
 */
KISSY.add('magix/router', function(S, Magix, Event, SE) {
    eval(Magix.include('../tmpl/router'));
    Router.useState = function() {
        var initialURL = location.href;
        SE.on(window, 'popstate', function(e) {
            var equal = location.href == initialURL;
            if (!Router.poped && equal) return;
            Router.poped = 1;
            console.log('push?', e.type, e.state);
            Router.route();
        });
    };
    Router.useHash = function() { //extension impl change event
        SE.on(window, 'hashchange', Router.route);
    };
    return Router;
}, {
    requires: ["magix/magix", "magix/event", "event"]
});