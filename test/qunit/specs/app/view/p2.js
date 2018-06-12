KISSY.add("view/p2", function (S, View) {
    Magix.tmpl("view/p2", '<div>p111</div>');
    return View.extend({
        // tmpl: '@default.html',
        events: {
            click: {
                a: function () {
                    return 'a2'
                },
                d: function () {
                    return 'd2'
                }
            }
        }
    });
}, {
    requires: [
        'mxext/view'
    ]
});
