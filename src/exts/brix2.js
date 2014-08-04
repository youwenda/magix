KISSY.add('app/brix2', function(S, View, Promise, Pagelet) {
    View.mixin({
        renderByPagelet: function(data) {
            var me = this;
            var d = new Promise.Defer();
            var pagelet = me.getManaged('pagelet');
            if (pagelet) {
                pagelet.ready(function() {
                    pagelet.setChunkData(data); //
                    pagelet.ready(function() {
                        d.resolve(pagelet);
                    });
                });
            } else {
                S.one('#' + me.id).html('');
                me.beginUpdate();
                pagelet = new Pagelet({
                    container: '#' + me.id,
                    tmpl: me.tmpl,
                    data: data,
                    destroyAction: 'none'
                });
                me.endUpdate();
                me.manage('pagelet', pagelet);
                pagelet.on('beforeRefreshTmpl', function(e) {
                    me.owner.unmountZoneVframes(e.node[0], true);
                });
                pagelet.on('afterRefreshTmpl', function(e) {
                    me.owner.mountZoneVframes(e.node[0]);
                });
                pagelet.ready(me.wrapAsync(function() {
                    d.resolve(pagelet);
                }));
            }
            return d.promise;
        }
    });
    return View;
}, {
    requires: [
        'magix/view',
        'promise',
        'brix/core/pagelet'
    ]
});