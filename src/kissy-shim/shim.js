//////////////////////// Shim ////////////////////////

// Magix API
Magix.version = '3.8.10';
S.each(['isObject', 'isArray', 'isString', 'isFunction', 'isNumber', 'isRegExp'], k => Magix[k] = S[k]);
Magix.isNumeric = o => !isNaN(parseFloat(o)) && isFinite(o);
Magix.pathToObject = path => {
  const r = G_ParseUri(path);
  return {
    ...r,
    pathname: r.path
  }
};
Magix.noop = G_NOOP;

const __local = {};
Magix.local = (key, value) => {
  const args = arguments;
  switch(args.length) {
    case 0:
      return { ...__local };
      break;
    case 1:
      if (typeof key === 'string') {
        return __local[key];
      }
      S.each(key, (v, k) => __local[k] = v);
      break;
    case 2:
      return __local[key] = value;
      break;
  }
};

const __tmpl = {};
Magix.tmpl = (moduleId, template) => {
  if (!moduleId || template == null) {
    return;
  }
  __tmpl[moduleId] = template;
};
Magix.tmpl.get = moduleId => __tmpl[moduleId];

Magix.cache = (...args) => new Magix.Cache(...args);

Magix.safeExec = G_ToTry;
Magix.listToMap = (list, key) => {
  if (S.isString(list)) {
    list = list.split(',');
  }
  return G_ToMap(list, key);
};

const __deprecated = {};
Magix.deprecated = (msg) => {
  if (!__deprecated[msg]) {
    console.warn(msg);
    __deprecated[msg] = 1;
  }
};

Safeguard = o => o;

Magix.start = (cfg) => {
  if (!cfg.ini && cfg.iniFile) {
    Magix.deprecated('Deprecated Config.iniFile,use Config.ini instead');
    cfg.ini = cfg.iniFile;
  }
  if (!cfg.exts && cfg.extensions) {
    Magix.deprecated('Deprecated Config.extensions,use Config.exts instead');
    cfg.exts = cfg.extensions;
  }
  if (cfg.execError) {
    Magix.deprecated('Deprecated Config.execError,use Config.error instead');
    cfg.error = cfg.execError;
  }
  Magix.boot(cfg);
};

// Event
Magix.Event.un = Magix.Event.off;

// Router
let G_LocationChanged;
const G_Location = {
  get(key) {
    Magix.deprecated('Deprecated View#location,use Magix.Router.parse() instead。请查阅：http://gitlab.alibaba-inc.com/mm/afp/issues/2 View#location部分');
    return this.params[key] || G_EMPTY;
  }
};
const Router_Parse = function Router_Parse(href) {
  href = href || Router_WinLoc.href;

  let result = Router_HrefCache.get(href);
  let srcQuery, srcHash, query, hash, params;

  if (!result) {
    srcQuery = href.replace(Router_TrimHashReg, G_EMPTY);
    srcHash = href.replace(Router_TrimQueryReg, G_EMPTY);
    query = G_ParseUri(srcQuery);
    hash = G_ParseUri(srcHash);

    G_Assign(query, {
      pathname: query.path
    });

    G_Assign(hash, {
      pathname: hash.path
    });

    params = {
      ...query[G_PARAMS],
      ...hash[G_PARAMS]
    };

    result = {
      get: GetParam,
      href,
      srcQuery,
      srcHash,
      query,
      hash,
      params
    };
    if (Magix_Booted) {
      Router_AttachViewAndPath(result);
      result.pathname = result.path || result.hash.path;
      Router_HrefCache.set(href, result);
    }
  }
  return result;
};
Router.parse = Router.parseQH = Router_Parse;
Router.un = Router.off;
Router.navigate = Router.to;
Router.on(G_CHANGED, e => {
  const location = Router.parse();
  const changed = e;
  const occur = 1;
  for (let p in location) {
    if (G_Has(location, p) && p !== 'get') {
      G_Location[p] = location[p];
    }
  }
  
  location.hash.pathname = location.hash.path;
  location.query.pathname = location.query.path;

  G_LocationChanged = G_Assign(e, {
    changed,
    location,
    occur,
    pathname: e[G_PATH],
    isPathname: () => e[G_PATH],
    isView: () => e[Router_VIEW],
    isParam: (k) => e[G_PARAMS][k]
  })

  View[G_PROTOTYPE].location = location;
});

// Vframe & Vom

/**
 * 通知当前vframe，地址栏发生变化
 * @param {Vframe} vframe vframe对象
 * @private
 */
