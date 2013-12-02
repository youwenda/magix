/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vlinks', function(S, Router) {
    S.one(document).delegate('click', 'a', function(e) {
        var href = S.one(e.target).attr('href');
        if (href && href.indexOf('#!') === 0) {
            e.preventDefault();
            Router.navigate(href.substring(2));
        }
    });
}, {
    requires: ['magix/router', 'node']
});