define('coms/inputag/tree',['magix','$','../bases/monitor'],function(require){
/*Magix ,$ ,Monitor */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-9ad',".mp-9ad-tags{background:#fff;border:1px solid #ddd;width:330px;cursor:text;padding:2px;position:relative;overflow:hidden}.mp-9ad-ipt{height:16px;line-height:16px;border:none;outline:none;width:100%;font-size:12px}.mp-9ad-fl{float:left}.mp-9ad-item{display:inline-block;border-radius:4px;background:#eee;margin:1px 2px}.mp-9ad-item,.mp-9ad-name{overflow:hidden}.mp-9ad-name{float:left;border-right:1px solid #fff;padding:2px 4px;max-width:140px}.mp-9ad-delete{width:20px;float:left;height:18px;line-height:18px;text-align:center;cursor:pointer}.mp-9ad-none{display:none}.mp-9ad-tree{width:336px;overflow:auto;position:absolute;background:#eee;z-index:1}.mp-9ad-indent{margin-left:22px;border-left:1px dotted #ccc}.mp-9ad-li{padding:0 4px}.mp-9ad-icon,.mp-9ad-li{line-height:22px}.mp-9ad-icon{width:22px;height:22px;float:left;text-align:center;font-weight:800}.mp-9ad-cp{cursor:pointer}.mp-9ad-tree-name{padding:4px;border-radius:5px}.mp-9ad-over{background-color:#6363e6;background-image:-webkit-linear-gradient(top,#1b87e3 2%,#6363e6 98%);background-image:linear-gradient(180deg,#1b87e3 2%,#6363e6 98%);color:#ecf2f8;text-shadow:0 -1px 0 rgba(0,0,0,.05)}");
var CSSNames = {"tags":"mp-9ad-tags","ipt":"mp-9ad-ipt","fl":"mp-9ad-fl","item":"mp-9ad-item","name":"mp-9ad-name","delete":"mp-9ad-delete","none":"mp-9ad-none","tree":"mp-9ad-tree","indent":"mp-9ad-indent","li":"mp-9ad-li","icon":"mp-9ad-icon","cp":"mp-9ad-cp","tree-name":"mp-9ad-tree-name","over":"mp-9ad-over"};
var $ = require('$');
var Monitor = require('../bases/monitor');
return Magix.View.extend({
    tmpl: "<div class=\"mp-9ad-tags clearfix\" id=\"tags_<%=id%>\" mx-click=\"showList()\" mx-guid=\"xfe71-\u001f\">@1-\u001f</div><div class=\"mp-9ad-tree mp-9ad-none\" id=\"list_<%=id%>\"></div>",
tmplData:[{"guid":1,"keys":["selected"],"tmpl":"<%for(var i=0;i<selected.length;i++){%><div class=\"mp-9ad-item\" id=\"si_<%=i%>_<%=id%>\" title=\"<%=selected[i]%>\"><div class=\"mp-9ad-name ellipsis\"><%=selected[i]%></div><div class=\"mp-9ad-delete\" mx-click=\"remove({index:<%=i%>})\">x</div></div><%}%><div class=\"mp-9ad-item\" id=\"iptw_<%=id%>\"><input id=\"ipt_<%=id%>\" class=\"mp-9ad-ipt\" mx-keyup=\"search()\" mx-paste=\"search()\" value=\"<%=iptValue%>\"/></div>","selector":"div[mx-guid=\"xfe71-\u001f\"]"}],
    ctor: function(extra) {
        Monitor.setup();
        var me = this;
        me.on('destroy', Monitor.teardown);
        me.$list = extra.list;
        me.$selected = extra.selected;
    },
    inside: function(node) {
        var me = this;
        return Magix.inside(node, 'list_' + me.id) ||
            Magix.inside(node, 'tags_' + me.id);
    },
    render: function() {
        var me = this;
        me.data.set({
            iptValue: '',
            id: me.id,
            selected: me.$selected
        }).digest();
        var info = me.listToTree(me.$list, 'id', 'pId');
        me.$info = info;
        me.owner.mountVframe('list_' + me.id, 'coms/inputag/branch', {
            id: 'id',
            pId: 'pId',
            text: 'text'
        });
        me.updateInputWidth();
    },
    getInfo: function() {
        var me = this;
        return {
            list: me.$info.list,
            onClick: function(e) {
                var data = me.data;
                var text = e.text;
                var selected = data.get('selected');
                selected.push(text);
                data.set({
                    selected: selected
                }).digest();
                me.updateInputWidth();
                me.focusInput();
            }
        };
    },
    hide: function() {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            $('#list_' + me.id).addClass(CSSNames.none);
        }
    },
    updateInputWidth: function() {
        var me = this;
        var last = $('#iptw_' + me.id);
        last.width(20);
        var left = last.position().left;
        var width = 330 - left - 30;
        last.width(width > 20 ? width : 20);
    },
    focusInput: function() {
        var ipt = Magix.node('ipt_' + this.id);
        ipt.select();
        if (ipt.setSelectionRange) {
            ipt.setSelectionRange(ipt.value.length, ipt.value.length);
        }
        ipt.focus();
    },
    'showList<click>': function() {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            $('#list_' + me.id).removeClass(CSSNames.none);
        }
        me.focusInput();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        clearTimeout(me.$timer);
        var data = me.data;
        var lastValue = data.get('iptValue');
        me.$timer = setTimeout(me.wrapAsync(function() {
            var newList = [];
            var val = e.current.value;
            var list = me.$list;
            if (val != data.get('iptValue')) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].text.indexOf(val) >= 0) {
                        newList.push(list[i]);
                    }
                }
                data.set({
                    iptValue: val,
                    list: newList
                }).digest();
            }
        }), 150);

        if (e.type == 'keyup' && e.keyCode == 8 && !lastValue) {
            var selected = me.data.get('selected');
            selected.pop();
            me.data.digest();
            me.updateInputWidth();
            me.focusInput();
        }
    },
    'remove<click>': function(e) {
        e.stopPropagation();
        var me = this;
        var selected = me.data.get('selected');
        selected.splice(e.params.index, 1);
        me.data.digest({
            selected: selected
        });
        me.hide();
        me.updateInputWidth();
    }
});
});