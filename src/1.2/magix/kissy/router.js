/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.2
 */
KISSY.add('magix/router', function(S, Magix, Event, SE) {
    eval(Magix.include('../tmpl/router'));
    Router.bind = function(useState) {
        if (useState) {
            var initialURL = location.href;
            SE.on(window, 'popstate', function(e) {
                var equal = location.href == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                console.log('push?', e.type, e.state);
                Router.route();
            });
        } else {
            SE.on(window, 'hashchange', Router.route);
        }
    };
    return Router;
}, {
    requires: ["magix/magix", "magix/event", "event"]
});