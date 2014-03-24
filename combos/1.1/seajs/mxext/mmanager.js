/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.1
 **/
define("mxext/mmanager", ["magix/magix", "magix/event"], function(require) {
    /*
        #begin mm_fetchall_1#
        define('testMM',["mxext/mmanager","mxext/model"],function(require){
            var MM=require("mxext/mmanager");
            var Model=require("mxext/model");
        #end#

        #begin mm_fetchall_2#
        });
        #end#

        #begin mm_fetchall_3#
        seajs.use('testMM',function(TM){
        #end#
     */
    var Magix = require("magix/magix");
    var Event = require("magix/event");
    var Has = Magix.has;
var SafeExec = Magix.safeExec;
var IsArray = Magix._a;

var Mix = Magix.mix;
var Prefix = 'mr';
var Split = String.fromCharCode(26);
var DefaultCacheTime = 20 * 60 * 1000;
var Ser = function(o, a, p) {
    a = [];
    for (p in o) {
        a.push(p, Prefix, o[p]);
    }
    return a;
};
/*
    a=['1','2,']
    b=['1','2','']
 */
var DefaultCacheKey = function(keys, meta, attrs) {
    var arr = [meta.name];
    var locker = {};
    for (var i = keys.length - 1, key; i > -1; i--) {
        key = keys[i];
        if (!locker[key]) {
            arr.push(locker[key] = Ser(meta[key]), Ser(attrs[key]));
        } else {
            keys.splice(i, 1);
        }
    }
    return arr.join(Split);
};
var ProcessCache = function(attrs) {
    var cache = attrs.cache;
    if (cache) {
        var ctime = attrs.cacheTime | 0;
        if (ctime) {
            cache = ctime;
        } else {
            cache = cache === true ? DefaultCacheTime : cache | 0;
        }
    }
    return cache;
};
var Now = Date.now || function() {
        return +new Date();
    };
var Guid = Now();
var TError = function(e) {
    throw Error(e);
};
/**
 * Model管理对象，可方便的对Model进行缓存和更新
 * @name MManager
 * @class
 * @namespace
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @borrows Event.once as #once
 * @param {Model} modelClass Model类
 * @param {Array} serKeys 序列化生成cacheKey时，除了使用urlParams和postParams外，额外使用的key
 */
var MManager = function(modelClass, serKeys) {
    var me = this;
    me.$mClass = modelClass;
    me.$mCache = Magix.cache();
    me.$mCacheKeys = {};
    me.$mMetas = {};
    me.$sKeys = ['postParams', 'urlParams'].concat(IsArray(serKeys) ? serKeys : []);
    me.id = 'mm' + Guid--;
    SafeExec(MManager.ms, arguments, me);
};

var Slice = [].slice;


var WrapDone = function(fn, model, idx) {
    return function() {
        return fn.apply(model, [model, idx].concat(Slice.call(arguments)));
    };
};
var CacheDone = function(err, data, ops) {
    var cacheKey = ops.key;
    var modelsCacheKeys = ops.cKeys;
    var cache = modelsCacheKeys[cacheKey];
    if (cache) {
        var fns = cache.q;
        delete modelsCacheKeys[cacheKey];
        SafeExec(fns, err);
    }
};
var GenMRequest = function(method) {
    return function() {
        var mr = new MRequest(this);
        var args = arguments;
        var last = args[args.length - 1];
        if (last && last.manage) {
            last.manage(mr);
            args = Slice.call(args, 0, -1);
        }
        return mr[method].apply(mr, args);
    };
};
var GenRequestMethod = function(flag, save) {
    return function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : done, flag, save);
    };
};
Mix(MManager, {
    /**
     * @lends MManager
     */
    /**
     * 创建Model类管理对象
     * @param {Model} modelClass Model类
     * @param {Array} serKeys 序列化生成cacheKey时，除了使用urlParams和postParams外，额外使用的key
     */
    create: function(modelClass, serKeys) {
        if (!modelClass) {
            TError('ungiven modelClass');
        }
        return new MManager(modelClass, serKeys);
    },
    /**
     * 扩展MMamager
     * @param  {Object} props 扩展到原型上的方法
     * @param  {Function} ctor  在初始化MManager时进行调用的方法
     */
    mixin: function(props, ctor) {
        if (ctor) MManager.ms.push(ctor);
        Mix(MManager.prototype, props);
    },
    ms: []
});

