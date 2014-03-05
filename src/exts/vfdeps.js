/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vfdeps', function(S, Vframe, Magix, VOM, Event) {
    var Base = Vframe.prototype;
    var oldMountView = Base.mountView;
    VOM.on('add', function(e) {
        WaitObserver.fire(e.vframe.id + ':add', e, true);
    });
    VOM.on('remove', function(e) {
        WaitObserver.off(e.vframe.id + ':add');
    });
    var WaitObserver = Magix.mix({}, Event);
    var WaitVframe = function(vfId, callback) {
        var vf = VOM.get(vfId);
        if (vf) {
            if (vf.fcc) {
                callback();
            } else {
                vf.once('created', callback);
            }
        } else {
            WaitObserver.once(vfId + ':add', function(e) {
                e.vframe.once('created', callback);
            });
        }
    };
    var Win = S.one(window);
    var ScrollList = [];
    var Intersect = function(rect1, rect2) {
        var half1Width = rect1.width / 2,
            half1Height = rect1.height / 2,
            half2Width = rect2.width / 2,
            half2Height = rect2.height / 2,
            cen1 = {
                x: rect1.x + half1Width,
                y: rect1.y + half1Height
            },
            cen2 = {
                x: rect2.x + half2Width,
                y: rect2.y + half2Height
            };

        return Math.abs(cen2.x - cen1.x) <= half1Width + half2Width && Math.abs(cen2.y - cen1.y) <= half1Height + half2Height;
    };
    var Scrolled = function() {
        var viewport = {
            x: S.DOM.scrollLeft(),
            y: S.DOM.scrollTop(),
            width: S.DOM.viewportWidth(),
            height: S.DOM.viewportHeight()
        };
        for (var i = 0, one, node, rect, temp; i < ScrollList.length; i++) {
            one = ScrollList[i];
            node = S.one('#' + one.id);
            if (node) {
                temp = node.offset();

                rect = {
                    x: temp.left,
                    y: temp.top,
                    width: node.width(),
                    height: node.height()
                };
                if (Intersect(viewport, rect)) {
                    ScrollList.splice(i, 1);
                    i--;
                    one.cb();
                }
            } else {
                ScrollList.splice(i, 1);
                i--;
            }
        }
        if (!ScrollList.length) {
            Win.detach('scroll', Scrolled);
        }
    };
    var ScrollWatch = function(vfId, callback) {
        if (!ScrollList.length) {
            Win.on('scroll', Scrolled);
        }
        ScrollList.push({
            id: vfId,
            cb: callback
        });
        Scrolled();
    };
    Base.mountView = function(viewPath, viewInitParams, callback) {
        var me = this;
        var sign = --me.sign;
        var node = S.one('#' + me.id);
        var deps = node.attr('mxext-deps');
        if (deps) { //有依赖
            if (deps | 0) { //延时
                setTimeout(function() { //由sign保证正确,所以无须取消setTimeout的执行
                    if (sign == me.sign) {
                        oldMountView.call(me, viewPath, viewInitParams, callback);
                    }
                }, deps);
            } else { //其它依赖
                if (deps == '@viewport') { //以@开头的表示内置的命令：当vframe节点处在可视区域时加载
                    ScrollWatch(me.id, function() {
                        if (sign == me.sign) {
                            oldMountView.call(me, viewPath, viewInitParams, callback);
                        }
                    });
                } else { //其它vframe依赖
                    //if (IsVframeCreated(deps)) { //如果依赖的已经加载完成
                    // oldMountView.call(me, viewPath, viewInitParams, callback);
                    //} else {
                    WaitVframe(deps, function() { //等待相应的vframe加载
                        if (me.sign == sign) {
                            oldMountView.call(me, viewPath, viewInitParams, callback);
                        }
                    });
                    //}
                }
            }
        } else {
            oldMountView.call(me, viewPath, viewInitParams, callback);
        }
    };
}, {
    requires: ['magix/vframe', 'magix/magix', 'magix/vom', 'magix/event', 'node']
});