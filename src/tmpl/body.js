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
var Body_MagixPrefix = 'mx-';
var Body_EvtInfoCache = new G_Cache(30, 10);
var Body_EvtInfoReg = /(?:([\w\-]+)\u001e)?([^\(]+)\(([\s\S]*)?\)/;
var Body_RootEvents = {};
var Body_SearchSelectorEvents = {};
var Body_FindVframeInfo = function(current, eventType) {
    var vf, tempId, selectorObject, eventSelector, names = [],
        begin = current,
        info = current.getAttribute(Body_MagixPrefix + eventType),
        match, view,
        vfs = [],
        selectorVfId;
    if (info) {
        match = Body_EvtInfoCache.get(info);
        if (!match) {
            match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
            match = {
                v: match[1],
                n: match[2],
                i: match[3]
            };
            /*jshint evil: true*/
            match.p = match.i && G_ToTry(Function('return ' + match.i));
            Body_EvtInfoCache.set(info, match);
        }
        names.push(match = {
            r: info,
            //如果事件已经存在处理的vframe或节点上通过mx-owner指定处理的vframe
            v: match.v /*#if(modules.mxViewAttr){#*/ || current.getAttribute('mx-owner') /*#}#*/ ,
            p: match.p,
            n: match.n
        });
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        selectorVfId = current.$v; //如果节点有缓存，则使用缓存
        if (!selectorVfId) { //先找最近的vframe
            vfs.push(begin);
            while (begin != G_DOCBODY && (begin = begin.parentNode)) { //找最近的vframe,且节点上没有mx-autonomy属性
                if ((Vframe_Vframes[tempId = begin.id] || (tempId = begin.$v))) {
                    selectorVfId = tempId;
                    break;
                }
                vfs.push(begin);
            }
        }

        if (selectorVfId) { //从最近的vframe向上查找带有选择器事件的view
            while ((info = vfs.pop())) {
                info.$v = selectorVfId;
            }
            /*#if(modules.layerVframe){#*/
            var findParent = match && !match.v;
            /*#}#*/
            do {
                vf = Vframe_Vframes[selectorVfId];
                view = vf.$v;
                if (view) {
                    selectorObject = view.$so;
                    eventSelector = selectorObject[eventType];
                    for (tempId in eventSelector) {
                        if (G_TargetMatchSelector(current, tempId)) {
                            names.push({
                                r: tempId,
                                v: selectorVfId,
                                n: tempId
                            });
                        }
                    }
                    //防止跨view选中，到带模板的view时就中止或未指定
                    /*#if(modules.layerVframe){#*/
                    if (findParent) {
                        if (match.v) {
                            var matchInfo = G_Mix({}, match);
                            matchInfo.v = selectorVfId;
                            names.push(matchInfo);
                        } else {
                            match.v = selectorVfId;
                        }
                    }
                    /*#}#*/
                    if (view.$t) {
                        /*#if(!modules.layerVframe){#*/
                        if (match && !match.v) match.v = selectorVfId;
                        /*#}#*/
                        break; //带界面的中止
                    }
                }
            }
            while ((selectorVfId = vf.pId));
        }
    }
    return names;
};

var Body_DOMEventProcessor = function(e) {
    var current = e.target;
    var eventType = e.type;
    var info, names;
    var ignore;
    var arr = [];
    var vframe, view, name, fn;
    /*#if(modules.layerVframe){#*/
    var lastVfId;
    /*#}#*/
    while (current != G_DOCBODY && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点,考虑在向上遍历的过程中，节点被删除，所以需要判断nodeType,主要是IE
        names = Body_FindVframeInfo(current, eventType);
        if (names.length) {
            arr = [];
            while ((info = names.shift())) {
                if (!info.v) {
                    return Magix_Cfg.error(Error('bad ' + eventType + ':' + info.r));
                }
                /*#if(modules.layerVframe){#*/
                if (!lastVfId) lastVfId = info.v;
                /*#}#*/
                /*#if(modules.layerVframe){#*/
                if (lastVfId != info.v && e.isPropagationStopped()) {
                    break;
                }
                /*#}#*/
                vframe = Vframe_Vframes[info.v];
                view = vframe && vframe.$v;
                name = info.n + G_SPLITER + eventType;
                fn = view[name];
                if (fn) {
                    e.eventTarget = current;
                    e.params = info.p || {};
                    G_ToTry(fn, e, view);
                }
            }
        }
        /*|| e.mxStop */
        if ((ignore = current.$) &&
            ignore[eventType] ||
            e.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            break;
        } else {
            arr.push(current);
        }
        current = current.parentNode || G_DOCBODY;
        // if (current.id == vId) { //经过vframe时，target为vframe节点
        //     e.target = current;
        // }
    }
    while ((current = arr.pop())) {
        ignore = current.$ || (current.$ = {});
        ignore[eventType] = 1;
    }
};
var Body_DOMEventBind = function(type, searchSelector, remove) {
    var counter = Body_RootEvents[type] | 0;
    var offset = (remove ? -1 : 1);
    if (!counter || remove === counter) { // remove=1  counter=1
        G_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + offset;
    if (searchSelector) { //记录需要搜索选择器的事件
        Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
    }
};