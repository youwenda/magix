/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var BigImg = require('./partials/sdk-bigimg');
Magix.applyStyle('@sdk.css');
var CSSNames = 'names@sdk.css';
var Items = [{
    id: '6',
    name: '横  幅',
    img: 'https://gw.alicdn.com/tps/TB1_14zLVXXXXavXXXXXXXXXXXX-64-114.jpg',
    bigImg: 'https://gw.alicdn.com/tps/TB1hgB0LVXXXXbMXFXXXXXXXXXX-1080-1920.jpg',
    description: 'H5banner（横幅）推广，不同于传统native banner仅支持图片和标准样式，H5 banner支持图片文字等物料信息通过webview渲染，多形态的展现。'
}, {
    id: '15',
    name: '全/插屏',
    img: 'https://gw.alicdn.com/tps/TB144pXLVXXXXcLXVXXXXXXXXXX-64-114.jpg',
    bigImg: 'https://gw.alicdn.com/tps/TB1jNlPLVXXXXXUaXXXXXXXXXXX-640-1136.png',
    description: '全/插屏推广会弹出一个窗口来展示推广内容，尺寸会随着屏幕的变化自适应。可以选择是否有蒙版，样式也可多种多样。H5插屏推广所展示的为创意推广内容。'
}, {
    id: '9',
    name: '开  屏',
    img: 'https://gw.alicdn.com/tps/TB16iI.LFXXXXXHaXXXXXXXXXXX-64-114.jpg',
    bigImg: 'https://gw.alicdn.com/tps/TB1C3xLLVXXXXbUaXXXXXXXXXXX-1080-1920.jpg',
    description: '用户启动应用时，紧接着启动画面出现的推广样式。适合品牌推广展示。推广显示时长和进出动画的样式均可自主设定。'
}, {
    id: '43',
    name: '焦点图',
    img: 'https://gw.alicdn.com/tps/TB1CsByLVXXXXadXXXXXXXXXXXX-64-114.jpg',
    bigImg: 'https://gw.alicdn.com/tps/TB1RIKcLVXXXXa1XXXXXXXXXXXX-1080-1920.jpg',
    description: ' 新闻、视频等app常用的样式，通常在顶部。图片会自动的轮播，也可以由用户用手触动轮播。可以推应用也可以推网页。'
}, {
    id: '12',
    name: '信息流',
    img: 'https://gw.alicdn.com/tps/TB1RzdiLVXXXXb_XFXXXXXXXXXX-64-114.jpg',
    bigImg: 'https://gw.alicdn.com/tps/TB15ehNLVXXXXaxaXXXXXXXXXXX-640-1136.png',
    description: ' 信息流可以包含多种样式，例如标题大图、小图描述、小图排列等。 标题大图是以一张大图样式展示推广内容，会包含标题和图片； 小图描述是在左边展示图片，右边展示推广内容相关信息； 小图排列推广内容通过几张小图图片并列展示。'
}];
var ItemsMap = Magix.toMap(Items, 'id');

module.exports = Magix.View.extend({
    tmpl: '@sdk.html',
    ctor: function() {
        var me = this;
        me.on('destroy', function() {
            BigImg.destroy();
        });
    },
    render: function() {
        var me = this;
        me.data.set({
            id: me.id,
            items: Items,
            selected: []
        }).digest();
    },
    'store<click>': function(e) {
        var me = this;
        var data = me.data;
        var selected = data.get('selected');
        if (e.current.checked) {
            selected.push(ItemsMap[e.params.id]);
        } else {
            for (var i = selected.length - 1; i >= 0; i--) {
                if (selected[i].id == e.params.id) {
                    selected.splice(i, 1);
                    break;
                }
            }
        }
        data.digest();
    },
    'remove<click>': function(e) {
        var me = this;
        e.preventDefault();
        var data = me.data;
        var selected = data.get('selected');
        var info = selected[e.params.index];
        Magix.node('cb_' + me.id + '_' + info.id).checked = false;
        selected.splice(e.params.index, 1);
        data.digest();
    },
    'hoverBig<mouseout,mouseover>': function(e) {
        var flag = !Magix.inside(e.relatedTarget, e.current);
        if (flag) {
            if (e.type == 'mouseover') {
                BigImg.show(this, e.params.img, e.current);
            } else {
                BigImg.hide();
            }
        }
    }
});