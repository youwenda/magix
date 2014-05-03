/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define("magix/body", ["magix/magix"], function(require) {
    var Magix = require("magix/magix");
    var Has = Magix.has;
//依赖类库才能支持冒泡的事件
var RootEvents = {};
var MxEvtSplit = String.fromCharCode(26);

var MxIgnore = 'mx-ei';
var MxOwner = 'mx-owner';
var RootNode = document.body;
var ParentNode = 'parentNode';
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
var Halt = function() {
    this.prevent();
    this.stop();
};
var VOM;
var Body = {
    lib: Magix.unimpl,
    process: function(e) {
        if (e && !e[On]) {
            var target = e.target || e.srcElement || RootNode; //原生事件对象Cordova没有target对象
            e[On] = 1;
            /*
                考虑如ff浏览器支持向e设置属性，但不显示，也有可能后续版本不支持设置属性，需如下修正
                if(!e[On]){
                    var temp=Mix({},e);
                    temp.oe=e;
                    temp.stopPropagation=function(){this.oe.stopPropagation();};
                    temp.preventDefault=function(){this.oe.preventDefault();};
                    e=temp;
                }
             */
            //var cTarget = e.currentTarget; //只处理类库(比如KISSY)处理后的currentTarget
            //if (cTarget && cTarget != RootNode) target = cTarget; //类库处理后代理事件的currentTarget并不是根节点
            while (target && target.nodeType != 1) {
                target = target[ParentNode];
            }
            var current = target;
            var eventType = e.type;
            var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp(Comma + eventType + '(?:,|$)'));
            //
            //if (!eventReg.test(GetSetAttribute(target, MxIgnore))) {
            var type = 'mx-' + eventType;
            var info;
            var ignore;
            var arr = [];

            while (current && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点
                info = GetSetAttribute(current, type);
                ignore = GetSetAttribute(current, MxIgnore); //current.getAttribute(MxIgnore);
                if (info || eventReg.test(ignore)) {
                    break;
                } else {
                    arr.push(current);
                    current = current[ParentNode];
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
                        begin = begin[ParentNode];
                    }
                }
                if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理

                    var vframe = VOM.get(vId);
                    var view = vframe && vframe.view;
                    if (view) {
                        e.currentId = IdIt(current);
                        e.targetId = IdIt(target);
                        e.prevent = e.preventDefault;
                        e.stop = e.stopPropagation;
                        e.halt = Halt;
                        view.pEvt(info, eventType, e);
                    }
                } else {
                    throw Error('bad:' + info);
                }
            } else {
                var node;
                while (arr.length) {
                    node = arr.pop();
                    ignore = GetSetAttribute(node, MxIgnore) || On;
                    if (!eventReg.test(ignore)) {
                        ignore = ignore + Comma + eventType;
                        GetSetAttribute(node, MxIgnore, ignore);
                    }
                }
                node = null;
            }
            current = target = null;
        }
        //}
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
            Body.lib(RootNode, type, fn, remove);
            if (!remove) {
                counter = 1;
            }
        }
        RootEvents[type] = counter;
    }
};
    var Delegates = {
        focus: 2,
        blur: 2,
        mouseenter: 2,
        mouseleave: 2
    };
    Body.lib = function(node, type, cb, remove, scope, direct) {
        var flag = Delegates[type];
        if (scope && !cb.$fn) {
            cb.$fn = function() {
                cb.apply(scope, arguments);
            };
        }
        if (cb.$fn) cb = cb.$fn;
        if (!direct && flag == 2) {
            $(node)[(remove ? 'un' : '') + 'delegate']('[mx-' + type + ']', type, cb);
        } else {
            $(node)[remove ? 'off' : 'on'](type, cb);
        }
    };
    return Body;
});