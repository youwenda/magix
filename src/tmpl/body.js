/*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+view.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.current)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
 */
var Body_ParentNode = 'parentNode';
var Body_EvtInfoCache = new G_Cache(30, 10);
var Body_EvtInfoReg = /(?:([\w\-]+)\u001e)?([^\(]+)\(([\s\S]*)?\)/;
var Body_RootEvents = {};
var Body_FindVframe = function(begin, vfId, tempId, vf, vId, view) {
    while ((begin = begin[Body_ParentNode])) {
        vf = Vframe_Vframes[tempId = begin.id];
        if (vf && (vfId == tempId || ((view = vf.$v) && view.$p && view.$t))) { //如果是独立的vframe或指定的id相同
            vId = tempId;
            break;
        }
    }
    return vId;
};

var Body_DOMEventProcessor = function(e) {
    var current = e.target;
    var eventType = e.type;
    var type = 'mx-' + eventType;
    var info;
    var ignore;
    var arr = [];
    var vframe, view, vId, match, name, fn;

    while (current != G_DOCBODY && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点,考虑在向上遍历的过程中，节点被删除，所以需要判断nodeType,主要是IE
        if ((info = current.getAttribute(type))) {
            arr = [];
            //ts = info.split(G_SPLITER);
            //info = ts.pop();
            match = Body_EvtInfoCache.get(info);
            if (!match) {
                match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
                match = {
                    v: match[1],
                    n: match[2],
                    i: match[3]
                };
                /*jshint evil: true*/
                match.p = match.i && G_ToTry(Function('return ' + match.i)) || {};
                Body_EvtInfoCache.set(info, match);
            }
            vId = match.v || current.$f; //ts[0];
            if (!vId) { //如果没有则找最近的vframe

                // 关于下方的while
                // 考虑这样的结构：
                // div(mx-vframe,id=outer)
                //     div(mx-vframe,mx-userevent="change()",id=inner)
                //         content
                // 当inner做为组件存在时，比如webcomponents，从根节点inner向外派发userevent事件
                // 外vframe outer做为inner的userevent监听者，监听表达式自然是写到inner根节点

                // 所以，当找到事件信息后，直接从事件信息的上一层节点开始查找最近的vframe，不应该从当前节点上查找

                // div(mx-click="test()")
                //     click here
                vId = Body_FindVframe(current);
            }
            if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理
                vframe = Vframe_Vframes[vId];
                view = vframe && vframe.$v;
                if (view) {
                    name = match.n + G_SPLITER + eventType;
                    fn = view[name];
                    if (fn) {
                        //e.current = current;
                        e.eventTarget = current;
                        e.params = match.p;
                        G_ToTry(fn, e, view);
                        //e.previous = current; //下一个处理函数可检测是否已经处理过
                    }
                }
            } else {
                Magix_Cfg.error(Error('bad ' + type + ':' + info));
            }
        }
        if ((ignore = current.$) && ignore[eventType] || e.mxStop || e.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            break;
        } else {
            arr.push(current);
        }
        current = current[Body_ParentNode] || G_DOCBODY;
        // if (current.id == vId) { //经过vframe时，target为vframe节点
        //     e.target = current;
        // }
    }
    while ((current = arr.pop())) {
        ignore = current.$ || (current.$ = {});
        ignore[eventType] = 1;
    }
};
var Body_DOMEventBind = function(type, remove) {
    var counter = Body_RootEvents[type] | 0;
    if (!counter || (remove && counter == 1)) {
        Body_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + (remove ? -1 : 1);
};