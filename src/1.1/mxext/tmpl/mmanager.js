var Has = Magix.has;
var SafeExec = Magix.safeExec;
var Mix = Magix.mix;
var Prefix = 'mr';
var Split = String.fromCharCode(26);
var IsFunction = Magix.isFunction;
var DefaultCacheTime = 20 * 60 * 1000;
var Ser = function(o, a, p) {
    a = [];
    for (p in o) {
        a.push(p, Prefix, o[p]);
    }
    return a;
};

var DefaultCacheKey = function(meta, attrs) {
    return [meta.name, Ser(attrs.urlParams), Ser(attrs.postParams)].join(Split);
};
var Now = Date.now || function() {
        return +new Date();
    };
var Guid = Now();
var JoinedCache = Magix.cache();
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
 */
var MManager = function(modelClass) {
    var me = this;
    me.$mClass = modelClass;
    me.$mCache = Magix.cache();
    me.$mCacheKeys = {};
    me.$mMetas = {};
    me.$mSrcMs = [];
    me.id = 'mm' + Guid--;
};

var Slice = [].slice;
var WhiteList = {
    urlParams: 1,
    postParams: 1,
    cacheKey: 1,
    cacheTime: 1,
    cache: 1,
    before: 1,
    after: 1
};

var WrapDone = function(fn, model, idx) {
    return function() {
        return fn.apply(model, [model, idx].concat(Slice.call(arguments)));
    };
};
var IsMxView = function(view) {
    return view && view.manage;
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
        if (IsMxView(last)) {
            last.manage(mr.id, mr);
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
     */
    create: function(modelClass, alias) {
        if (!modelClass) {
            throw Error('ungiven modelClass');
        }
        return new MManager(modelClass, alias);
    }
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
    this.$doTask = false;
    this.$reqModels = {};
    this.id = Prefix + Guid--;
};

Mix(MRequest.prototype, {
    /**
     * @lends MRequest#
     */
    /**
     * 获取models，该用缓存的用缓存，该发起请求的请求
     * @private
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2},params:[]}
     * @param {Function} done   完成时的回调
     * @param {Integer} flag   获取哪种类型的models
     * @param {Boolean} save 是否是保存的动作
     * @return {MRequest}
     */
    send: function(models, done, flag, save) {
        var me = this;
        if (me.$doTask) {
            me.next(function() {
                this.send(models, done, flag, save);
            });
            return me;
        }
        me.$doTask = true;

        var host = me.$host;
        var modelsCache = host.$mCache;
        var modelsCacheKeys = host.$mCacheKeys;
        var reqModels = me.$reqModels;

        if (!Magix.isArray(models)) {
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

        var doneIsArray = Magix.isArray(done);
        if (doneIsArray) {
            doneArgs = new Array(done.length);
        }
        var doneFn = function(model, idx, err) {
            if (me.$destroy) return; //销毁，啥也不做
            current++;
            delete reqModels[model.id];
            var mm = model.$mm;
            var cacheKey = mm.key;
            doneArr[idx] = model;
            if (err) {
                hasError = true;
                currentError = true;
                latestMsg = err;
                errorArgs.msg = err;
                errorArgs[idx] = err;
            } else {
                currentError = false;
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
                if (!model.fromCache && mm.used > 0) {
                    model.fromCache = true;
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
                //console.log(S.clone(orderlyArr),idx);
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
                        reqModels[modelEntity.id] = modelEntity;
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
                throw Error('miss attrs:' + models);
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
        var reqModels = me.$reqModels;
        var modelsCacheKeys = host.$mCacheKeys;

        for (var p in reqModels) {
            var m = reqModels[p];
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

        me.$reqModels = {};
        me.$queue = [];
        me.$doTask = false;
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
        if (!me.$doTask) {
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
        me.$doTask = false;
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
        me.$destroy = true;
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
     * @param {Object} models.options 传递的参数信息，如{uri:'test',isJSONP:true,updateIdent:true}
     * @param {Object} models.urlParams 发起请求时，默认的get参数对象
     * @param {Object} models.postParams 发起请求时，默认的post参数对象
     * @param {String} models.cacheKey 指定model缓存的key，当指定后，该model会进行缓存，下次不再发起请求
     * @param {Integer} models.cacheTime 缓存过期时间，以毫秒为单位，当过期后，再次使用该model时会发起新的请求(前提是该model指定cacheKey被缓存后cacheTime才有效)
     * @param {Boolean} models.cache 当您同时需要指定cacheKey和cacheTime时，可通过cache=true快捷指定，设置cache=true后，cacheTime默认为20分钟，您可以通过cacheTime显式控制
     * @param {Function} models.before model在发起请求前的回调
     * @param {Function} models.after model在结束请求，并且成功后回调
     */
    registerModels: function(models, prefix) {
        /*
                name:'',
                options:{
                    uri:'',
                    jsonp:'true'
                },
                urlParams:'',
                postParams:'',
                cacheTime:20000,//缓存多久
                before:function(m){

                },
                after:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;
        prefix = prefix || '';
        if (!Magix.isArray(models)) {
            models = [models];
        }
        me.$mSrcMs = models;
        for (var i = 0, model, name; i < models.length; i++) {
            model = models[i];
            if (model) {
                name = prefix + model.name;
                if (!name) {
                    throw Error('miss name attribute');
                } else if (metas[name]) {
                    throw Error('already exist:' + name);
                }
                if (model.cache) {
                    if (!model.cacheKey) {
                        model.cacheKey = DefaultCacheKey;
                    }
                    if (!model.cacheTime) {
                        model.cacheTime = DefaultCacheTime;
                    }
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
        var me = this;
        Mix(me, methods);
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

                    one.params.push(check(i,true),check(i));
                    fn.apply(me,one.params);
                }else{
                    doneCheck('unfound:'+one.name,i,true);
                }
            }
            return {
                abort:function(){
                    aborted=true;
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

        var entity = new me.$mClass();
        entity.set(meta, WhiteList);
        entity.$mm = {
            used: 0
        };

        var before = modelAttrs.before || meta.before;

        if (IsFunction(before)) {
            SafeExec(before, [entity, meta]);
        }

        var after = modelAttrs.after || meta.after;

        entity.$mm.after = after;

        var cacheKey = modelAttrs.cacheKey || meta.cacheKey;
        if (IsFunction(cacheKey)) {
            cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
        }
        entity.$mm.key = cacheKey;

        entity.$mm.meta = meta;
        entity.set(modelAttrs, WhiteList);
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
        if (Magix.isString(modelAttrs)) {
            name = modelAttrs;
        } else {
            name = modelAttrs.name;
        }
        var meta = metas[name];
        if (!meta) {
            throw Error('Unfound:' + name);
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
            needUpdate = true;
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
        #mm_fetchall_1#
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
        #mm_fetchall_2#
        //使用
        #mm_fetchall_3#
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
        if (IsMxView(view)) {
            view.manage(mr.id, mr);
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
        var list = modelsCache.c;
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
     * @param  {String|Object} modelAttrs
     * @return {Model}
     */
    getCachedModel: function(modelAttrs) {
        var me = this;
        var modelsCache = me.$mCache;
        var entity = null;
        var cacheKey;
        var meta;
        if (Magix.isString(modelAttrs)) {
            cacheKey = modelAttrs;
        } else {
            meta = me.getModelMeta(modelAttrs);
            cacheKey = modelAttrs.cacheKey || meta.cacheKey;
            if (IsFunction(cacheKey)) {
                cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
            }
        }

        if (cacheKey) {
            var requestCacheKeys = me.$mCacheKeys;
            var info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info.e;
            } else { //缓存
                entity = modelsCache.get(cacheKey);
                if (entity) {
                    if (!meta) meta = entity.$mm.meta;
                    var cacheTime = modelAttrs.cacheTime || meta.cacheTime || 0;

                    if (IsFunction(cacheTime)) {
                        cacheTime = SafeExec(cacheTime, [meta, modelAttrs]);
                    }

                    if (cacheTime > 0 && Now() - entity.$mm.done > cacheTime) {
                        me.clearCacheByKey(cacheKey);
                        entity = null;
                    }
                }
            }
        }
        return entity;
    },
    /**
     * 联合其它MManager查询
     * @param {MManager} manager 要联合的Manager
     * @param {String} [prefix] 为联合的Manager中的元信息名称加的前缀，当2个Manager内部有同名的元信息时的解决方案
     * @return {MManager}
     * @example
     * //假设我们有2个Manager
     * var ReportManager=MM.create(AppModel);
     * ReportManager.registerModels([{
     *     name:'News_List'
     *     url:'report/news/list.json'
     * }]);
     *
     * var VideoManager=MM.create(AppModel);
     * VideoManager.registerModels([{
     *     name:'News_List',
     *     url:'video/news/list.json'
     * }]);
     *
     * //考虑以上2个manager同时使用的情况：我们需要体育新闻和视频新闻，我们可能会这样写：
     *  render:function(){
     *      var me=this;
     *      var r1=ReportManager.fetchAll({
     *          name:'News_List'
     *      },function(e,m){
     *          if(!e){
     *              var r2=VideoManager.fetchAll({
     *                  name:'News_List'
     *              },function(e,m){
     *
     *              });
     *              me.manage(r2);
     *          }
     *      });
     *      me.manage(r1);
     *  }
     *
     * //如上需要嵌套，而且不能同时发起请求。通过join后我们可以把2个manager合并成一个来请求：
     *
     * var TempManager=ReportManager.join(VideoManager,'Video_');//因为ReportManger与VideoManager有相同的News_List,因此我们给Video的加上一个前缀Video_以示区分
     * var r=TempManager.fetchAll([{
     *     name:'News_List'
     * },{
     *     name:'Video_News_List'
     * }],function(e,reportNews,videoNews){
     *
     * });
     * me.manage(r);
     */
    join: function(manager, prefix) {
        var me = this;
        var mclass = me.$mClass;
        if (mclass != manager.$mClass) {
            throw new Error('Managers model class must be same');
        }
        var key = me.id + '$' + manager.id;
        var m = JoinedCache.get(key);
        if (!m) {
            m = new MManager(mclass);
            m.registerModels(me.$mSrcMs);
            m.registerModels(manager.$mSrcMs, prefix);
            JoinedCache.set(key, m);
        }
        return m;
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