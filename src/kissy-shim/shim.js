//////////////////////// Shim ////////////////////////

// Magix API
Magix.version = '3.8.10';
S.each(['isObject', 'isArray', 'isString', 'isFunction', 'isNumber'], k => Magix[k] = S[k]);
Magix.isNumeric = o => !isNaN(parseFloat(o)) && isFinite(o);
Magix.pathToObject = G_ParseUri;
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

G_Assign(Magix.local, Magix.Event);

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
Magix.listToMap = G_ToMap;

Safeguard = o => o;

Magix.start = (cfg) => {
  if (!cfg.ini && cfg.iniFile) {
    console.warn('Deprecated Config.iniFile,use Config.ini instead');
    cfg.ini = cfg.iniFile;
  }
  if (!cfg.exts && cfg.extensions) {
    console.warn('Deprecated Config.extensions,use Config.exts instead');
    cfg.exts = cfg.extensions;
  }
  if (cfg.execError) {
    console.warn('Deprecated Config.execError,use Config.error instead');
    cfg.error = cfg.execError;
  }
  Magix.boot(cfg);
};

// Event
Event.un = Event.off;

// Router
let G_LocationChanged;
const G_Location = {
  get(key) {
    console.warn('Deprecated View#location,use Magix.Router.parse() instead。请查阅：http://gitlab.alibaba-inc.com/mm/afp/issues/2 View#location部分');
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

    G_Assign(query, {
      pathname: query.path
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
      result.pathname = result.path;
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
  const occur = 1;
  for (let p in location) {
    if (G_Has(location, p) && p !== 'get') {
      G_Location[p] = location[p];
    }
  }
  
  location.hash.pathname = location.hash.path;
  location.query.pathname = location.query.path;

  G_LocationChanged = G_Assign(e, {
    occur,
    location,
    changed: {
      pathname: e[G_PATH],
      [Router_VIEW]: e[Router_VIEW],
      [G_PARAMS]: e[G_PARAMS]
    },
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
          console.warn('Deprecated View#locationChange');
          view.locationChange(args);
        }
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
            for (let p in view) {
              if (G_Has(view, p) && viewProto[p]) {
                throw new Error(`avoid write ${p} at file ${viewPath}!`);
              }
            }
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

          // 为view补充的实例和原型属性
          view.path = po[G_PATH];
          Object.defineProperty(view, sign, {
            get() {
              return view['@{view#sign}'];
            }
          });

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
              G_ToTry(view.init, /*#if(modules.viewSlot){#*/[params, vNodes]/*#}else{#*/params/*#}#*/, view);
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
    if (view) {
      view.owner = G_Assign({}, VframeNoopProto);
    }
  },
  /**
   * 加载某个区域下的view
   * @param {HTMLElement|String} zoneId 节点对象或id
   * @example
   * // html
   * // &lt;div id="zone"&gt;
   * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
   * // &lt;/div&gt;
   *
   * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
   */
  mountZone(zoneId, inner /*,keepPreHTML*/) {
    let me = this;
    let vf, id, vfs = [];
    zoneId = zoneId || me.id;
    
    let vframes = $(`${G_HashKey}${zoneId} vframe`);
    if (vframes.length) {
      console.warn('Deprecated vframe tag, use div[mx-view] instead');
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
          me.mountVframe(vfs[id] = id, vf);
        }
      } else {
        me.mountVframe(id, vf);
      }
    }
    me['@{vframe#hold.fire}'] = 0;
    if (!inner) {
      Vframe_NotifyCreated(me);
    }
  },
  unmountZoneVframes(node, params) {
    console.warn('Deprecated Vframe#unmountZoneVframes use Vframe#unmountZone instead');
    if (node && node.nodeType) {
      node = IdIt(node);
    }
    this.unmountZone(node, params);
  },
  mountZoneVframes: function(node, params) {
    console.warn('Deprecated Vframe#mountZoneVframes use Vframe#mountZone instead');
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
            let bound = S.bind(events[type][fn], events[type]);
            prop[fn + '<' + type + '>'] = bound;
            if (prop['@{view#events.object}']) {
              prop['@{view#events.object}'][type] = prop['@{view#events.object}'][type] | 1;
              prop[fn + G_SPLITER + type] = bound;
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

  return origViewPrepare(View);
};

//////////////////////// Shim ////////////////////////