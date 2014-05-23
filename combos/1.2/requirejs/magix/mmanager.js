/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.1
 **/
define("magix/mmanager", ["magix/magix", "magix/event"], function(Magix, Event) {
    /*
        #begin mm_fetchall_1#
        define('testMM',["magix/mmanager","magix/model"],function(MM,Model){
        #end#

        #begin mm_fetchall_2#
        });
        #end#

        #begin mm_fetchall_3#
        requirejs('testMM',function(TM){
        #end#
     */
    var Has = Magix.has;
var SafeExec = Magix.tryCall;
var IsArray = Magix._a;
var IsFunction = Magix._f;
var IsObject = Magix._o;

var FetchFlags_ONE = 1;
var FetchFlags_ORDER = 2;
var FetchFlags_ALL = 4;
var PostParams = 'postParams';
var UrlParams = 'urlParams';

var Now = Date.now || function() {
        return +new Date();
    };
var WJSON = window.JSON;
var Mix = Magix.mix;
var DefaultCacheTime = 20 * 60 * 1000;
var Ser = function(o, f, a, p) {
    if (IsFunction(o)) { //一定要先判断
        if (f) a = Ser(SafeExec(o));
    } else if (WJSON) {
        a = WJSON.stringify(o);
    } else if (IsObject(o) || IsArray(o)) {
        a = [];
        for (p in o) {
            if (Has(o, p)) {
                a.push(p, '\u001a', Ser(o[p]));
            }
        }
    } else {
        a = o;
    }
    return a;
};
/*
    a=['1','2,']
    b=['1','2','']
 */
var DefaultCacheKey = function(keys, meta, attrs) {
    var arr = [meta.name, Ser(attrs)];
    var locker = {};
    for (var i = keys.length - 1, key; i > -1; i--) {
        key = keys[i];
        if (!locker[key]) {
            arr.push(locker[key] = Ser(meta[key], 1), Ser(attrs[key], 1));
        }
    }
    return arr.join('\u001a');
};
var ProcessCache = function(attrs) {
    var cache = attrs.cache;
    if (cache) {
        cache = cache === true ? DefaultCacheTime : cache | 0;
    }
    return cache;
};


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
 * @borrows Event.rely as #rely
 * @param {Model} modelClass Model类
 * @param {Array} serKeys 序列化生成cacheKey时，除了使用urlParams和postParams外，额外使用的key
 */
var MManager = function(modelClass, serKeys) {
    var me = this;
    me.$mClass = modelClass;
    me.$mCache = Magix.cache();
    me.$mCacheKeys = {};
    me.$mMetas = {};
    me.$sKeys = (serKeys && (EMPTY + serKeys).split(COMMA) || []).concat(PostParams, UrlParams); // (serKeys ? (IsArray(serKeys) ? serKeys : [serKeys]) : []).concat('postParams', 'urlParams');
    me.id = 'mm' + (++COUNTER);
    SafeExec(MManager.$, arguments, me);
};

var Slice = [].slice;


var WrapDone = function(fn, model, idx, ops) {
    return function(err) {
        return fn.apply(model, [idx, ops, err]);
    };
};
var CacheDone = function(err, ops) {
    //
    var cacheKey = ops.b;
    var modelsCacheKeys = ops.a;
    var cached = modelsCacheKeys[cacheKey];
    if (cached) {
        var fns = cached.q;
        delete modelsCacheKeys[cacheKey];
        SafeExec(fns, err, cached.e);
    }
};
var DoneFn = function(idx, ops, err) {
    //
    var model = this;
    var request = ops.a;
    var reqs = ops.c;
    var doneArr = ops.d;
    var errorArgs = ops.g;
    var modelsCache = ops.i;
    var host = ops.j;
    var flag = ops.k;
    var doneIsArray = ops.l;
    var done = ops.m;
    var doneArgs = ops.n;
    var orderlyArr = ops.o;

    var currentError;

    //

    ops.b++; //exec count
    //
    delete reqs[model.id];
    //
    var mm = model.$mm;
    var cacheKey = mm.key;
    doneArr[idx] = model;
    if (err) {
        ops.e = 1;
        currentError = 1;
        ops.f = err;
        errorArgs.msg = err;
        errorArgs[idx] = err;
        host.fire('fail', {
            model: model,
            msg: err
        });
    } else {
        if (!cacheKey || (cacheKey && !modelsCache.has(cacheKey))) {
            if (cacheKey) {
                modelsCache.set(cacheKey, model);
            }
            mm.time = Now();
            var succ = mm.done;

            if (succ) { //有succ
                SafeExec(succ, model);
            }
            host.fire('done', {
                model: model
            });
        }
        if (mm.used > 0) {
            model.fromCache = 1;
        }
        mm.used++;
    }
    if (!request.$oust) { //销毁，啥也不做
        if (flag == FetchFlags_ONE) { //如果是其中一个成功，则每次成功回调一次
            var m = doneIsArray ? done[idx] : done;
            if (m) {
                doneArgs[idx] = SafeExec(m, [currentError ? errorArgs : null, model, errorArgs], request);
            }
        } else if (flag == FetchFlags_ORDER) {
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
                doneArgs[i] = SafeExec(d, [t.e ? errorArgs : null, t.m, errorArgs].concat(doneArgs), request);
            }
            orderlyArr.i = i;
        }
        if (ops.b == ops.h) { //ops.h total count
            if (!ops.e) {
                errorArgs = null;
            }
            if (flag == FetchFlags_ALL) {
                doneArr.unshift(errorArgs);
                doneArgs[0] = errorArgs;
                doneArgs[1] = SafeExec(done, doneArr, request);
            } else {
                doneArgs.unshift(errorArgs);
            }
            request.$ntId = setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                request.doNext(doneArgs);
            }, 30);
        }
    }
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
        return new MManager(modelClass, serKeys);
    },
    /**
     * 扩展MMamager
     * @param  {Object} props 扩展到原型上的方法
     * @param  {Function} ctor  在初始化MManager时进行调用的方法
     */
    mixin: function(props, ctor) {
        if (ctor) MManager.$.push(ctor);
        Mix(MManager.prototype, props);
    },
    $: []
});