const Dispatcher_Update = (vframe, /*#if(modules.state){#*/ stateKeys, /*#}#*/ view, isChanged, cs, c) => {
  if (vframe && vframe['@{vframe#update.tag}'] != Dispatcher_UpdateTag &&
    (view = vframe['@{vframe#view.entity}']) &&
    view['@{view#sign}'] > 1) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的G_WINDOW.location.href对象，对于销毁的也不需要广播

    isChanged = stateKeys ? State_IsObserveChanged(view, stateKeys) : View_IsObserveChanged(view);
    /**
     * 事件对象
     * @type {Object}
     * @ignore
     */
    /*let args = {
      location: RefLoc,
      changed: RefG_LocationChanged,*/
    /**
     * 阻止向所有的子view传递
     * @ignore
     */
    /* prevent: function() {
        args.cs = EmptyArr;
    },*/
    /**
     * 向特定的子view传递
     * @param  {Array} c 子view数组
     * @ignore
     */
    /*to: function(c) {
        c = (c + EMPTY).split(COMMA);
        args.cs = c;
    }
    };*/
    
    const args = {
      location: G_Location,
      changed: G_LocationChanged,
      /**
      * 阻止向所有的子view传递
      */
      prevent: function () {
        this.cs = [];
      },
      /**
       * 向特定的子view传递
       * @param  {Array} c 子view数组
       */
      toChildren: function (c) {
        c = c || [];
        if (S.isString(c)) {
          c = c.split(',');
        }
        this.cs = c;
      }
    };

    if (isChanged) { //检测view所关注的相应的参数是否发生了变化
      if (S.isFunction(view.locationChange)) {
        Magix.deprecated('Deprecated View#locationChange');
        view.locationChange(args);
      }
      // TODO 判断如果当前view是magix-components(通过view.path即可)下的代码需要进行调用`render`方法
      // 兼容Magix1.0版本代码，如果没有`locationChange`方法，不进行渲染，但实际在Magix3中默认执行`render方法`
      // view['@{view#render.short}']();
    }
    cs = args.cs && args.cs.length && args.cs || vframe.children();
    for (c of cs) {
      Dispatcher_Update(Vframe_Vframes[c]/*#if(modules.state){#*/, stateKeys /*#}#*/);
    }
  }
};

const origVframeAdd = Vframe_AddVframe;
Vframe_AddVframe = (id, vf) => {
  origVframeAdd(id, vf);
  vf.on('created', (e) => vf.invoke('fire', ['created', e]));
  vf.on('alter', (e) => vf.invoke('fire', ['alter', e]));
};

Vframe.add = Vframe_AddVframe;
Vframe.remove = Vframe_RemoveVframe;

Vframe.un = Vframe.off;
Vframe.root = Vframe_Root;
Vframe.owner = Vframe;

