define('coms/colorpicker/index',['magix','$','../bases/picker'],function(require){
/*Magix ,$ ,Picker */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Picker = require('../bases/picker');
Magix.applyStyle('mp-13c',".mp-13c-cnt{padding:10px}.mp-13c-shortcuts{height:59px;border:1px solid #000;width:223px;overflow:hidden}.mp-13c-shortcuts ul{width:226px;zoom:1}.mp-13c-shortcuts ul:after,.mp-13c-shortcuts ul:before{display:table;content:\"\"}.mp-13c-shortcuts ul:after{clear:both}.mp-13c-shortcuts li{border:1px solid #000;float:left;width:13px;height:14px;line-height:14px;margin:-1px 0 0 -1px;background-color:red;display:inline}.mp-13c-shortcuts li.mp-13c-selected{width:9px;height:10px;margin:1px 2px 2px 1px;font-size:10px;line-height:10px;overflow:hidden}.mp-13c-body{margin:10px 0;height:200px}.mp-13c-cpicker-wrapper{position:relative;float:left}.mp-13c-cpicker{width:196px;height:196px}.mp-13c-cpicker-indicator{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:6px;border:3px solid #888}.mp-13c-slide-wrapper{position:relative;float:left;margin-left:10px}.mp-13c-slide{width:20px;height:196px}.mp-13c-slide-indicator{position:absolute;left:4px;top:-8px;border:8px solid transparent;border-right-color:#888;width:0;height:0}.mp-13c-foot{height:25px}.mp-13c-foot-btn{vertical-align:middle}.mp-13c-foot input{margin-right:5px}.mp-13c-bgcolor,.mp-13c-foot input{width:60px;vertical-align:middle}.mp-13c-bgcolor{height:23px;line-height:23px;display:inline-block;margin-right:10px;border:1px solid #ddd}");
var GraphicsType = (window.SVGAngle || document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1') ? 'SVG' : 'VML');
var RenderSVG = function(picker, slide) {
    slide.append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"100%\" height=\"100%\">\n    <defs>\n        <linearGradient id=\"gradient-hsv\" x1=\"0%\" y1=\"100%\" x2=\"0%\" y2=\"0%\">\n            <stop offset=\"0%\" stop-color=\"#FF0000\" stop-opacity=\"1\"></stop>\n            <stop offset=\"13%\" stop-color=\"#FF00FF\" stop-opacity=\"1\"></stop>\n            <stop offset=\"25%\" stop-color=\"#8000FF\" stop-opacity=\"1\"></stop>\n            <stop offset=\"38%\" stop-color=\"#0040FF\" stop-opacity=\"1\"></stop>\n            <stop offset=\"50%\" stop-color=\"#00FFFF\" stop-opacity=\"1\"></stop>\n            <stop offset=\"63%\" stop-color=\"#00FF40\" stop-opacity=\"1\"></stop>\n            <stop offset=\"75%\" stop-color=\"#0BED00\" stop-opacity=\"1\"></stop>\n            <stop offset=\"88%\" stop-color=\"#FFFF00\" stop-opacity=\"1\"></stop>\n            <stop offset=\"100%\" stop-color=\"#FF0000\" stop-opacity=\"1\"></stop>\n        </linearGradient>\n    </defs>\n    <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\" fill=\"url(#gradient-hsv)\"></rect>\n</svg>");
    picker.append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"100%\" height=\"100%\">\n    <defs>\n        <lineargradient id=\"gradient-black\" x1=\"0%\" y1=\"100%\" x2=\"0%\" y2=\"0%\">\n            <stop offset=\"0%\" stop-color=\"#000000\" stop-opacity=\"1\"></stop>\n            <stop offset=\"100%\" stop-color=\"#CC9A81\" stop-opacity=\"0\"></stop>\n        </lineargradient>\n        <lineargradient id=\"gradient-white\" x1=\"0%\" y1=\"100%\" x2=\"100%\" y2=\"100%\">\n            <stop offset=\"0%\" stop-color=\"#FFFFFF\" stop-opacity=\"1\"></stop>\n            <stop offset=\"100%\" stop-color=\"#CC9A81\" stop-opacity=\"0\"></stop>\n        </lineargradient>\n    </defs>\n    <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\" fill=\"url(#gradient-white)\"></rect>\n    <rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\" fill=\"url(#gradient-black)\"></rect>\n</svg>");
};
var RenderVML = function(picker, slide) {
    if (!document.namespaces.mxv) {
        document.namespaces.add('mxv', 'urn:schemas-microsoft-com:vml', '#default#VML');
    }
    slide.html("<div style=\"position: relative; width: 100%; height: 100%\">\n    <mxv:rect style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%\" stroked=\"f\" filled=\"t\">\n        <mxv:fill type=\"gradient\" method=\"none\" angle=\"0\" color=\"red\" color2=\"red\" colors=\"8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow\">\n        </mxv:fill>\n    </mxv:rect>\n</div>");
    picker.html("<div style=\"position: relative; width: 100%; height: 100%\">\n    <mxv:rect style=\"position: absolute; left: -1px; top: -1px; width: 101%; height: 101%\" stroked=\"f\" filled=\"t\">\n        <mxv:fill type=\"gradient\" method=\"none\" angle=\"270\" color=\"#FFFFFF\" opacity=\"100%\" color2=\"#CC9A81\" o:opacity2=\"0%\"></mxv:fill>\n    </mxv:rect>\n    <mxv:rect style=\"position: absolute; left: 0px; top: 0px; width: 100%; height: 101%\" stroked=\"f\" filled=\"t\">\n        <mxv:fill type=\"gradient\" method=\"none\" angle=\"0\" color=\"#000000\" opacity=\"100%\" color2=\"#CC9A81\" o:opacity2=\"0%\"></mxv:fill>\n    </mxv:rect>\n</div>");
};
var CSSNames = {"selected":"mp-13c-selected","cnt":"mp-13c-cnt"};
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
return Picker.extend({
    tmpl: "<div class=\"mp-13c-shortcuts\" id=\"shortcuts_<%=id%>\"><ul><%for(var i=0;i<shortcuts.length;i++){%><li id=\"sc_<%=shortcuts[i]%>_<%=id%>\" style=\"background:#<%=shortcuts[i]%>\" mx-click=\"pickShortcuts({color:'#<%=shortcuts[i]%>'})\"></li><%}%></ul></div><div class=\"mp-13c-body\"><div class=\"mp-13c-cpicker-wrapper\"><div class=\"mp-13c-cpicker\" id=\"cpicker_<%=id%>\" mx-click=\"colorZoneClick()\"></div><div class=\"mp-13c-cpicker-indicator\" id=\"ph_<%=id%>\" mx-mousedown=\"dragPicker()\"></div></div><div class=\"mp-13c-slide-wrapper\"><div class=\"mp-13c-slide\" id=\"slide_<%=id%>\" mx-click=\"slideClick()\"></div><div class=\"mp-13c-slide-indicator\" mx-mousedown=\"dragSlide();\" id=\"sh_<%=id%>\"></div></div></div><div class=\"mp-13c-foot\"><span class=\"mp-13c-bgcolor\" id=\"bgcolor_<%=id%>\"></span> <input class=\"input\" id=\"val_<%=id%>\"/> <button class=\"btn btn-size25 mp-13c-foot-btn\" mx-click=\"enter();\">确定</button></div>",
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
            view.owner.mountVframe(id, 'coms/colorpicker/index', ops);
        } else {
            vf.invoke('show');
        }
    }
});
});