var FetchFlags = {
    ALL: 1,
    ONE: 2,
    ORDER: 4
};

/**
 * 辅助MManager
 * @name MRequest
 * @class
 * @namespace
 * @param {MManager} host
 */
var MRequest = function(host) {
    this.$host = host;
    this.$busy = 0;
    this.$reqs = {};
    this.id = Prefix + Guid--;
};

Mix(MRequest.prototype, {
    /**
     * @lends MRequest#
     */
    /**
     * 获取models，该用缓存的用缓存，该发起请求的请求
     * @private
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @param {Integer} flag   获取哪种类型的models
     * @param {Boolean} save 是否是保存的动作
     * @return {MRequest}
     */
    send: function(models, done, flag, save) {
        var me = this;
        if (me.$busy) {
            me.next(function() {
                this.send(models, done, flag, save);
            });
            return me;
        }
        me.$busy = 1;

        var host = me.$host;
        var modelsCache = host.$mCache;
        var modelsCacheKeys = host.$mCacheKeys;
        var reqs = me.$reqs;

        if (!IsArray(models)) {
            models = [models];
        }
        var total = models.length;
        var current = 0;
        var hasError;
        var latestMsg;
        var currentError;

        var doneArr = new Array(total);
        var doneArgs = [];
        var errorArgs = {};
        var orderlyArr = [];

        var doneIsArray = IsArray(done);
        if (doneIsArray) {
            doneArgs = new Array(done.length);
        }
        var doneFn = function(model, idx, err) {
            if (me.$destroy) return; //销毁，啥也不做
            current++;
            delete reqs[model.id];
            var mm = model.$mm;
            var cacheKey = mm.key;
            doneArr[idx] = model;
            if (err) {
                hasError = 1;
                currentError = 1;
                latestMsg = err;
                errorArgs.msg = err;
                errorArgs[idx] = err;
            } else {
                currentError = 0;
                if (!cacheKey || (cacheKey && !modelsCache.has(cacheKey))) {
                    if (cacheKey) {
                        modelsCache.set(cacheKey, model);
                    }
                    mm.done = Now();
                    var after = mm.after;
                    var meta = mm.meta;

                    if (after) { //有after
                        SafeExec(after, [model, meta]);
                    }
                    host.fire('done', {
                        model: model,
                        meta: meta
                    });
                }
                if (mm.used > 0) {
                    model.fromCache = 1;
                }
                mm.used++;
            }

            if (flag == FetchFlags.ONE) { //如果是其中一个成功，则每次成功回调一次
                var m = doneIsArray ? done[idx] : done;
                if (m) {
                    doneArgs[idx] = SafeExec(m, [currentError ? errorArgs : null, model, errorArgs], me);
                }
            } else if (flag == FetchFlags.ORDER) {
                //var m=doneIsArray?done[idx]:done;
                orderlyArr[idx] = {
                    m: model,
                    e: currentError,
                    s: err
                };
                //
                for (var i = orderlyArr.i || 0, t, d; t = orderlyArr[i]; i++) {
                    d = doneIsArray ? done[i] : done;
                    if (t.e) {
                        errorArgs.msg = t.s;
                        errorArgs[i] = t.s;
                    }
                    doneArgs[i] = SafeExec(d, [t.e ? errorArgs : null, t.m, errorArgs].concat(doneArgs), me);
                }
                orderlyArr.i = i;
            }

            if (current >= total) {
                if (!hasError) {
                    errorArgs = null;
                }
                if (flag == FetchFlags.ALL) {
                    doneArr.unshift(errorArgs);
                    doneArgs[0] = errorArgs;
                    doneArgs[1] = SafeExec(done, doneArr, me);
                } else {
                    doneArgs.unshift(errorArgs);
                }
                me.$ntId = setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                    me.doNext(doneArgs);
                }, 30);
            }
        };

        for (var i = 0, model; i < models.length; i++) {
            model = models[i];
            if (model) {
                var modelInfo = host.getModel(model, save);
                var cacheKey = modelInfo.cKey;
                var modelEntity = modelInfo.entity;
                var wrapDoneFn = WrapDone(doneFn, modelEntity, i);
                wrapDoneFn.id = me.id;

                if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                    modelsCacheKeys[cacheKey].q.push(wrapDoneFn);
                } else {
                    if (modelInfo.update) {
                        reqs[modelEntity.id] = modelEntity;
                        if (cacheKey) {
                            modelsCacheKeys[cacheKey] = {
                                q: [wrapDoneFn],
                                e: modelEntity
                            };
                            wrapDoneFn = CacheDone;
                        }
                        modelEntity.request(wrapDoneFn, {
                            key: cacheKey,
                            cKeys: modelsCacheKeys
                        });
                    } else {
                        wrapDoneFn();
                    }
                }
            } else {
                TError('empty model');
            }
        }
        return me;
    },
    /**
     * 获取models，所有请求完成回调done
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL);
    },
    /**
     * 保存models，所有请求完成回调done
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL, 1);
    },
    /**
     * 获取models，按顺序执行回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchOrder: GenRequestMethod(FetchFlags.ORDER),
    /**
     * 保存models，按顺序执行回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: GenRequestMethod(FetchFlags.ORDER, 1),
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: GenRequestMethod(FetchFlags.ONE, 1),
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    fetchOne: GenRequestMethod(FetchFlags.ONE),
    /**
     * 中止所有model的请求
     * 注意：调用该方法后会中止请求，并调用回调传递aborted异常消息
     */
    abort: function() {
        var me = this;
        clearTimeout(me.$ntId);
        var host = me.$host;
        var reqs = me.$reqs;
        var modelsCacheKeys = host.$mCacheKeys;

        for (var p in reqs) {
            var m = reqs[p];
            var cacheKey = m.$mm.key;
            if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                var cache = modelsCacheKeys[cacheKey];
                var fns = cache.q;
                var nfns = [];
                var rfns = [];
                for (var i = 0, fn; i < fns.length; i++) {
                    fn = fns[i];
                    if (fn.id != me.id) {
                        nfns.push(fn);
                    } else if (!me.$destroy) {
                        rfns.push(fn);
                    }
                }
                SafeExec(rfns, ['abort'], me);
                if (nfns.length) {
                    cache.q = nfns;
                } else {
                    m.abort();
                }
            } else {
                m.abort();
            }
        }

        me.$reqs = {};
        me.$queue = [];
        me.$busy = 0;
    },
    /**
     * 前一个fetchX或saveX任务做完后的下一个任务
     * @param  {Function} callback 当前面的任务完成后调用该回调
     * @return {MRequest}
     * @example
        var r=MM.fetchAll([
            {name:'M1'},
            {name:'M2'}
        ],function(err,m1,m2){

            return 'fetchAllReturned';
        });

        r.next(function(err,fetchAllReturned){
            alert(fetchAllReturned);
        });
     */
    next: function(callback) {
        var me = this;
        if (!me.$queue) me.$queue = [];
        me.$queue.push(callback);
        if (!me.$busy) {
            var args = me.$latest;
            me.doNext(args);
        }
        return me;
    },
    /**
     * 做下一个任务
     * @param {Object} preArgs 上次请求任务回调的返回值
     * @private
     */
    doNext: function(preArgs) {
        var me = this;
        me.$busy = 0;
        var queue = me.$queue;
        if (queue) {
            var one = queue.shift();
            if (one) {
                SafeExec(one, preArgs, me);
            }
        }
        me.$latest = preArgs;
    },
    /**
     * 销毁当前请求，与abort的区别是：abort后还可以继续发起新请求，而destroy后则不可以，而且不再调用相应的回调
     */
    destroy: function() {
        var me = this;
        me.$destroy = 1;
        me.abort();
    }
});

