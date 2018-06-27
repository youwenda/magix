KISSY.add("app/view/p1", function (S, View) {
    Magix.tmpl("app/view/p1", '<div>p111</div>');
    return View.extend({
        // tmpl: '@default.html',
        events: {
            click: {
                a: function () {
                    return 'a1'
                },
                b: function () {
                    return 'b1'
                },
                c: function () {
                    return 'c1'
                }
            }
        }
    });
}, {
    requires: [
        'app/view/p2'
    ]
});
