define("app/views/demos/autocomplete",['magix','../../../coms/bases/monitor','$'],function(require){
/*Magix ,Monitor ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Monitor = require('../../../coms/bases/monitor');
var $ = require('$');
Magix.applyStyle('mp-de4',".mp-de4-wrapper{margin:80px}.mp-de4-search{width:300px}.mp-de4-list{width:318px;overflow:auto;position:absolute;background:#eee}.mp-de4-none{display:none}.mp-de4-item{height:21px;line-height:21px;padding:2px 8px;border-radius:2px;user-select:none;-webkit-user-select:none;-moz-user-select:none;cursor:default}.mp-de4-over{background-color:#6363e6;background-image:-webkit-linear-gradient(top,#1b87e3 2%,#6363e6 98%);background-image:linear-gradient(180deg,#1b87e3 2%,#6363e6 98%);color:#ecf2f8;text-shadow:0 -1px 0 rgba(0,0,0,.05)}");
var CSSNames = {"wrapper":"mp-de4-wrapper","search":"mp-de4-search","list":"mp-de4-list","none":"mp-de4-none","item":"mp-de4-item","over":"mp-de4-over"}
return Magix.View.extend({
    tmpl: "<div class=\"mp-de4-wrapper\"><div class=\"autocomplete\"><input class=\"input mp-de4-search\" mx-click=\"showList()\" id=\"ipt_<%=id%>\" mx-keyup=\"search()\" mx-paste=\"search()\" mx-keydown=\"select()\" /></div><div class=\"mp-de4-list mp-de4-none\" id=\"list_<%=id%>\" mx-mouseout=\"leave()\"><ul mx-guid=\"xd971-\u001f\">@1-\u001f</ul></div></div>",
tmplData:[{"guid":1,"keys":["list"],"tmpl":"\n            <%for(var i=0;i<list.length;i++){%>\n            <li id=\"idx_<%=i%>\" class=\"mp-de4-item ellipsis\" mx-mouseover=\"hover({index:<%=i%>})\" mx-click=\"fill()\" data-text=\"<%=list[i].text%>\"><%=list[i].text%></li>\n            <%}%>\n        ","selector":"ul[mx-guid=\"xd971-\u001f\"]","attrs":[]}],
    ctor: function() {
        Monitor.setup();
        var me = this;
        me.on('destroy', Monitor.teardown);
        me.$sIndex = -1;
        me.data.on('changed', function(e) {
            if (e.keys.list) {
                me.$sIndex = -1;
            }
        });
    },
    render: function() {
        var me = this;
        me.request().all('list', function(err, bag) {
            me.data.set({
                id: me.id,
                list: me.$src = bag.get('data', [])
            }).digest();
        });
    },
    inside: function(node) {
        var me = this;
        return Magix.inside(node, 'list_' + me.id) ||
            Magix.inside(node, 'ipt_' + me.id);
    },
    hide: function() {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            $('#list_' + me.id).addClass(CSSNames.none);
        }
    },
    normalPre: function() {
        var me = this;
        if (me.$sIndex != -1) {
            $('#idx_' + me.$sIndex).removeClass(CSSNames.over);
        }
    },
    highlight: function() {
        var me = this;
        if (me.$sIndex != -1) {
            $('#idx_' + me.$sIndex).addClass(CSSNames.over);
        }
    },
    fillText: function() {
        var me = this;
        var item = $('#idx_' + me.$sIndex);
        var text = item.data('text');
        $('#ipt_' + me.id).val(text);
        me.search(text);
    },
    show: function() {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            $('#list_' + me.id).removeClass(CSSNames.none);
        }
    },
    search: function(value, show) {
        var me = this;
        clearTimeout(me.$timer);
        me.$timer = setTimeout(me.wrapAsync(function() {
            if (value != me.data.get('iptValue')) {
                var newList = [];
                for (var i = 0; i < me.$src.length; i++) {
                    if (me.$src[i].text.indexOf(value) >= 0) {
                        newList.push(me.$src[i]);
                    }
                }
                me.data.set({
                    iptValue: value,
                    list: newList
                }).digest();
                console.log(show, value);
                if (show) {
                    me.show();
                }
            }
        }), 150);
    },
    'showList<click>': function() {
        this.show();
    },
    'hover<mouseover>': function(e) {
        var me = this;
        me.normalPre();
        if (e.type == 'mouseover') {
            me.$sIndex = e.params.index;
            me.highlight();
        }
    },
    'fill<click>': function() {
        var me = this;
        me.fillText();
        me.hide();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        setTimeout(me.wrapAsync(function() {
            if (e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13) {
                me.search(e.current.value, true);
            }
        }), 0);
    },
    'select<keydown>': function(e) {
        var me = this;
        var max = me.data.get('list').length - 1;
        if (max < 0) return;
        if (e.keyCode == 38) { //UP
            if (!me.$shown) me['showList<click>']();
            e.preventDefault();
            me.normalPre();
            me.$sIndex--;
            if (me.$sIndex < 0) {
                me.$sIndex = max;
            }
            me.highlight();
        } else if (e.keyCode == 40) { //DOWN
            if (!me.$shown) me['showList<click>']();
            e.preventDefault();
            me.normalPre();
            me.$sIndex++;
            if (me.$sIndex > max) {
                me.$sIndex = 0;
            }
            me.highlight();
        } else if (e.keyCode == 13) {
            if (me.$sIndex != -1) {
                me.fillText();
                me.hide();
            }
        }
    },
    'leave<mouseout>': function(e) {
        var me = this;
        if (!Magix.inside(e.relatedTarget, e.current)) {
            me.normalPre();
            me.$sIndex = -1;
        }
    }
});
});