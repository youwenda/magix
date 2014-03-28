/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/1.0events', function(S, View, Magix, Body) {
    var EvtInfoCache = Magix.cache(40);
    var SafeExec = Magix.safeExec;
    var WEvent = {
        prevent: function(e) {
            e = e || this.domEvent;
            e.preventDefault();
        },
        stop: function(e) {
            e = e || this.domEvent;
            e.stopPropagation();
        },
        halt: function(e) {
            this.prevent(e);
            this.stop(e);
        }
    };
    var EvtInfoReg = /(\w+)(?:<(\w+)>)?(?:\({([\s\S]*)}\))?/;
    var EvtParamsReg = /(\w+):([^,]+)/g;
    return View.mixin({
        pEvt: function(e) {
            var me = this;
            if (me.sign > 0) {
                var info = e.info;
                var domEvent = e.se;

                var m = EvtInfoCache.get(info);

                if (!m) {
                    m = info.match(EvtInfoReg);
                    m = {
                        n: m[1],
                        f: m[2],
                        i: m[3],
                        p: {}
                    };
                    if (m.i) {
                        m.i.replace(EvtParamsReg, function(x, a, b) {
                            m.p[a] = b;
                        });
                    }
                    EvtInfoCache.set(info, m);
                }
                var events = me.events;
                if (events) {
                    var eventsTypes = events[e.st];
                    if (eventsTypes) {
                        var fn = eventsTypes[m.n];
                        if (fn) {
                            var tfn = WEvent[m.f];
                            if (tfn) {
                                tfn.call(WEvent, domEvent);
                            }
                            SafeExec(fn, {
                                currentId: e.cId,
                                targetId: e.tId,
                                type: e.st,
                                view: me,
                                srcEvent: domEvent,
                                params: m.p,
                                halt: WEvent.halt,
                                prevent: WEvent.prevent,
                                stop: WEvent.stop
                            }, eventsTypes);
                        }
                    }
                }
            }
        },
        dEvts: function(dispose) {
            var me = this;
            var events = me.events;
            var vom = me.vom;
            for (var p in events) {
                Body.act(p, vom, dispose);
            }
        }
    });
}, {
    requires: ['magix/view', 'magix/magix', 'magix/body']
});