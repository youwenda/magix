KISSY.add("view/p1", function (S, View) {
    Magix.tmpl("view/p2", '<div>p111</div>');
    return View.extend({
        // tmpl: '@default.html',
        events: {
            click: {
                a: function () {
                    console.log('a2');
                },
                d: function () {
                    console.log('d2');
                }
            }
        }
    });
}, {
    requires: [
        'view/p2'
    ]
});