/**
 * 辅助MManager
 * @name MRequest
 * @class
 * @namespace
 * @param {MManager} host
 */
var MRequest = function(host) {
    var me = this;
    me.$host = host;
    me.$reqs = {};
    me.id = 'mr' + (++COUNTER);
    me.$queue = [];
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
        var doneArgs = [];

        var doneIsArray = IsArray(done);
        if (doneIsArray) {
            doneArgs = new Array(done.length);
        }

        var options = {
            a: me,
            b: 0, //current done
            c: me.$reqs,
            d: new Array(total),
            //e hasError,
            //f lastMsg
            g: {},
            h: total,
            i: modelsCache,
            j: host,
            k: flag,
            l: doneIsArray,
            m: done,
            n: doneArgs,
            o: []
        };

        for (var i = 0, model; i < models.length; i++) {
            model = models[i];
            if (model) {
                var modelInfo = host.getModel(model, save);

                var modelEntity = modelInfo.entity;
                var cacheKey = modelEntity.$mm.key;

                var wrapDoneFn = WrapDone(DoneFn, modelEntity, i, options);
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
                            a: modelsCacheKeys,
                            b: cacheKey
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
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     * @example
        //定义
        
        define('testMM',["magix/mmanager","magix/model"],function(MM,Model){
        
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
        
        requirejs('testMM',function(TM){
        
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(err,m1,m2){

            });
        });
     */
    fetchAll: function(models, done) {
        return this.send(models, done, FetchFlags_ALL);
    },
    /**
     * 保存models，所有请求完成回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return this.send(models, done, FetchFlags_ALL, 1);
    },
    /**
     * 获取models，按顺序执行回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     * @example
        //代码片断：
        //1：获取多个model，回调只有一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//按m1,m2,m3顺序回调，即使m2的请求先于m1的返回，也是m1调用后才调用m2，只提供一个回调时，回调会被调用三次
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
        ],function(err,model){//调用m1
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//m1调用完成后调用m2
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
        //注意，回调多于一个时，当提供的回调多于或少于model个数时，多或少的会被忽略掉
     */
    fetchOrder: GenRequestMethod(FetchFlags_ORDER),
    /**
     * 保存models，按顺序执行回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: GenRequestMethod(FetchFlags_ORDER, 1),
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: GenRequestMethod(FetchFlags_ONE, 1),
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
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
        ],function(err,model){//m1返回即调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//m2返回即调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
     */
    fetchOne: GenRequestMethod(FetchFlags_ONE),
    /**
     * 中止所有model的请求
     * 注意：调用该方法后会中止请求，并调用回调传递abort异常消息
     */
    stop: function() {
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
                        nfns.push(fn); //仍然保留
                    } else {
                        rfns.push(fn); //需要中止
                    }
                }
                //
                if (nfns.length) {
                    SafeExec(rfns, 'abort', cache.e); //model并未中止，需要手动触发
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
        me.$queue.push(callback);
        if (!me.$busy) {
            var args = me.$args;
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
        me.$args = preArgs;
    },
    /**
     * 销毁当前请求，与stop的区别是：stop后还可以继续发起新请求，而destroy后则不可以，而且不再调用相应的回调
     */
    destroy: function() {
        var me = this;
        me.$oust = 1;
        me.stop();
    }
});
MManager.mixin(Event);
MManager.mixin({
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
     * @param {Function} models.done model在结束请求，并且成功后回调
     */
    registerModels: function(models) {
        /*
                name:'',
                urlParams:{},
                postParams:{},
                done:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;
        if (!IsArray(models)) {
            models = [models];
        }
        for (var i = 0, model, name, cache; i < models.length; i++) {
            model = models[i];
            if (model) {
                name = model.name;
                if (!name) {
                    TError('miss name');
                } else if (metas[name]) {
                    TError('already exist:' + name);
                }
                cache = ProcessCache(model);
                if (cache) {
                    model.cache = cache;
                }
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
        //modelAttrs = ProcessModelAttrs(modelAttrs);

        var meta = me.getModelMeta(modelAttrs);
        var cache = ProcessCache(modelAttrs) || meta.cache;
        var entity = new me.$mClass();
        var mm;
        entity.set(meta);
        entity.$mm = mm = {
            used: 0,
            done: meta.done
        };
        if (cache) {
            mm.key = DefaultCacheKey(me.$sKeys, meta, modelAttrs);
        }


        if (modelAttrs.name) {
            entity.set(modelAttrs);
        }

        //默认设置的
        entity.setUrlParams(meta[UrlParams]);
        entity.setPostParams(meta[PostParams]);

        //临时传递的
        entity.setUrlParams(modelAttrs[UrlParams]);
        entity.setPostParams(modelAttrs[PostParams]);

        me.fire('inited', {
            model: entity
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
        var name = modelAttrs.name || modelAttrs;
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
            update: needUpdate
        };
    },
    /**
     * 创建MRequest对象
     * @param {MxView} view 传递MxView对象，托管MRequest
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
                if (entity && cache > 0 && Now() - entity.$mm.time > cache) {
                    me.clearCacheByKey(cacheKey);
                    entity = 0;
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
 * @param {Model} e.model model对象
 */

/**
 * Model对象完成请求后触发
 * @name MManager#done
 * @event
 * @param {Object} e
 * @param {Model} e.model model对象
 */

/**
 * Model对象请求处理失败后触发
 * @name MManager#fail
 * @event
 * @param {Object} e
 * @param {Model} e.msg 错误描述信息
 */
    return MManager;
});