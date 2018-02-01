/*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+Magix.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.eventTarget)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
    4.如果同一节点上同时绑定了mx-event和选择器事件，如
        <div data-menu="true" mx-click="clickMenu()"></div>

        'clickMenu<click>'(e){
            console.log('direct',e);
        },
        '$div[data-menu="true"]<click>'(e){
            console.log('selector',e);
        }

        那么先派发mx-event绑定的事件再派发选择器绑定的事件

        如果要停止选择器上的事件派发，请调用e.stopImmediatePropagation()

    5.在当前view根节点上绑定事件，目前只能使用选择器绑定，如
        '$<click>'(e){
            console.log('view root click',e);
        }
 */
let Body_EvtInfoCache = new G_Cache(30, 10);
let Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;
let Body_RootEvents = {};
let Body_SearchSelectorEvents = {};
let Body_FindVframeInfo = (current, eventType) => {
    let vf, tempId, selectorObject, eventSelector, eventInfos = [],
        begin = current,
        info = current.getAttribute(`mx-${eventType}`),
        match, view,
        vfs = [],
        selectorVfId,
        backtrace = 0;
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
            match.p = match.i && G_ToTry(Function(`return ${match.i}`), G_EMPTY_ARRAY, current);
            Body_EvtInfoCache.set(info, match);
        }
        match = {
            ...match,
            /*#if(modules.mxViewAttr){#*/
            v: match.v || current.getAttribute('mx-owner'),
            /*#}#*/
            r: info
        };
        eventInfos.push(match);
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        selectorVfId = current['@{body#vframe.id}']; //如果节点有缓存，则使用缓存
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
            for (info of vfs) {
                info['@{body#vframe.id}'] = selectorVfId;
            }
            /*#if(modules.layerVframe){#*/
            let findParent = match && !match.v;
            /*#}#*/
            begin = current.id;
            if (Vframe_Vframes[begin]) {
                backtrace = selectorVfId = begin;
            }
            do {
                vf = Vframe_Vframes[selectorVfId];
                if (vf && (view = vf['@{vframe#view.entity}'])) {
                    selectorObject = view['@{view#selector.events.object}'];
                    eventSelector = selectorObject[eventType];
                    for (tempId in eventSelector) {
                        selectorObject = {
                            r: tempId,
                            v: selectorVfId,
                            n: tempId
                        };
                        if (tempId) {
                            if (G_TargetMatchSelector(current, tempId)) {
                                eventInfos.push(selectorObject);
                            }
                        } else if (backtrace) {
                            eventInfos.unshift(selectorObject);
                        }
                    }
                    //防止跨view选中，到带模板的view时就中止或未指定
                    /*#if(modules.layerVframe){#*/
                    if (findParent) {
                        if (match.v) {
                            eventInfos.push({ ...match, v: selectorVfId });
                        } else {
                            match.v = selectorVfId;
                        }
                    }
                    /*#}#*/
                    if (view['@{view#template.object}'] && !backtrace) {
                        /*#if(!modules.layerVframe){#*/
                        if (match && !match.v) match.v = selectorVfId;
                        /*#}#*/
                        break; //带界面的中止
                    }
                    backtrace = 0;
                }
            }
            while (vf && (selectorVfId = vf.pId));
        }
    }
    return eventInfos;
};

let Body_DOMEventProcessor = domEvent => {
    let { target, type } = domEvent;
    let eventInfos;
    let ignore;
    let arr = [];
    let vframe, view, eventName, fn;
    let lastVfId;
    /*#if(modules.updater){#*/
    let params;
    /*#}#*/
    while (target != G_DOCBODY) { //找事件附近有mx-[a-z]+事件的DOM节点,考虑在向上遍历的过程中，节点被删除，所以需要判断nodeType,主要是IE
        eventInfos = Body_FindVframeInfo(target, type);
        if (eventInfos.length) {
            arr = [];
            for (let { v, r, n, p, i } of eventInfos) {
                if (!v && DEBUG) {
                    return Magix_Cfg.error(Error(`bad ${type}:${r}`));
                }
                if (lastVfId != v) {
                    if (lastVfId && domEvent.isPropagationStopped()) {
                        break;
                    }
                    lastVfId = v;
                }
                vframe = Vframe_Vframes[v];
                view = vframe && vframe['@{vframe#view.entity}'];
                if (view) {
                    eventName = n + G_SPLITER + type;
                    fn = view[eventName];
                    if (fn) {
                        domEvent.eventTarget = target;
                        /*#if(modules.updater){#*/
                        params = p || {};
                        if (i && i.indexOf(G_SPLITER) > 0) {
                            GSet_Params(view['@{view#updater}']['@{updater#data}'], params, params = {});
                            if (DEBUG) {
                                params = Safeguard(params);
                            }
                        }
                        domEvent[G_PARAMS] = params;
                        /*#}else{#*/
                        domEvent[G_PARAMS] = p || {};
                        /*#}#*/
                        G_ToTry(fn, domEvent, view);

                        if (domEvent.isImmediatePropagationStopped()) {
                            break;
                        }
                    }
                    if (DEBUG) {
                        if (!fn) { //检测为什么找不到处理函数
                            if (eventName[0] == '\u001f') {
                                console.error('use view.wrapEvent wrap your html');
                            } else {
                                console.error('can not find event processor:' + n + '<' + type + '> from view:' + vframe.path);
                            }
                        }
                    }
                } else {//如果处于删除中的事件触发，则停止事件的传播
                    domEvent.stopPropagation();
                }
                if (DEBUG) {
                    if (!view && view !== 0) { //销毁
                        console.error('can not find vframe:' + v);
                    }
                }
            }
        }
        /*|| e.mxStop */
        if ((ignore = target.$) &&
            ignore[type] ||
            domEvent.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            break;
        } else {
            arr.push(target);
        }
        target = target.parentNode || G_DOCBODY;
    }
    for (target of arr) {
        ignore = target.$ || (target.$ = {});
        ignore[type] = 1;
    }
};
let Body_DOMEventBind = (type, searchSelector, remove) => {
    let counter = Body_RootEvents[type] | 0;
    let offset = (remove ? -1 : 1);
    if (!counter || remove === counter) { // remove=1  counter=1
        G_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + offset;
    if (searchSelector) { //记录需要搜索选择器的事件
        Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
    }
};