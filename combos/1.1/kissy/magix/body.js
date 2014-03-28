/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add('magix/body', function(S, Magix) {
    var Has = Magix.has;
var Mix = Magix.mix;
//依赖类库才能支持冒泡的事件
var DependLibEvents = {};
var RootNode = document.body;
var RootEvents = {};
var MxEvtSplit = String.fromCharCode(26);

var MxIgnore = 'mx-ei';
var MxOwner = 'mx-owner';
var AddEvent = 'addEventListener';
var RemoveEvent = 'removeEventListener';
var W3C = RootNode[AddEvent];

var TypesRegCache = {};
var IdCounter = 1 << 16;
var On = 'on';
var Comma = ',';

var IdIt = function(dom) {
    return dom.id || (dom.id = 'mx-e-' + (IdCounter--));
};
var GetSetAttribute = function(dom, attrKey, attrVal) {
    if (attrVal) {
        dom.setAttribute(attrKey, attrVal);
    } else {
        attrVal = dom.getAttribute(attrKey);
    }
    return attrVal;
};
var PreventDefault = function() {
    this.returnValue = false;
};
var StopPropagation = function() {
    this.cancelBubble = true;
};
var VOM;
var Body = {
    lib: Magix.unimpl,
    special: function(events) {
        Mix(DependLibEvents, events);
    },
    process: function(e) {
        e = e || window.event;
        if (e && !e[On]) {
            var target = e.target || e.srcElement || RootNode; //原生事件对象Cordova没有target对象
            e[On] = 1;
            //var cTarget = e.currentTarget; //只处理类库(比如KISSY)处理后的currentTarget
            //if (cTarget && cTarget != RootNode) target = cTarget; //类库处理后代理事件的currentTarget并不是根节点
            while (target && target.nodeType != 1) {
                target = target.parentNode;
            }
            var current = target;
            var eventType = e.type;
            var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp(Comma + eventType + '(?:,|$)'));
            //
            if (!eventReg.test(GetSetAttribute(target, MxIgnore))) {
                var type = 'mx-' + eventType;
                var info;
                var ignore;
                var arr = [];

                while (current && current != RootNode) { //找事件附近有mx[a-z]+事件的DOM节点
                    info = GetSetAttribute(current, type);
                    ignore = GetSetAttribute(current, MxIgnore); //current.getAttribute(MxIgnore);
                    if (info || eventReg.test(ignore)) {
                        break;
                    } else {
                        arr.push(current);
                        current = current.parentNode;
                    }
                }
                if (info) { //有事件
                    //找处理事件的vframe
                    var vId;
                    var ts = info.split(MxEvtSplit);
                    if (ts.length > 1) {
                        vId = ts[0];
                        info = ts.pop();
                    }
                    vId = vId || GetSetAttribute(current, MxOwner);
                    if (!vId) { //如果没有则找最近的vframe
                        var begin = current;
                        var vfs = VOM.all();
                        while (begin) {
                            if (Has(vfs, begin.id)) {
                                GetSetAttribute(current, MxOwner, vId = begin.id);
                                break;
                            }
                            begin = begin.parentNode;
                        }
                    }
                    if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理

                        var vframe = VOM.get(vId);
                        var view = vframe && vframe.view;
                        if (view) {
                            if (!W3C) {
                                e.preventDefault = PreventDefault;
                                e.stopPropagation = StopPropagation;
                            }
                            view.pEvt({
                                info: info,
                                se: e,
                                st: eventType,
                                tId: IdIt(target),
                                cId: IdIt(current)
                            });
                        }
                    } else {
                        throw Error('bad:' + info);
                    }
                } else {
                    var node;
                    while (arr.length) {
                        node = arr.shift();
                        ignore = GetSetAttribute(node, MxIgnore) || On;
                        if (!eventReg.test(ignore)) {
                            ignore = ignore + Comma + eventType;
                            GetSetAttribute(node, MxIgnore, ignore);
                        }
                    }
                }
            }
        }
    },
    act: function(type, remove, vom) {
        var counter = RootEvents[type] || 0;
        var step = counter > 0 ? 1 : 0;
        var fn = Body.process;
        counter += remove ? -step : step;
        if (!counter) {
            if (vom) {
                VOM = vom;
            }
            var lib = DependLibEvents[type];
            if (lib) {
                Body.lib(RootNode, type, remove, fn);
            } else if (W3C) { //chrome 模拟touch事件时，需要使用addEventListener方式添加，不能使用node.onx的形式
                RootNode[remove ? RemoveEvent : AddEvent](type, fn, false);
            } else {
                RootNode[On + type] = remove ? null : fn;
            }
            if (!remove) {
                counter = 1;
            }
        }
        RootEvents[type] = counter;
    }
};
    var Unbubbles = {
        change: 1,
        submit: 1,
        focusin: 1,
        focusout: 1,
        mouseenter: 2,
        mouseleave: 2,
        mousewheel: 1
    };
    Body.special(Unbubbles);
    Body.lib = function(node, type, remove, cb) {
        S.use('event', function(S, SE) {
            var flag = Unbubbles[type];
            if (flag == 1) {
                flag = remove ? 'detach' : 'on';
                SE[flag](node, type, cb);
            } else {
                flag = (remove ? 'un' : '') + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            }
        });
    };
    return Body;
}, {
    requires: ['magix/magix']
});