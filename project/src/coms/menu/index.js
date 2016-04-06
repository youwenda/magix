define("coms/menu/index",['magix','$'],function(require){
/*Magix ,$ */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
Magix.applyStyle('mp-e65',".mp-e65-items li{height:30px;line-height:30px;padding:0 8px;cursor:default;border-radius:4px}.mp-e65-items li.mp-e65-over{background-color:#197de1;background-image:-webkit-linear-gradient(top,#1b87e3 2%,#166ed5 98%);background-image:linear-gradient(180deg,#1b87e3 2%,#166ed5 98%);color:#ecf2f8;text-shadow:0 -1px 0 rgba(0,0,0,.05)}.mp-e65-container{transition:margin-left .25s;-moz-transition:margin-left .25s;-webkit-transition:margin-left .25s;-o-transition:margin-left .25s}.mp-e65-items li .mp-e65-more{float:right}.mp-e65-items{padding:4px;border-radius:4px;background-color:#fff;color:#474747;box-shadow:0 4px 10px 0 rgba(0,0,0,.1),0 3px 5px 0 rgba(0,0,0,.05),0 0 0 1px rgba(0,0,0,.09098);-webkit-backface-visibility:hidden;backface-visibility:hidden;user-select:none;-webkit-user-select:none;-moz-user-select:none;cursor:default}.mp-e65-away-right{margin-left:10px}.mp-e65-away-left{margin-left:-10px}");
var CSSNames = {"items":"mp-e65-items","over":"mp-e65-over","container":"mp-e65-container","more":"mp-e65-more","away-right":"mp-e65-away-right","away-left":"mp-e65-away-left"}
var Instance;
var Menu = Magix.View.extend({
    tmpl: "<div style=\"width:<%=width%>px;<%if(isChild){%>position:absolute;left:-1000000px<%}%>\" mx-mouseover=\"over();\" class=\"mp-e65-container<%if(isChild){%> away<%}%>\" mx-contextmenu=\"prevent()\" mx-guid=\"x1bd1-\u001f\">@1-\u001f</div>",
tmplData:[{"guid":1,"keys":["width"],"tmpl":"<ul class=\"mp-e65-items\" mx-guid=\"x1bd2-\u001f\">@2-\u001f</ul>","selector":"div[mx-guid=\"x1bd1-\u001f\"]","attrs":[{"n":"style","v":"width:<%=width%>px;<%if(isChild){%>position:absolute;left:-1000000px<%}%>"}]},{"guid":2,"keys":["list","viewId"],"tmpl":"\n        <%for(var i=0,one;i<list.length;i++){%>\n        <%one=list[i]%>\n        <li mx-mouseover=\"hover({id:'<%=one.id%>'})\" mx-mouseout=\"hover({id:'<%=one.id%>'});\"<%if(!one.children){%> mx-click=\"select({id:'<%=one.id%>'})\"<%}%> class=\"ellipsis\" title=\"<%=one.text%>\" id=\"<%=viewId%>_<%=one.id%>\"><i class=\"iconfont\">&#xe64b;</i><%=one.text%>\n            <%if(one.children){%>\n                <span class=\"mp-e65-more\"> ➤</span>\n            <%}%>\n        </li>\n        <%}%>\n    ","selector":"ul[mx-guid=\"x1bd2-\u001f\"]","attrs":[],"pKeys":["width"]}],
    ctor: function() {
        var me = this;
        me.data.on('changed', function(e) {
            if (e.keys.width) {
                var cnt = $('#' + me.id + '>div');
                cnt.css({
                    width: this.get('width')
                });
            }
        });
        me.on('destroy', function() {
            if (me.data.get('isChild'))
                $('#' + me.id).remove();
        });
    },
    inside: function(node) {
        var me = this;
        var inside = Magix.inside(node, me.id);
        if (!inside) {
            var children = me.owner.children();
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                inside = child.invoke('inside', node);
                if (inside) break;
            }
        }
        return inside;
    },
    update: function(ops) {
        var me = this;
        var info = ops;
        if (!ops.map) {
            info = Menu.process(ops.list);
        }
        me.$map = info.map;
        me.$list = info.list;
        if (ops.picked)
            me.$picked = ops.picked;
        if (ops.root)
            me.$root = ops.root;
        me.$pId = ops.pId;
        me.$pNode = ops.pNode;
        me.data.set({
            viewId: me.id,
            isChild: ops.isChild || ops.pNode,
            list: info.list,
            width: ops.width || 200
        }).digest();

        if (!me.$pNode) {
            me.$shown = true;
            var hideWatch = function(e) {
                if (me.$shown) {
                    if (e.type == 'resize' || !me.inside(e.target)) {
                        Magix.toTry(me.hide, [], me);
                    }
                }
            };
            var doc = $(document);
            var win = $(window);
            win.on('resize', hideWatch);
            doc.on('mousedown', hideWatch);
            me.on('destroy', function() {
                win.off('resize', hideWatch);
                doc.off('mousedown', hideWatch);
            });
        }
    },
    render: function() {
        var me = this;
        me.endUpdate();
    },
    show: function(e, refNode) {
        var me = this;
        if (!me.$shown) {
            me.$shown = true;
            var node = $('#' + me.id + ' div');
            var doc = $(document);
            var left = -1,
                top = -1,
                dock = 'right';
            var width = node.outerWidth();
            var height = node.outerHeight(),
                refWidth = 0,
                refHeight = 0;
            if (refNode) {
                var offset = refNode.offset();
                refWidth = refNode.outerWidth();
                refHeight = refNode.outerHeight();
                left = offset.left + refWidth;
                top = offset.top;
            } else {
                left = e.pageX;
                top = e.pageY;
            }
            if ((left + width) > doc.width()) {
                left = left - width - refWidth;
                dock = 'left';
                if (left < 0) left = 0;
            }
            if ((top + height) > doc.height()) {
                top -= height;
                top += refHeight;
                if (top < 0) top = 0;
            }
            if (refNode) {
                if (dock == 'right') {
                    left -= 10;
                } else {
                    left += 10;
                }
            }
            var root = me.$root || me;
            if (Instance != root) Instance = root;
            if (me.$pNode) {
                node.css({
                    left: left,
                    top: top
                }).addClass(CSSNames['away-' + dock]);
            } else {
                node.css({
                    left: left,
                    top: top
                });
            }
        }
    },
    hide: function() {
        var me = this;
        var children = me.owner.children();
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            child.invoke('hide');
        }
        if (me.$shown && me.$pNode) {
            me.$shown = false;
            var node = $('#' + me.id + ' div');
            node.removeClass(CSSNames['away-left']).removeClass(CSSNames['away-right']);
            node.css({
                left: -100000
            });
            $(me.$pNode).removeClass(CSSNames.over);
        }
    },
    stopHideChild: function(id) {
        clearTimeout(this['timer_' + id]);
    },
    showChild: function(node, id, children) {
        var me = this;
        me['stimer_' + id] = setTimeout(me.wrapAsync(function() {
            var nid = me.id + '_menu_' + id;
            var vf = Magix.Vframe.get(nid);
            if (!vf) {
                $('body').append('<div id="' + nid + '" />');
                vf = me.owner.mountVframe(nid, 'coms/menu/index');
            }
            vf.invoke('update', [{
                pNode: '#' + me.id + '_' + id,
                pId: id,
                map: me.$map,
                list: children,
                root: me.$root || me,
                width: me.data.get('width')
                }], true);
            vf.invoke('show', [null, node], true);
        }), 250);
    },
    hideChild: function(id) {
        var me = this;
        var nid = me.id + '_menu_' + id;
        var vf = Magix.Vframe.get(nid);
        if (vf) {
            me['timer_' + id] = setTimeout(me.wrapAsync(function() {
                vf.invoke('hide');
            }), 50);
        }
    },
    'hover<mouseout,mouseover>': function(e) {
        var me = this;
        var flag = !Magix.inside(e.relatedTarget, e.current);
        if (flag) {
            var node = $(e.current);
            node[e.type == 'mouseout' ? 'removeClass' : 'addClass'](CSSNames.over);
            var id = e.params.id;
            me.hideChild(me.$lastId);
            if (e.type == 'mouseover') {
                var map = me.$map;
                var children = map[id].children;
                if (children) {
                    me.stopHideChild(id);
                    me.showChild(node, id, children);
                    me.$lastId = id;
                }
            } else {
                clearTimeout(me['stimer_' + id]);
            }
        }
    },
    'over<mouseover>': function(e) {
        var me = this;
        var flag = !Magix.inside(e.relatedTarget, e.current);
        if (flag) {
            if (!me.$pNode && Instance != me) {
                if (Instance) Instance.hide();
                //Instance = me;
            }
            if (me.$pNode) {
                $(me.$pNode).addClass(CSSNames.over);
                me.owner.parent().invoke('stopHideChild', [me.$pId]);
            }
        }
    },
    'select<click>': function(e) {
        var me = this;
        var root = me.$root || me;
        if (root.$picked) {
            var info = me.$map[e.params.id];
            Magix.toTry(root.$picked, [info]);
        }
        root.hide();
    },
    'prevent<contextmenu>': function(e) {
        e.preventDefault();
    }
}, {
    process: function(list) {
        if (!list._processed) {
            list._processed = 1;
            var map = {},
                listMap = {},
                rootList = [];
            for (var i = 0, max = list.length; i < max; i++) {
                var one = list[i];
                map[one.id] = one;
                if (listMap[one.id]) {
                    one.children = listMap[one.id];
                }
                if (one.pId) {
                    if (map[one.pId]) {
                        var c = map[one.pId].children || (map[one.pId].children = []);
                        c.push(one);
                    } else {
                        if (!listMap[one.pId]) listMap[one.pId] = [one];
                        else listMap[one.pId].push(one);
                    }
                } else {
                    rootList.push(one);
                }
            }
            list.list = rootList;
            list.map = map;
        }
        return list;
    }
});
return Menu;
});