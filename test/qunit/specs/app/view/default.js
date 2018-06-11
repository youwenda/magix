KISSY.add("view/default", function (S, View) {
    Magix.tmpl("view/default", '<div>111</div>');
    return View.extend({
        // tmpl: '@default.html',
        init: function (){
            this.owner.fire('mounted');
        },
        events: {
            click: {
                a: function () {
                    console.log('a0');
                }
            }
        }
    });
}, {
    requires: [
        'view/p1'
    ]
});
