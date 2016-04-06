define("coms/dropdown/index",['magix','$','../bases/monitor'],function(require){
/*Magix ,$ ,Monitor */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-740',".mp-740-li{height:21px;line-height:21px;padding:2px 8px;border-radius:2px;user-select:none;-webkit-user-select:none;-moz-user-select:none;cursor:default}.mp-740-over{background-color:#6363e6;background-image:-webkit-linear-gradient(top,#1b87e3 2%,#6363e6 98%);background-image:linear-gradient(180deg,#1b87e3 2%,#6363e6 98%);color:#ecf2f8;text-shadow:0 -1px 0 rgba(0,0,0,.05)}.mp-740-selected{color:#ccc}.mp-740-header{position:relative;height:18px;line-height:18px;border:1px solid #ccc;border-radius:2px;padding:2px 8px 3px;user-select:none;-webkit-user-select:none;-moz-user-select:none;cursor:default}.mp-740-icon{position:absolute;right:5px;top:2px}.mp-740-ib{display:inline-block}.mp-740-header-active{color:#eee}.mp-740-list{max-height:200px;overflow:auto}.mp-740-items{position:absolute;z-index:1;padding:4px;border-radius:2px;background-color:#fff;color:#474747;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098)}.mp-740-none{display:none}.mp-740-ipt{border-radius:10px;margin-bottom:10px}");
var CSSNames = {"li":"mp-740-li","over":"mp-740-over","selected":"mp-740-selected","header":"mp-740-header","icon":"mp-740-icon","ib":"mp-740-ib","header-active":"mp-740-header-active","list":"mp-740-list","items":"mp-740-items","none":"mp-740-none","ipt":"mp-740-ipt"}
var Monitor = require('../bases/monitor');
return Magix.View.extend({
    tmpl: "<div mx-click=\"toggle();\"\n     class=\"mp-740-header\"\n     id=\"header_<%=id%>\"\n     style=\"width:<%=width%>px\" mx-guid=\"x8e01-\u001f\">@1-\u001f</div><div id=\"list_<%=id%>\" class=\"mp-740-items mp-740-none\">\n    <%if(search){%>\n    <input class=\"input mp-740-ipt\" mx-guid=\"x8e02-\u001f\" mx-keyup=\"search()\" mx-paste=\"search()\" style=\"width:<%=width-10%>px\" />\n    <%}%>\n    <ul class=\"mp-740-list\" mx-guid=\"x8e03-\u001f\" style=\"width:<%=width+9%>px;<%if(height){%>max-height:<%=height%>px;overflow:auto<%}%>\">@2-\u001f</ul></div>",
tmplData:[{"guid":1,"keys":["titleText","width"],"tmpl":"<span class=\"ellipsis mp-740-ib\" style=\"width:<%=width-15%>px\" id=\"title_<%=id%>\" title=\"<%=titleText%>\">\n            <%=titleText%>\n        </span><span class=\"mp-740-icon\" id=\"icon_<%=id%>\">⇩</span>","selector":"div[mx-guid=\"x8e01-\u001f\"]","attrs":[{"n":"style","v":"width:<%=width%>px"}]},{"guid":2,"keys":["list","selected","width","height"],"tmpl":"\n        <%for(var i=0,one;i<list.length;i++){%>\n        <%one=list[i]%>\n        <li mx-mouseover=\"hover()\" mx-mouseout=\"hover();\" mx-click=\"select({id:'<%=one.id%>'})\" class=\"mp-740-li ellipsis<%if(selected==one.id){%> mp-740-selected<%}%>\" title=\"<%=one.text%>\">\n        <%=one.text%>\n        </li>\n        <%}%>\n    ","selector":"ul[mx-guid=\"x8e03-\u001f\"]","attrs":[{"n":"style","v":"width:<%=width+9%>px;<%if(height){%>max-height:<%=height%>px;overflow:auto<%}%>"}]},{"keys":["width"],"selector":"input[mx-guid=\"x8e02-\u001f\"]","attrs":[{"n":"style","v":"width:<%=width-10%>px"}]}],
    ctor: function(extra) {
        var me = this;
        Monitor.setup();
        me.on('destroy', Monitor.teardown);
        me.$source = extra.source;
        me.$selected = extra.selected;
    },
    inside: function(node) {
        var me = this;
        var inside = Magix.inside(node, me.id);
        return inside;
    },
    update: function(ops) {
        var me = this;
        var map = Magix.toMap(ops.list, 'id');
        if (!ops.selected || !map[ops.selected]) {
            ops.selected = ops.list[0].id;
        }
        me.$list = ops.list;
        me.$picked = ops.picked;
        var val = me.data.get('iptValue');
        var list = me.$list;
        var data = me.data;
        data.set({
            search: ops.search,
            width: ops.width || 150,
            height: ops.height || 0,
            map: map,
            id: me.id,
            titleText: map[ops.selected].text,
            selected: ops.selected
        });
        if (val) {
            me.search(val, function(list) {
                data.set({
                    list: list
                }).digest();
            });
        } else {
            data.set({
                list: list
            }).digest();
        }
    },
    render: function() {
        var me = this;
        if (me.$source == 'script') {
            var html = $.trim($('#' + me.id + ' script').html());
            var list = JSON.parse(html);
            me.update({
                list: list,
                selected: me.$selected
            });
        } else {
            me.endUpdate();
        }
    },
    hide: function(items) {
        var me = this;
        if (me.$shown) {
            me.$shown = false;
            Monitor.remove(me);
            items = items || $('#list_' + me.id);
            items.addClass(CSSNames.none);
            var header = $('#header_' + me.id);
            header.removeClass(CSSNames['header-active']);
            var icon = $('#icon_' + me.id);
            icon.html('⇩');
        }
    },
    show: function(items) {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            Monitor.add(me);
            var doc = $(document);
            var docHeight = doc.height();
            items = items || $('#list_' + me.id);
            items.removeClass(CSSNames.none);
            var header = $('#header_' + me.id);
            header.addClass(CSSNames['header-active']);
            var icon = $('#icon_' + me.id);
            icon.html('⇧');
            var itemsHeight = items.outerHeight();
            if (itemsHeight + items.offset().top > docHeight) {
                items.css({
                    marginTop: -(itemsHeight + header.outerHeight())
                });
            }
            $('#' + me.id).trigger('focusin');
        }
    },
    search: function(val, callback) {
        var me = this;
        clearTimeout(me.$sTimer);
        var srcList = me.$list;
        var newList = [];
        var index = 0;
        var max = srcList.length;
        var go = function() {
            if (index < max) {
                var end = Math.min(index + 400, max);
                for (var i = index, li; i < end; i++) {
                    li = srcList[i];
                    if (li.text.indexOf(val) >= 0) {
                        newList.push(li);
                    }
                }
                index = end;
                me.$sTimer = setTimeout(go, 20);
            } else {
                callback(newList);
            }
        };
        go();
    },
    'hover<mouseout,mouseover>': function(e) {
        var node = $(e.current);
        node[e.type == 'mouseout' ? 'removeClass' : 'addClass'](CSSNames.over);
    },
    'toggle<click>': function() {
        var me = this;
        var items = $('#list_' + me.id);
        if (items.hasClass(CSSNames.none)) {
            me.show(items);
        } else {
            me.hide(items);
        }
    },
    'select<click>': function(e) {
        var me = this;
        var id = e.params.id;
        var data = me.data;
        var selected = data.get('selected');
        if (selected != id) {
            var map = data.get('map');
            data.set({
                selected: id,
                titleText: map[id].text
            }).digest();
            if (me.$picked) {
                Magix.toTry(me.$picked, [map[id]]);
            }
        }
        me.hide();
    },
    'search<keyup,paste>': function(e) {
        var me = this;
        setTimeout(me.wrapAsync(function() {//ie8 paste后并不能立即获取到input value
            var val = e.current.value;
            var data = me.data;
            var lastVal = data.get('iptValue');
            if (val != lastVal) {
                me.search(val, function(list) {
                    data.set({
                        list: list,
                        iptValue: val
                    }).digest();
                });
            }
        }), 0);
    }
});
});