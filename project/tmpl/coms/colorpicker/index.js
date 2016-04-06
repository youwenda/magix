/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Picker = require('../bases/picker');
Magix.applyStyle('@index.css');
var GraphicsType = (window.SVGAngle || document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') ? 'SVG' : 'VML');
var $C = function(el, attrs, children) {
    el = document.createElementNS('http://www.w3.org/2000/svg', el);
    for (var key in attrs)
        el.setAttribute(key, attrs[key]);
    if (!$.isArray(children)) children = [children];
    var i = 0,
        len = (children[0] && children.length) || 0;
    for (; i < len; i++)
        el.appendChild(children[i]);
    return el;
};
var RenderSVG = function(picker, slide) {
    slide.append($C('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        version: '1.1',
        width: '100%',
        height: '100%'
    }, [$C('defs', {}, $C('linearGradient', {
        id: 'gradient-hsv',
        x1: '0%',
        y1: '100%',
        x2: '0%',
        y2: '0%'
    }, [$C('stop', {
        offset: '0%',
        'stop-color': '#FF0000',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '13%',
        'stop-color': '#FF00FF',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '25%',
        'stop-color': '#8000FF',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '38%',
        'stop-color': '#0040FF',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '50%',
        'stop-color': '#00FFFF',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '63%',
        'stop-color': '#00FF40',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '75%',
        'stop-color': '#0BED00',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '88%',
        'stop-color': '#FFFF00',
        'stop-opacity': '1'
    }), $C('stop', {
        offset: '100%',
        'stop-color': '#FF0000',
        'stop-opacity': '1'
    })])), $C('rect', {
        x: '0',
        y: '0',
        width: '100%',
        height: '100%',
        fill: 'url(#gradient-hsv)'
    })]));

    picker.append($C('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        version: '1.1',
        width: '100%',
        height: '100%'
    }, [$C('defs', {}, [
                $C('linearGradient', {
            id: 'gradient-black',
            x1: '0%',
            y1: '100%',
            x2: '0%',
            y2: '0%'
        }, [$C('stop', {
            offset: '0%',
            'stop-color': '#000000',
            'stop-opacity': '1'
        }), $C('stop', {
            offset: '100%',
            'stop-color': '#CC9A81',
            'stop-opacity': '0'
        })]), $C('linearGradient', {
            id: 'gradient-white',
            x1: '0%',
            y1: '100%',
            x2: '100%',
            y2: '100%'
        }, [$C('stop', {
            offset: '0%',
            'stop-color': '#FFFFFF',
            'stop-opacity': '1'
        }), $C('stop', {
            offset: '100%',
            'stop-color': '#CC9A81',
            'stop-opacity': '0'
        })])]), $C('rect', {
        x: '0',
        y: '0',
        width: '100%',
        height: '100%',
        fill: 'url(#gradient-white)'
    }), $C('rect', {
        x: '0',
        y: '0',
        width: '100%',
        height: '100%',
        fill: 'url(#gradient-black)'
    })]));
};
var RenderVML = function(picker, slide) {
    if (!document.namespaces.v) {
        document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
    }
    slide.html(['<div style="position: relative; width: 100%; height: 100%">', '<v:rect style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></v:fill>', '</v:rect>', '</div>'].join(''));
    picker.html(['<div style="position: relative; width: 100%; height: 100%">', '<v:rect style="position: absolute; left: -1px; top: -1px; width: 101%; height: 101%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>', '</v:rect>', '<v:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t">', '<v:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>', '</v:rect>', '</div>'].join(''));
};
var CSSNames = 'names@index.css';
var ShortCuts = ['d81e06', 'f4ea2a', '1afa29', '1296db', '13227a', 'd4237a', 'ffffff', 'e6e6e6', 'dbdbdb', 'cdcdcd', 'bfbfbf', '8a8a8a', '707070', '515151', '2c2c2c', '000000', 'ea986c', 'eeb174', 'f3ca7e', 'f9f28b', 'c8db8c', 'aad08f', '87c38f', '83c6c2', '7dc5eb', '87a7d6', '8992c8', 'a686ba', 'bd8cbb', 'be8dbd', 'e89abe', 'e8989a', 'e16632', 'e98f36', 'efb336', 'f6ef37', 'afcd51', '7cba59', '36ab60', '1baba8', '17ace3', '3f81c1', '4f68b0', '594d9c', '82529d', 'a4579d', 'db649b', 'dd6572', 'd81e06', 'e0620d', 'ea9518', 'f4ea2a', '8cbb1a', '2ba515', '0e932e', '0c9890', '1295db', '0061b2', '0061b0', '004198', '122179', '88147f', 'd3227b', 'd6204b'];
var HSV2RGB = function(h, s, v) {
    var R, G, B, X, C;
    h = (h % 360) / 60;
    C = v * s;
    X = C * (1 - Math.abs(h % 2 - 1));
    R = G = B = v - C;

    h = ~~h;
    R += [C, X, 0, 0, X, C][h];
    G += [X, C, C, X, 0, 0][h];
    B += [0, 0, X, C, C, X][h];

    var r = R * 255,
        g = G * 255,
        b = B * 255;
    return {
        r: r,
        g: g,
        b: b,
        hex: '#' + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)
    };
};
var RGB2HSV = function(r, g, b) {
    //if (r > 0 || g > 0 || b > 0) {
    r /= 255;
    g /= 255;
    b /= 255;
    //}
    var H, S, V, C;
    V = Math.max(r, g, b);
    C = V - Math.min(r, g, b);
    H = (C === 0 ? null : V == r ? (g - b) / C + (g < b ? 6 : 0) : V == g ? (b - r) / C + 2 : (r - g) / C + 4);
    H = (H % 6) * 60;
    S = C === 0 ? 0 : C / V;
    return {
        h: H,
        s: S,
        v: V
    };
};
module.exports = Picker.extend({
    tmpl: '@index.html',
    ctor: function(extra) {
        var me = this;
        me.$color = extra.color || '#ffffff';
        me.$hsv = {
            h: 0,
            s: 1,
            v: 1
        };
        me.$picked = extra.picked;
        $('#' + me.id).addClass(CSSNames.cnt);
    },
    render: function() {
        var me = this;
        me.data.set({
            id: me.id,
            shortcuts: ShortCuts
        }).digest();
        var slideNode = $('#slide_' + me.id);
        var pickerNode = $('#cpicker_' + me.id);
        if (GraphicsType == 'SVG') {
            RenderSVG(pickerNode, slideNode);
        } else {
            RenderVML(pickerNode, slideNode);
        }
        me.setColor(me.$color);
        me.show();
    },
    setHSV: function(hsv, ignoreSyncUI) {
        var me = this;
        var selfHSV = me.$hsv;
        selfHSV.h = hsv.h % 360;
        selfHSV.s = hsv.s;
        selfHSV.v = hsv.v;
        var rgb = HSV2RGB(hsv.h, hsv.s, hsv.v);
        var hex = rgb.hex;
        var cpickerNode = $('#cpicker_' + me.id);
        var colorZone = HSV2RGB(hsv.h, 1, 1);
        cpickerNode.css('background', colorZone.hex);
        $('#bgcolor_' + me.id).css('background', hex);
        $('#val_' + me.id).val(hex);
        if (!ignoreSyncUI) {
            $('#shortcuts_' + me.id + ' li').removeClass(CSSNames.selected);
            var top = Math.round(selfHSV.h * 196 / 360 - 8);
            $('#sh_' + me.id).css({
                top: top
            });
            top = Math.round((1 - selfHSV.v) * 196 - 6);
            var left = Math.round(selfHSV.s * 196 - 6);
            $('#ph_' + me.id).css({
                left: left,
                top: top
            });
        }
        $('#sc_' + hex.substr(1, 6) + '_' + me.id).addClass(CSSNames.selected);
    },
    setColor: function(hex) {
        var me = this;
        var r = parseInt(hex.substr(1, 2), 16);
        var g = parseInt(hex.substr(3, 2), 16);
        var b = parseInt(hex.substr(5, 2), 16);
        var hsv = RGB2HSV(r, g, b);
        me.setHSV(hsv);
    },
    'dragSlide<mousedown>': function(e) {
        var me = this;
        var current = $(e.current);
        var startY = parseInt(current.css('top'), 10);
        me.beginDrag(e, e.current, function(event, pos) {
            var offsetY = event.pageY - pos.pageY;
            offsetY += startY;
            if (offsetY <= -8) offsetY = -8;
            else if (offsetY >= 188) offsetY = 188;
            current.css({
                top: offsetY
            });
            var h = (offsetY + 8) / 196 * 360;
            me.setHSV({
                h: h,
                s: me.$hsv.s,
                v: me.$hsv.v
            }, true);
        });
    },
    'dragPicker<mousedown>': function(e) {
        var me = this;
        var current = $(e.current);
        var startX = parseInt(current.css('left'), 10);
        var startY = parseInt(current.css('top'), 10);
        me.beginDrag(e, e.current, function(event, pos) {
            var offsetY = event.pageY - pos.pageY;
            var offsetX = event.pageX - pos.pageX;
            offsetY += startY;
            if (offsetY <= -6) offsetY = -6;
            else if (offsetY >= 190) offsetY = 190;

            offsetX += startX;

            if (offsetX <= -6) offsetX = -6;
            else if (offsetX >= 190) offsetX = 190;
            current.css({
                top: offsetY,
                left: offsetX
            });
            var s = (offsetX + 6) / 196;
            var v = (196 - (offsetY + 6)) / 196;
            me.setHSV({
                h: me.$hsv.h,
                s: s,
                v: v
            });
        });
    },
    'slideClick<click>': function(e) {
        var me = this,
            offset = $(e.current).offset(),
            top = e.pageY - offset.top,
            h = top / 196 * 360;
        me.setHSV({
            h: h,
            s: me.$hsv.s,
            v: me.$hsv.v
        });
    },
    'colorZoneClick<click>': function(e) {
        var me = this,
            offset = $(e.current).offset(),
            left = e.pageX - offset.left,
            top = e.pageY - offset.top,
            s = left / 196,
            v = (196 - top) / 196;
        me.setHSV({
            h: me.$hsv.h,
            s: s,
            v: v
        });
    },
    'pickShortcuts<click>': function(e) {
        this.setColor(e.params.color);
        $(e.current).addClass(CSSNames.selected);
    },
    'enter<click>': function() {
        var me = this;
        var ipt = $('#val_' + me.id);
        if (me.$picked) {
            Magix.toTry(me.$picked, {
                color: ipt.val()
            });
        }
        me.hide();
    }
}, {
    show: function(view, ops) {
        var id = ops.ownerNodeId;
        id = 'cp_' + id;
        var vf = Magix.Vframe.get(id);
        if (!vf) {
            $('body').append('<div id="' + id + '" />');
            view.owner.mountVframe(id, '@moduleId', ops);
        } else {
            vf.invoke('show');
        }
    }
});