Mix(Mix(MManager.prototype, Event), {
    /**
     * @lends MManager#
     */
    /**
     * 注册APP中用到的model
     * @param {Object|Array} models 模块描述信息
     * @param {String} models.name app中model的唯一标识
     * @param {Object} models.urlParams 发起请求时，默认的get参数对象
     * @param {Object} models.postParams 发起请求时，默认的post参数对象
     * @param {Boolean|Integer} models.cache指定当前请求缓存多长时间,为true默认20分钟，可传入整数表示缓存多少毫秒
     * @param {Function} models.before model在发起请求前的回调
     * @param {Function} models.after model在结束请求，并且成功后回调
     */
    registerModels: function(models) {
        /*
                name:'',
                urlParams:{},
                postParams:{},
                before:function(m){

                },
                after:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;
        if (!IsArray(models)) {
            models = [models];
        }
        for (var i = 0, model, name; i < models.length; i++) {
            model = models[i];
            if (model) {
                name = model.name;
                if (!name) {
                    TError('miss name');
                } else if (metas[name]) {
                    TError('already exist:' + name);
                }
                model.cache = ProcessCache(model);
                metas[name] = model;
            }
        }
    },
    /**
     * 注册常用方法，或以把经常几个同时请求的model封装成一个方法以便快捷调用
     * @param {Object} methods 方法对象
     */
    registerMethods: function(methods) {
        Mix(this, methods);
    },
    /**
     * 调用当前Manager注册的多个方法
     * @param {Array} args 要调用的方法列表，形如：[{name:'x',params:['o']},{name:'y',params:['z']}]
     * @param {Function} done 成功时的回调，传入参数跟args数组中对应的成功方法的值
     * @param {Function} error 失败回调，参数同上
     * @return {Object} 返回一个带abort方法的对象，用于取消这些方法的调用
     * @example
     * var MM=MManager.create(Model);
     * MM.registerMethods({
     *     methodA:function(args,done,error){
     *
     *     },
     *     methodB:function(args,done,error){
     *
     *     }
     * });
     *
     * //...
     * //使用时：
     *
     * MM.callMethods([
     *     {name:'methodA',params:['a']},
     *     {name:'methodB',params:['b']}
     * ],function(f1Result,f2Result){
     *
     * },function(msg){
     *     alert(msg)
     * })
     */
    /*callMethods:function(args,done,error){
            var me=this,
                doneArgs=[],
                errorMsg='',
                total=args.length,
                exec= 0,
                aborted,
                doneCheck=function(args,idx,isFail){
                    if(aborted)return;
                    exec++;
                    if(isFail){
                        errorMsg=args;
                    }else{
                         doneArgs[idx]=args;
                    }
                    if(total<=exec){
                        if(!errorMsg){
                            if(S.isFunction(done)){
                                done.apply(done,doneArgs);
                            }
                        }else{
                            if(S.isFunction(error)){
                                error(errorMsg);
                            }
                        }
                    }
                },
                check=function(idx,isSucc){
                    return function(args){
                        doneCheck(args,idx,!isSucc);
                    };
                };
            for(var i=0,one;i<args.length;i++){
                one=args[i];
                var fn;
                if(S.isFunction(one.name)){
                    fn=one.name;
                }else{
                    fn=me[one.name];
                }
                if(fn){
                    if(!one.params)one.params=[];
                    if(!S.isArray(one.params))one.params=[one.params];

                    one.params.push(check(i,1),check(i));
                    fn.apply(me,one.params);
                }else{
                    doneCheck('unfound:'+one.name,i,1);
                }
            }
            return {
                abort:function(){
                    aborted=1;
                }
            }
        },*/
    /**
     * 创建model对象
     * @param {Object} modelAttrs           model描述信息对象
     * @return {Model}
     */
    createModel: function(modelAttrs) {
        var me = this;
        var meta = me.getModelMeta(modelAttrs);
        var cache = ProcessCache(modelAttrs) || meta.cache;

        var entity = new me.$mClass();
        var mm;
        entity.set(meta);
        entity.$mm = mm = {
            used: 0
        };

        var before = modelAttrs.before || meta.before;

        if (before) {
            SafeExec(before, [entity, meta]);
        }

        var after = modelAttrs.after || meta.after;

        mm.after = after;

        if (cache) {
            mm.key = DefaultCacheKey(me.$sKeys, meta, modelAttrs);
        }

        mm.meta = meta;
        entity.set(modelAttrs);
        //默认设置的
        entity.setUrlParams(meta.urlParams);
        entity.setPostParams(meta.postParams);

        //临时传递的
        entity.setUrlParams(modelAttrs.urlParams);
        entity.setPostParams(modelAttrs.postParams);

        me.fire('inited', {
            model: entity,
            meta: meta
        });
        return entity;
    },
    /**
     * 获取model注册时的元信息
     * @param  {String|Object} modelAttrs 名称
     * @return {Object}
     * @throws {Error} If unfound:name
     */
    getModelMeta: function(modelAttrs) {
        var me = this;
        var metas = me.$mMetas;
        var name;
        if (Magix._s(modelAttrs)) {
            name = modelAttrs;
        } else {
            name = modelAttrs.name;
        }
        var meta = metas[name];
        if (!meta) {
            TError('Unfound:' + name);
        }
        return meta;
    },
    /**
     * 获取model对象，优先从缓存中获取
     * @param {Object} modelAttrs           model描述信息对象
     * @param {Boolean} createNew 是否是创建新的Model对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    getModel: function(modelAttrs, createNew) {
        var me = this;
        var entity;
        var needUpdate;
        if (!createNew) {
            entity = me.getCachedModel(modelAttrs);
        }

        if (!entity) {
            needUpdate = 1;
            entity = me.createModel(modelAttrs);
        }
        return {
            entity: entity,
            cKey: entity.$mm.key,
            update: needUpdate
        };
    },
    /**
     * 保存models，所有请求完成回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     */
    saveAll: GenMRequest('saveAll'),
    /**
     * 获取models，所有请求完成回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     * @example
        //定义
        
        define('testMM',["mxext/mmanager","mxext/model"],function(require){
            var MM=require("mxext/mmanager");
            var Model=require("mxext/model");
        
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        
        });
        
        //使用
        
        seajs.use('testMM',function(TM){
        
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(err,m1,m2){

            });
        });
     */
    fetchAll: GenMRequest('fetchAll'),
    /**
     * 保存models，按顺序回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     */
    saveOrder: GenMRequest('saveOrder'),
    /**
     * 获取models，按顺序回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     * @example
        //代码片断：
        //1：当按顺序获取多个model，回调只有一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//回调按M1,M2,M3的顺序被调用3次
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });

        //2:当按顺序获取多个model，回调多于一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//首先被调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//其次被调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
     */
    fetchOrder: GenMRequest('fetchOrder'),
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     */
    saveOne: GenMRequest('saveOne'),
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest}
     * @example
        //代码片断：
        //1：获取多个model，回调只有一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//m1,m2,m3，谁快先调用谁，且被调用三次
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });

        //2:获取多个model，回调多于一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//m1什么时间返回，该回调什么时间被调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//m2什么时间返回，该回调什么时间被调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
     */
    fetchOne: GenMRequest('fetchOne'),
    /**
     * 创建MRequest对象
     * @param {MxView} [view] 当传递MxView对象时，自动帮你托管MRequest
     * @return {MRequest} 返回MRequest对象
     */
    createMRequest: function(view) {
        var mr = new MRequest(this);
        if (view && view.manage) {
            view.manage(mr);
        }
        return mr;
    },
    /**
     * 根据key清除缓存的models
     * @param  {String} key 字符串
     */
    clearCacheByKey: function(key) {
        var me = this;
        var modelsCache = me.$mCache;
        modelsCache.del(key);
    },
    /**
     * 根据name清除缓存的models
     * @param  {String} name 字符串
     */
    clearCacheByName: function(name) {
        var me = this;
        var modelsCache = me.$mCache;
        var list = modelsCache.list();
        for (var i = 0; i < list.length; i++) {
            var one = list[i];
            var m = one.v;
            var mm = m && m.$mm;
            if (mm) {
                var tName = mm.meta.name;
                if (tName == name) {
                    modelsCache.del(mm.key);
                }
            }
        }
    },
    /**
     * 从缓存中获取model对象
     * @param  {Object} modelAttrs
     * @return {Model}
     */
    getCachedModel: function(modelAttrs) {
        var me = this;
        var modelsCache = me.$mCache;
        var entity = null;
        var cacheKey;
        var meta = me.getModelMeta(modelAttrs);
        var cache = ProcessCache(modelAttrs) || meta.cache;

        if (cache) {
            cacheKey = DefaultCacheKey(me.$sKeys, meta, modelAttrs);
        }

        if (cacheKey) {
            var requestCacheKeys = me.$mCacheKeys;
            var info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info.e;
            } else { //缓存
                entity = modelsCache.get(cacheKey);
                if (entity) {
                    if (cache > 0 && Now() - entity.$mm.done > cache) {
                        me.clearCacheByKey(cacheKey);
                        entity = 0;
                    }
                }
            }
        }
        return entity;
    }
});

/**
 * 创建完成Model对象后触发
 * @name MManager#inited
 * @event
 * @param {Object} e
 * @param {Object} e.meta 注册model时提供的信息
 * @param {Model} e.model model对象
 */

/**
 * Model对象完成请求后触发
 * @name MManager#done
 * @event
 * @param {Object} e
 * @param {Object} e.meta 注册model时提供的信息
 * @param {Model} e.model model对象
 */
    return MManager;
});