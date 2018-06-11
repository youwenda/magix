KISSY.add("view/p1", function (S, View) {
    Magix.tmpl("view/p1", '<div>p111</div>');
    return View.extend({
        // tmpl: '@default.html',
        events: {
            click: {
                a: function () {
                    console.log('a');
                },
                b: function () {
                    console.log('b');
                },
                c: function () {
                    console.log('c');
                }
            }
        }
    });
}, {
    requires: [
        'view/p2'
    ]
});