const MxEvent = /\bmx-(?!view|vframe|ssid|guid|dep|owner)([a-zA-Z]+)\s*=\s*['"]*/g
const VframeNoopProto = (function () {
  const r = {};
  const prop = Vframe[G_PROTOTYPE];
  for (let p in prop) {
    if (G_Has(prop, p)) {
      if (S.isFunction(prop[p])) {
        r[p] = G_NOOP;
      } else {
        r[p] = prop[p];
      }
    }
  }
  return r;
})();
const origUnmountView = Vframe[G_PROTOTYPE].unmountView;

G_Assign(Vframe[G_PROTOTYPE], {
  owner: Vframe,
  un(...args) {
    return this.off(...args);
  },
  invokeView(...args) {
    return this.invoke(...args);
  },
  /**
   * Add Magix1 Load Promise
   * 加载对应的view
   * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
   * @param {Object|Null} [viewInitParams] 调用view的init方法时传递的参数
  */
  mountView(viewPath, viewInitParams = {} /*,keepPreHTML*/) {
    let me = this;
    let { id, pId, '@{vframe#sign}': s } = me;
    let node = G_GetById(id),
      /*#if(modules.viewSlot){#*/
      vNodes = {
        nodes: node['@{node#vnodes}']
      },
      /*#}#*/
      po, sign, view, params /*#if(modules.viewProtoMixins){#*/, ctors /*#}#*/ /*#if(modules.updater){#*/, parentVf/*#}#*/;
    if (!me['@{vframe#alter.node}'] && node) { //alter
      me['@{vframe#alter.node}'] = 1;
      me['@{vframe#template}'] = node.innerHTML; //.replace(ScriptsReg, ''); template
    }
    me.unmountView(/*keepPreHTML*/);
    me['@{vframe#destroyed}'] = 0; //destroyed 详见unmountView
    // 去除空vframe标签的情况
    if (!viewPath) {
      return;
    }
    po = G_ParseUri(viewPath);
    view = po[G_PATH];
    if (node && view) {
      me[G_PATH] = viewPath;
      sign = ++s;
      params = po[G_PARAMS];
      /*#if(modules.viewSlot){#*/
      pId = node.getAttribute(G_MX_OWNER) || pId;
      /*#}#*/
      /*#if(modules.updater){#*/
      /*#if(modules.mxViewAttr){#*/
      pId = node.getAttribute('mx-datafrom') || pId;
      /*#}#*/
      parentVf = Vframe_TranslateQuery(pId, viewPath, params);
      me['@{vframe#view.path}'] = po[G_PATH];
      /*#if(modules.mxViewAttr){#*/
      let attrs = node.attributes;
      let capitalize = (_, c) => c.toUpperCase();
      let vreg = /^[\w_\d]+$/;
      let attr, name, value;
      for (attr of attrs) {
        name = attr.name;
        value = attr[G_VALUE];
        if (name.indexOf('view-') === 0) {
          let key = name.substring(5).replace(/-(\w)/g, capitalize);
          if (value.substring(0, 3) == '<%@' && value.substring(value.length - 2) == '%>') {
            try {
              value = parentVf[Tmpl(value, parentVf)];
            } catch (_magix) {
              value = G_Trim(value.substring(3, value.length - 2));
              if (parentVf && vreg.test(value)) {
                value = parentVf[value];
              } else {
                //Magix_Cfg.error(ex);
              }
            }
          }
          params[key] = value;
        }
      }
      /*#}#*/
      /*#}#*/
      // G_Assign(params, viewInitParams);
      // Magix 1对于viewInitParams使用的引用，因此这里params也要处理
      params = S.mix(viewInitParams, params, {
        overwrite: false
      });
      G_Require(view, TView => {
        if (sign == me['@{vframe#sign}']) { //有可能在view载入后，vframe已经卸载了
          if (!TView) {
            return Magix_Cfg.error(Error(`id:${id} cannot load:${view}`));
          }
          let tmpl = Magix.tmpl.get(po[G_PATH]);
          // 对于继承的View，单纯的判断TView的原型链有误，因此使用hasOwnProperty判断 同时Magix3的tmpl是一个方法
          if (tmpl && (!G_Has(TView[G_PROTOTYPE], 'tmpl') || !S.isFunction(TView[G_PROTOTYPE].tmpl)) ) {
            if (typeof tmpl === 'string') {
              tmpl = tmpl.replace(MxEvent, '$&' + me.id + G_SPLITER);
            }
            TView[G_PROTOTYPE].tmpl = TView[G_PROTOTYPE].template = tmpl;
          }
          /*#if(modules.viewProtoMixins){#*/
          ctors = View_Prepare(TView);
          /*#}else{#*/
          View_Prepare(TView);
          /*#}#*/
          view = new TView(id, me, params/*#if(modules.viewSlot){#*/, vNodes /*#}#*//*#if(modules.viewProtoMixins){#*/, ctors /*#}#*/);

          if (DEBUG) {
            let viewProto = TView.prototype;
            let importantProps = {
              id: 1,
              updater: 1,
              owner: 1,
              '@{view#observe.router}': 1,
              '@{view#resource}': 1,
              '@{view#sign}': 1,
              '@{view#updater}': 1
            };
            // for (let p in view) {
            //   if (G_Has(view, p) && viewProto[p]) {
            //     console.warn(`avoid write ${p} at file ${viewPath}!`);
            //   }
            // }
            view = Safeguard(view, null, (key, value) => {
              if (G_Has(viewProto, key) ||
                (G_Has(importantProps, key) &&
                  (key != '@{view#sign}' || !isFinite(value)) &&
                  (key != 'owner' || value !== 0))) {
                throw new Error(`avoid write ${key} at file ${viewPath}!`);
              }
            });
          }
          G_ToTry(TView[G_PROTOTYPE].mxViewCtor, G_NULL, view);

          // ES6 Class babel解析后会把非方法的原型属性放在实例上，因此这里hack
          if (G_Has(view, 'events')) {
            View_FixEvents(TView, view.events);
          }

          // 为vframe补充的实例属性
          me.view = view;
          me['@{vframe#view.entity}'] = view;
          /*#if(modules.router||modules.state){#*/
          me['@{vframe#update.tag}'] = Dispatcher_UpdateTag;
          /*#}#*/
          
          new Promise(resolve => {
            const fn = view.load();
            if (fn && fn.then) {
              return fn.then(resolve);
            }
            return resolve();
          }).then(() => {
            if (sign == me['@{vframe#sign}']) {
              View_DelegateEvents(view);
              view.fire('interact');
              /*#if(modules.viewInit){#*/
              G_ToTry(view.init, params, view);
              /*#}#*/

              view['@{view#render.short}']();
              if (!view['@{view#template.object}']) { //无模板
                me['@{vframe#alter.node}'] = 0; //不会修改节点，因此销毁时不还原
                if (!view['@{view#rendered}']) {
                  view.endUpdate();
                }
              }
            }
          });
        }
      });
    }
  },
  /**
   * 销毁对应的view, Magix1销毁view时，view.owner属性不会销毁，Magix3进行了销毁设置为NULL,这里兼容
  */
  unmountView ( /*keepPreHTML*/) {
    const view = this['@{vframe#view.entity}'];
    origUnmountView.apply(this, arguments);
    // 连同新添加的兼容属性view一起删除
    this.view = 0;
    if (view) {
      view.owner = G_Assign({}, VframeNoopProto);
    }
  },
  /**
   * 加载某个区域下的view
   * @param {HTMLElement|String} zoneId 节点对象或id
   * @deprecated @param {Object|undefined} 向view传递的参数，在Magix3.8.10中已经废弃，因某个区域下面可能会有很多view，如果传递，所有view都会接受这个参数
   * 
   * @example
   * // html
   * // &lt;div id="zone"&gt;
   * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
   * // &lt;/div&gt;
   *
   * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
   */
  mountZone(zoneId, viewInitParams, inner /*,keepPreHTML*/) {
    let me = this;
    let vf, id, vfs = [];
    zoneId = zoneId || me.id;
    
    let vframes = $(`${G_HashKey}${zoneId} vframe`);
    if (vframes.length) {
      Magix.deprecated('Deprecated vframe tag, use div[mx-view] instead');
    }
    vframes = vframes.add($(`${G_HashKey}${zoneId} [${G_MX_VIEW}]`));

    /*
        body(#mx-root)
            div(mx-vframe=true,mx-view='xx')
                div(mx-vframe=true,mx-view=yy)
        这种结构，自动构建父子关系，
        根结点渲染，获取到子列表[div(mx-view=xx)]
            子列表渲染，获取子子列表的子列表
                加入到忽略标识里
        会导致过多的dom查询

        现在使用的这种，无法处理这样的情况，考虑到项目中几乎没出现过这种情况，先采用高效的写法
        上述情况一般出现在展现型页面，dom结构已经存在，只是附加上js行为
        不过就展现来讲，一般是不会出现嵌套的情况，出现的话，把里面有层级的vframe都挂到body上也未尝不可，比如brix2.0
     */

    me['@{vframe#hold.fire}'] = 1; //hold fire creted
    //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27
    /*#if(modules.collectView){#*/
    let temp = [];
    for (vf of vframes) {
      temp.push(vf.getAttribute(G_MX_VIEW));
    }
    G_Require(temp);
    /*#}#*/
    /*#if(modules.layerVframe){#*/
    let subs = {},
      svfs, subVf;
    /*#}#*/
    for (vf of vframes) {
      if (!vf['@{node#mounted.vframe}'] /*#if(modules.viewSlot){#*/ && vf.getAttribute(G_MX_OWNER) != me.id/*#}#*/) { //防止嵌套的情况下深层的view被反复实例化
        id = IdIt(vf);
        /*#if(modules.layerVframe){#*/
        if (!G_Has(subs, id)) {
          /*#}#*/
          vf['@{node#mounted.vframe}'] = 1;
          vfs.push([id, vf.getAttribute(G_MX_VIEW)]);
          /*#if(modules.layerVframe){#*/
        }
        svfs = $(`${G_HashKey}${id} vframe`);
        svfs = svfs.add($(`${G_HashKey}${id} [${G_MX_VIEW}]`));
        for (subVf of svfs) {
          id = IdIt(subVf);
          subs[id] = 1;
        }
        /*#}#*/
      }
      /*#if(modules.updaterQuick){#*/
      vCount++;
      /*#}#*/
    }
    for ([id, vf] of vfs) {
      if (DEBUG && document.querySelectorAll(`#${id}`).length > 1) {
        Magix_Cfg.error(Error(`dom id:"${id}" duplicate`));
      }
      if (DEBUG) {
        if (vfs[id]) {
          Magix_Cfg.error(Error(`vf.id duplicate:${id} at ${me[G_PATH]}`));
        } else {
          me.mountVframe(vfs[id] = id, vf, viewInitParams);
        }
      } else {
        me.mountVframe(id, vf, viewInitParams);
      }
    }
    me['@{vframe#hold.fire}'] = 0;
    if (!inner) {
      Vframe_NotifyCreated(me);
    }
  },
  unmountZoneVframes(node, params) {
    Magix.deprecated('Deprecated Vframe#unmountZoneVframes use Vframe#unmountZone instead');
    if (node && node.nodeType) {
      node = IdIt(node);
    }
    this.unmountZone(node, params);
  },
  mountZoneVframes: function(node, params) {
    Magix.deprecated('Deprecated Vframe#mountZoneVframes use Vframe#mountZone instead');
    if (node && node.nodeType) {
      node = IdIt(node);
    }
    this.mountZone(node, params);
  }
});

// 让业务中其他方法的覆盖静默失败
Object.defineProperties(Vframe[G_PROTOTYPE], {
  mountZoneVframes: {
    writable: false
  },
  unmountZoneVframes: {
    writable: false
  }
});

Magix.VOM = Vframe;

// View
const View_ExtendEvents = function (ViewProto, events) {
  if (G_IsObject(events)) {
    if (!G_Has(ViewProto, 'events')) {
      ViewProto.events = {};
    }
    S.mix(ViewProto.events, events, {
      deep: true,
      overwrite: false
    });
  }
};

const View_FixEvents = function (View, events) {
  let prop = View[G_PROTOTYPE];
  if (G_IsObject(events)) {
    for (let type in events) {
      if (G_Has(events, type)) {
        for (let fn in events[type]) {
          if (G_Has(events[type], fn) && S.isFunction(events[type][fn])) {
            // let bound = S.bind(events[type][fn], events[type]);
            // Function.prototype doesn't have a prototype property
            let bound = events[type][fn].bind(events[type]);
            prop[fn + '<' + type + '>'] = bound;
            // 针对于Babel解析events作为实例属性的Hack处理，处理同`View_Prepare`方法
            if (prop['@{view#events.object}']) {
              prop['@{view#events.object}'][type] = prop['@{view#events.object}'][type] | 1;
              // 不能简单的进行赋值操作，而是要考虑到mixins的问题
              // prop[fn + G_SPLITER + type] = bound;
              let item = fn + G_SPLITER + type;
              let node = prop[item];
              /*#if(modules.viewProtoMixins){#*/
              //for in 就近遍历，如果有则忽略
              if (!node) { //未设置过
                prop[item] = bound;
              } else if (node['@{~viewmixin#is.mixin}']) { //现有的方法是mixins上的
                if (bound['@{~viewmixin#is.mixin}']) { //2者都是mixins上的事件，则合并，早期事件肯定不是mixins的， 因此此判断永远为false，但谁又能保证不讲一个view作为mixins呢，因此判断暂时保留
                  prop[item] = processMixinsSameEvent(bound, node);
                } else { // bound方法肯定不是mixin上的，也不是继承来的（本身为Babel对events属性的判断）。在当前view上，优先级最高
                  prop[item] = bound;
                }
              }
              /*#}else{#*/
              if (!node) {
                prop[item] = bound;
              }
              /*#}#*/
            }
          }
        }
      }
    }
  }
};

const View_WrapMethod = (prop, fName, short, fn, me) => {
  fn = prop[fName];
  prop[fName] = prop[short] = function (...args) {
    me = this;
    if (me['@{view#sign}'] > 0) { //signature
      me['@{view#sign}']++;
      me.fire('rendercall');
      View_DestroyAllResources(me);
      return G_ToTry(fn, args, me);
    }
  };
};

const origViewPrepare = View_Prepare;
View_Prepare = (View) => {
  let set = View[G_SPLITER];
  let prop = View[G_PROTOTYPE];
  let parent = View.superclass;
  let c;

  // 对于事件的兼容处理
  if (!set) {
    while (parent) {
      c = parent.constructor;
      View_ExtendEvents(prop, c[G_PROTOTYPE].events);
      parent = c.superclass;
    }

    let events = prop.events;
    View_FixEvents(View, events);
  }

  c = origViewPrepare(View);
  // 对于Babel使用class extends 方式，需要重新包装render方法
  if (!G_Has(prop, '@{view#render.short}')) {
    View_WrapMethod(prop, 'render', '@{view#render.short}');
  }
  return c;
};

const View_Ctors = [
  function() {
    // 为view补充的实例和原型属性
    this.path = this.owner['@{vframe#view.path}'];
    Object.defineProperty(this, 'sign', {
      get() {
        return this['@{view#sign}'];
      }
    });
  }
];

// Body
const Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(<{]+)(?:<(\w+)>)?(\(?)([\s\S]*)?\)?/;
const EvtParamsReg = /(\w+):([^,]+)/g;
  
const Body_RootEvents = {};
const Body_SearchSelectorEvents = {};
const Body_RangeEvents = {};
const Body_RangeVframes = {};
const Body_Guid = 0;

const WEvent = {
  prevent(e) {
    e = e || this.domEvent;
    e.preventDefault();
  },
  stop(e) {
    e = e || this.domEvent;
    e.stopPropagation();
  },
  halt(e) {
    this.prevent(e);
    this.stop(e);
  }
};

const Body_FindVframeInfo = (current, eventType) => {
  let vf, tempId, selectorObject, eventSelector, eventInfos = [],
    begin = current,
    info = current.getAttribute(`mx-${eventType}`),
    match, view, vfs = [],
    selectorVfId = G_HashKey,
    backtrace = 0;
  if (info) {
    match = Body_EvtInfoCache.get(info);
    if (!match) {
      match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
      match = {
        // vframe id
        v: match[1],
        // method name
        n: match[2],
        // event process including prevent | stop | halt
        e: match[3],
        // adapter old events in old events match[4] === '', in new events match[4] === '('
        c: match[4],
        // method params
        i: match[5]
      };
      // old events 参数进行处理成新的参数格式 in old events i === "{a:'a',b:'b'}" in new events i === "({a:'a',b:'b'})"
      // 因为new events完全采用`updater`进行处理，因此老的模板，还是采用老的方式进行处理
      if (match.e || !match.c) {
        match.p = {};
        if (match.i) {
          let i = S.trim(match.i);
          if (i.charAt(0) == '{') i = i.slice(1);
          if (i.charAt(i.length - 1) == '}') i = i.slice(0, -1);
          i.replace(EvtParamsReg, (r, k, v) => {
            match.p[k] = v;
          });
        }
      } else if(match.i) {
        // new events params because of Body_EvtInfoReg add ')' in last charcode in match.i
        // TEST CASE
        // let s = 'mx_223\x1echangeTabContent({type:cpc})';
        // let nr = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;
        // => [, 'mx_223', 'changeTagContent', '{type:cpc}']
        // s = 'mx_223\x1echangeTabContent({type:cpc})'
        // let Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(<{]+)(?:<(\w+)>)?(\(?)([\s\S]*)?\)?/;
        // => [, 'mx_223', 'changeTabContent', undefined, '(', '{type:cpc})']
        if (match.i.charAt(match.i.length - 1) == ')') {
          match.i = match.i.slice(0, -1);
        }
      }
      Body_EvtInfoCache.set(info, match);
    }
    match = {
      ...match,
      /*#if(modules.mxViewAttr){#*/
      v: match.v || current.getAttribute('mx-owner'),
      /*#}#*/
      r: info
    };
  }
  //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
  if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
    if ((selectorObject = Body_RangeVframes[tempId = begin['@{node#owner.vframe}']])
      && selectorObject[begin['@{node#guid}']] == 1) {
      view = 1;
      selectorVfId = tempId;//如果节点有缓存，则使用缓存
    }
    if (!view) { //先找最近的vframe
      vfs.push(begin);
      while (begin != G_DOCBODY && (begin = begin.parentNode)) { //找最近的vframe,且节点上没有mx-autonomy属性
        if (Vframe_Vframes[tempId = begin.id] ||
          ((selectorObject = Body_RangeVframes[tempId = begin['@{node#owner.vframe}']]) &&
            selectorObject[begin['@{node#guid}']] == 1)) {
          selectorVfId = tempId;
          break;
        }
        vfs.push(begin);
      }
      for (info of vfs) {
        if (!(tempId = Body_RangeVframes[selectorVfId])) {
          tempId = Body_RangeVframes[selectorVfId] = {};
        }
        selectorObject = info['@{node#guid}'] || (info['@{node#guid}'] = ++Body_Guid);
        tempId[selectorObject] = 1;
        info['@{node#owner.vframe}'] = selectorVfId;
      }
    }
    if (selectorVfId != G_HashKey) { //从最近的vframe向上查找带有选择器事件的view
      /*#if(modules.layerVframe){#*/
      let findParent = match && !match.v;
      /*#}#*/
      begin = current.id;
      if (Vframe_Vframes[begin]) {
        /*
            如果当前节点是vframe的根节点，则把当前的vf置为该vframe
            该处主要处理这样的边界情况
            <mx-vrame src="./test" mx-click="parent()"/>
            //.test.js
            export default Magix.View.extend({
                '$<click>'(){
                    console.log('test clicked');
                }
            });

            当click事件发生在mx-vframe节点上时，要先派发内部通过选择器绑定在根节点上的事件，然后再派发外部的事件
        */
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
              /*
                  事件发生时，做为临界的根节点只能触发`$`绑定的事件，其它事件不能触发
              */
              if (!backtrace &&
                G_TargetMatchSelector(current, tempId)) {
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
  if (match) {
    eventInfos.push(match);
  }
  return eventInfos;
};

const Body_DOMEventProcessor = domEvent => {
  let { target, type } = domEvent;
  let eventInfos;
  let ignore;
  let vframe, view, eventName, fn;
  let lastVfId;
  let params, arr = [];
  // 记录target的id
  let targetId = IdIt(target);
  while (target != G_DOCBODY) {
    eventInfos = Body_FindVframeInfo(target, type);
    if (eventInfos.length) {
      arr = [];
      for (let { v, r, n, e, i, p } of eventInfos) {
        if (!v && DEBUG) {
          return Magix_Cfg.error(Error(`bad ${type}:${r}`));
        }
        // 处理old events 的 process
        if (e && WEvent[e]) {
          WEvent[e](domEvent);
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
            G_Assign(domEvent, {
              events: view.events,
              eventTarget: target,
              currentId: IdIt(target),
              targetId,
              // TODO 测试一下Magix1的domEvent貌似是原生的domEvent?
              domEvent,
              view
            });

            // 如果含有match.p, 则说明是老事件
            params = p ? p
                      : i ? G_ParseExpr(i, view['@{view#updater}']['@{updater#data}']) 
                        : {};

            domEvent[G_PARAMS] = params;
            G_ToTry(fn, G_Assign(domEvent, WEvent), view);
            //没发现实际的用途
            /*if (domEvent.isImmediatePropagationStopped()) {
                break;
            }*/
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
    if (((ignore = Body_RangeEvents[fn = target['@{node#owner.vframe}']]) &&
      (ignore = ignore[target['@{node#guid}']]) &&
      ignore[type]) ||
      domEvent.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
      if (arr.length) {
        arr.push(fn);
      }
      break;
    } else {
      arr.push(target);
      lastVfId = target.id;
      if (Vframe_Vframes[lastVfId]) {
        arr.push(lastVfId);
      }
    }
    target = target.parentNode || G_DOCBODY;
  }
  if ((fn = arr.length)) {
    ignore = G_HashKey;
    for (; fn--;) {
      view = arr[fn];
      if (view.nodeType) {
        if (!(eventInfos = Body_RangeEvents[ignore])) {
          eventInfos = Body_RangeEvents[ignore] = {};
        }
        lastVfId = view['@{node#guid}'] || (view['@{node#guid}'] = ++Body_Guid);
        if (!(params = eventInfos[lastVfId])) {
          params = eventInfos[lastVfId] = {};
          view['@{node#owner.vframe}'] = ignore;
        }
        params[type] = 1;
      } else {
        ignore = view;
      }
    }
  }
};

const G_DOMEventLibBind = (node, type, cb, remove, scope, selector) => {
  if (Specials[type] === 1) {
    selector = `[mx-${type}]`;
    if (!Specials[selector]) {
      cb = Specials[selector] = S.bind(cb, scope);     
    }
  } else {
    selector = G_EMPTY;
  }

  if (scope || selector) {
      SE[`${remove ? 'un' : G_EMPTY}delegate`](node, type, selector, cb, scope);
  } else {
      SE[remove ? 'detach' : 'on'](node, type, cb, scope);
  }
};

/*#if(modules.viewMerge){#*/
View.mixin = (props, ctor) => {
  Magix.deprecated('Deprecated Magix.View.mixin,use Magix.View.merge instead');
  if (!props) props = {};
  if (ctor) {
    if (props.ctor) {
      console.error('duplicate ctors');
    }
    props.ctor = ctor;
  }
  return View.merge(props);
};
/*#}#*/

/*#if(modules.router){#*/
const View_IsObserveChanged = view => {
  let loc = view['@{view#observe.router}'];
  // TODO view.template来区分是否是新旧Magix的处理比较弱
  let res = view.template ? 1 : 0; //兼容旧版，旧版对于没有observe参数时，默认是返回true的，然后由`locationChange`决定如何操作，新版则不是
  let i, params;
  // 调用过observeLocation方法
  if (loc.f) {
    if (loc.p) {
      res = Router_LastChanged[G_PATH];
    }
    if (!res && loc.k) {
      params = Router_LastChanged[G_PARAMS];
      for (i of loc.k) {
        res = G_Has(params, i);
        if (res) break;
      }
    }
    // if (res && loc.c) {
    //     loc.c.call(view);
    // }
  }
  return res;
};
/*#}#*/

// 处理Magix1早期的 postMessage and receiveMessage method
const VOMEventsObject = {};
const PrepareVOMMessage = function (Vframe) {
  if (!PrepareVOMMessage.d) {
    PrepareVOMMessage.d = 1;
    Vframe.on('add', function (e) {
      let vf = e.vframe;
      let list = VOMEventsObject[vf.id];
      if (list) {
        for (let i = 0; i < list.length; i++) {
          PostMessage(vf, list[i]);
        }
        delete VOMEventsObject[vf.id];
      }
    });
    Vframe.on('remove', function (e) {
      delete VOMEventsObject[e.vframe.id];
    });
    let vf = Vframe.root();
    vf.on('created', function () {
      VOMEventsObject = {};
    });
  }
};
const PostMessage = function (vframe, args) {
  vframe.invoke('receiveMessage', args);
};

const View_ScopeReg = /\x1f/g;
const View_SetEventOwner = (str, id) => (str + G_EMPTY).replace(View_ScopeReg, id || this.id);
const origObserveLocation = View[G_PROTOTYPE].observeLocation;
G_Assign(View[G_PROTOTYPE], {
  vom: Vframe,
  location: G_Location,
  $(id) {
    Magix.deprecated('Deprecated view.prorotype.$,use Magix.node instead');
    return Magix.node(id);
  },
  observeLocation(params, isObservePath) {
    if (G_IsObject(params)) {
      if (params.keys || params.pathname) {
        console.log('update observeLocation: use params instead keys and path instead pathname')
        origObserveLocation.call(this, params.keys, params.pathname);
      } else {
        origObserveLocation.call(this, params, isObservePath);
      }
      return;
    }
    origObserveLocation.call(this, params, isObservePath);
  },
  parentView() {
    var p = this.owner.parent();
    return p && p.view;
  },
  /**
   * 通知当前view进行更新，与beginUpdate不同的是：begin是开始更新html，notify是开始调用更新的方法，通常render与renderUI已经自动做了处理，对于用户自定义的获取数据并更新界面时，在开始更新前，需要调用一下该方法
   * @return {Integer} 当前view的签名
   */
  notifyUpdate() {
    if (this['@{view#sign}']) {
      this['@{view#sign}']++;
      this.fire('rendercall');
    }
    return this['@{view#sign}'];
  },
  wrapEvent: View_SetEventOwner,
  wrapMxEvent(html) {
    return String(html);
  },
  navigate() {
    Magix.deprecated('Deprecated View#navigate use Magix.Router.to instead。请查阅：http://gitlab.alibaba-inc.com/mm/afp/issues/2 View#navigate部分');
    Router.to.apply(Router, arguments);
  },
  manage(key, res, destroyWhenCallRender) {
    let cache = this['@{view#resource}'];
    let args = arguments;
    let wrapObj;
    Magix.deprecated('Deprecated View#manage use View#capture instead. But This Very Different!');
    if (args.length === 2) {
      Magix.deprecated('View#manage VS View#capture When Using Explicit Key. They are different!');
    }
    if (key && !res) {
      res = key;
      key = G_Id();
    }
    if (res) {
      // View_DestroyResource(cache, key, 1, res);
      wrapObj = {
        e: res,
        x: destroyWhenCallRender
      };
      cache[key] = wrapObj;
      //service托管检查
      if (DEBUG && res && (res.id + G_EMPTY).indexOf('\x1es') === 0) {
        res['@{service#captured}'] = 1;
        if (!destroyWhenCallRender) {
          Magix.deprecated('beware! May be you should set destroyWhenCallRender = true');
        }
      }
    } else {
      wrapObj = cache[key];
      res = wrapObj && wrapObj.e || res;
    }
    return res;
  },
  getManaged(key) {
    Magix.deprecated('Deprecated View#getManaged use View#capture instead');
    return this.capture(key);
  },
  removeManaged(key) {
    Magix.deprecated('Deprecated View#removeManaged use View#release instead');
    return this.release(key, 1);
  },
  destroyManaged(e) {
    View_DestroyAllResources(this, 1);
  },
  load() {
    return Promise.resolve();
  },
  /**
 * 通知当前view即将开始进行html的更新
 * @param {String} [id] 哪块区域需要更新，默认整个view
 * @deprecated Magix3.8.10中不再fire `prerender`事件
 */
  beginUpdate(id, me) {
    me = this;
    if (me['@{view#sign}'] > 0 && me['@{view#rendered}']) {
      me.owner.unmountZone(id, 1);
      me.fire('prerender', {
        id: id
      });
    }
  },
  /**
   * 通知当前view结束html的更新
   * @param {String} [id] 哪块区域结束更新，默认整个view
   * @deprecated Magix3.8.10不再fire `rendered`事件
   */
  endUpdate(id, inner, me /*#if(modules.linkage){#*/, o, f /*#}#*/) {
    me = this;
    if (me['@{view#sign}'] > 0) {
      id = id || me.id;
      me.fire('rendered', {
        id
      });
      if (inner) {
        f = inner;
      } else {
        /*#if(modules.linkage){#*/
        f = me['@{view#rendered}'];
        /*#}#*/
        me['@{view#rendered}'] = 1;
      }
      /*#if(modules.linkage){#*/
      o = me.owner;
      o.mountZone(id, G_Undefined, inner);
      if (!f) {
        /*#if(modules.es3){#*/
        Timeout(me.wrapAsync(() => {
          Vframe_RunInvokes(o);
        }), 0);
        /*#}else{#*/
        Timeout(me.wrapAsync(Vframe_RunInvokes), 0, o);
        /*#}#*/
      }
      /*#}else{#*/
      me.owner.mountZone(id, G_Undefined, inner);
      /*#}#*/
    }
  },
  /**
   * @deprecated 恢复为Magix3.7.0的方法，设置view的html内容
   * @param {String} id 更新节点的id
   * @param {Strig} html html字符串
   * @example
   * render:function(){
   *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
   * }
   */
  setHTML(id, html) {
    this.beginUpdate(id);
    if (this['@{view#sign}'] > 0) {
      let node = G_GetById(id);
      if (node) {
        $(node).html(View_SetEventOwner(html, this.id));
      }
    }
    this.endUpdate(id);
  },
  setViewHTML: function (html) {
    this.setHTML(this.id, html);
  },
  /**
   * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
   * @function
   * @param {Object} e 通过postMessageTo传递的第二个参数
   */
  receiveMessage: G_NOOP,
  /**
   * 向某个vframe发送消息
   * @param {Array|String} aims  目标vframe id数组
   * @param {Object} args 消息对象
   */
  postMessageTo(aims, args) {
    PrepareVOMMessage(Vframe);

    if (!Magix.isArray(aims)) {
      aims = [aims];
    }
    if (!args) args = {};
    for (let i = 0, it; i < aims.length; i++) {
      it = aims[i];
      let vframe = Vframe.get(it);
      if (vframe) {
        PostMessage(vframe, args);
      } else {
        if (!VOMEventsObject[it]) {
          VOMEventsObject[it] = [];
        }
        VOMEventsObject[it].push(args);
      }
    }
  }
});

S.add('magix/magix', () => Magix);
S.add('magix/event', () => Magix.Event);
S.add('magix/router', () => Router);
S.add('magix/vframe', () => Vframe);
S.add('magix/vom', () => Vframe);
S.add('magix/view', () => View);
S.add('mxext/view', () => View);
//////////////////////// Shim ////////////////////////