/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/vanim', function(S, Router, Magix) {
    var Dirs = {
        TOP: 1,
        RIGHT: 2,
        BOTTOM: 4,
        LEFT: 8
    };
    var Rules = [{
        from: /^\/home$/,
        to: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/index$/,
        aAnim: 'slideLeft',
        bAnim: 'slideRight'
    }, {
        from: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/index$/,
        to: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/\w+$/,
        aAnim: 'slideLeft',
        bAnim: 'slideRight'
    }, {
        from: /^\/home$/,
        to: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/\w+$/,
        aAnim: 'slideLeft',
        bAnim: 'slideRight'
    }, {
        from: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/\w+$/,
        to: /^\/(?:kissy|seajs|requirejs)\/1\.[012]\/\w+$/,
        aAnim: 'fade',
        bAnim: 'fade'
    }];
    var RulesCache = Magix.cache();

    var VAnim = {
        animCounter: 0,
        getAnimRule: function(e) {
            var me = VAnim;
            var rule = {
                root: 'magix_vf_main'
            };
            var changed = e.changed;
            if (changed.isPath()) {
                var pn = changed.path;
                var key1 = pn.from + '&' + pn.to;
                var key2 = pn.to + '&' + pn.from;
                if (RulesCache.has(key1)) {
                    rule.anim = RulesCache.get(key1);
                } else {
                    for (var i = 0, r; i < Rules.length; i++) {
                        r = Rules[i];
                        if (r.from.test(pn.from) && r.to.test(pn.to)) {
                            rule.anim = r.aAnim;
                            RulesCache.set(key2, r.bAnim);
                            RulesCache.set(key1, r.aAnim);
                            break;
                        } else if (r.to.test(pn.from) && r.from.test(pn.to)) {
                            rule.anim = r.bAnim;
                            RulesCache.set(key1, r.bAnim);
                            RulesCache.set(key2, r.aAnim);
                            break;
                        }
                    }
                }
            }
            return rule;
        },
        processRoot: function(root) {
            var rootNode = S.one('#' + root);
            if (rootNode.prop('tagName').toUpperCase() == 'BODY') {
                var children = rootNode.children();
                rootNode.append('<div id="' + root + '"></div>').attr('id', '');
                rootNode = S.one('#' + root);
                rootNode.append(children);
            }
        },
        registerAnim: function(key, anim) {
            var me = VAnim;
            if (!me.$anims) {
                me.$anims = {};
            }
            me.$anims[key] = anim;
        },
        stopAnims: function() {
            var me = VAnim;
            var anims = me.$anims;
            var anim;
            for (var p in anims) {
                anim = anims[p];
                if (anim && anim.stop) {
                    anim.stop(true);
                }
            }
        },
        fade: function(root) {
            var me = VAnim;
            me.processRoot(root);
            var rootNode = S.one('#' + root);
            var tId = S.guid('temp');
            rootNode.after('<div id="' + tId + '"></div>');
            var newRoot = S.one('#' + tId);

            newRoot.append(rootNode.children());
            rootNode.css({
                display: 'none',
                opacity: 0
            });
            me.animCounter++;
            new S.Anim(newRoot, {
                opacity: 0
            }, 0.5, 'easeNone', function() {
                newRoot.remove();
                rootNode.css({
                    display: 'block'
                });
                new S.Anim(rootNode, {
                    opacity: 1
                }, 0.5, 'easeNone', function() {
                    me.animCounter--;
                }).run();
            }).run();
        },
        slide: function(root, dir) {
            var me = VAnim;
            me.stopAnims();
            me.processRoot(root);
            var rootNode = S.one('#' + root);
            var parent = rootNode.parent();
            if (!me.animCounter) {
                me.$bakPosition = parent.css('position');
                me.$bakOverflow = parent.css('overflow');
            }
            var outerWidth = parent.outerWidth();
            var outerHeight = parent.outerHeight();
            parent.css({
                position: 'relative',
                overflow: 'hidden'
            });
            var tId = S.guid('temp');
            rootNode.after('<div id="' + tId + '"></div>');
            var newRoot = S.one('#' + tId);
            var newRootIniAnimAttrs = {
                position: 'fixed',
                width: outerWidth,
                height: outerHeight,
                left: 0,
                top: parent.offset().top
            };
            var oldRootIniAnimAttrs = {

            };
            if (dir == Dirs.LEFT) {
                oldRootIniAnimAttrs = {
                    position: 'relative',
                    left: outerWidth,
                    top: 0
                };
            } else if (dir == Dirs.TOP) {
                oldRootIniAnimAttrs = {
                    position: 'relative',
                    left: 0,
                    top: Math.max(outerHeight, S.DOM.docHeight())
                };
            } else if (dir == Dirs.RIGHT) {
                oldRootIniAnimAttrs = {
                    position: 'relative',
                    left: -outerWidth,
                    top: 0
                };
            } else if (dir == Dirs.BOTTOM) {
                oldRootIniAnimAttrs = {
                    position: 'relative',
                    left: 0,
                    top: -Math.max(outerHeight, S.DOM.docHeight())
                };
            }


            newRoot.css(newRootIniAnimAttrs).append(rootNode.children());

            rootNode.css(oldRootIniAnimAttrs);


            var oldRootAnimAttrs = {};
            var newRootAnimAttrs = {};

            if (dir == Dirs.LEFT) {
                newRootAnimAttrs.left = -outerWidth;
                oldRootAnimAttrs.left = 0;
            } else if (dir == Dirs.TOP) {
                oldRootAnimAttrs.top = 0;
                newRootAnimAttrs.top = -Math.max(outerHeight, S.DOM.docHeight());
            } else if (dir == Dirs.RIGHT) {
                oldRootAnimAttrs.left = 0;
                newRootAnimAttrs.left = outerWidth;
            } else if (dir == Dirs.BOTTOM) {
                oldRootAnimAttrs.top = 0;
                newRootAnimAttrs.top = Math.max(outerHeight, S.DOM.docHeight());
            }
            me.animCounter++;
            me.registerAnim('slideOld', new S.Anim(rootNode, oldRootAnimAttrs, 0.5, 'easeOut').run());
            me.registerAnim('slideNew', new S.Anim(newRoot, newRootAnimAttrs, 0.5, 'easeOut', function() {
                newRoot.remove();
                rootNode.css({
                    position: 'static',
                    width: 'auto',
                    height: 'auto'
                });
                me.animCounter--;
                if (!me.animCounter) {
                    parent.css({
                        position: me.$bakPosition,
                        overflow: me.$bakOverflow
                    });
                }
            }).run());
        },
        slideLeft: function(root) {
            VAnim.slide(root, Dirs.LEFT);
        },
        slideTop: function(root) {
            VAnim.slide(root, Dirs.TOP);
        },
        slideRight: function(root) {
            VAnim.slide(root, Dirs.RIGHT);
        },
        slideBottom: function(root) {
            VAnim.slide(root, Dirs.BOTTOM);
        },
        locationChange: function(e) {
            if (!e.force) {
                var me = VAnim;
                var rule = me.getAnimRule(e);
                if (rule) {
                    var fn = me[rule.anim];
                    if (fn) {
                        fn(rule.root);
                    }
                }
            }
        }
    };
    Router.on('changed', VAnim.locationChange, 0);
}, {
    requires: ['magix/router', 'magix/magix', 'node', 'anim']
});