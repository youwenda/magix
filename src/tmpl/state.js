var State_AppData = {};
var State_AppDataKeyRef = {};
var State_ChangedKeys = {};
var State_DataIsChanged = 0;
/*#if(modules.router){#*/
if (DEBUG) {
    var State_DataWhereSet = {};
}
/*#}#*/
var State_IsObserveChanged = function(view, keys, r) {
    var oKeys = view.$os;
    if (oKeys) {
        for (var i = oKeys.length; i--;) {
            var ok = oKeys[i];
            r = G_Has(keys, ok);
            if (r) break;
        }
    }
    return r;
};
var SetupKeysRef = function(keys) {
    keys = (keys + G_EMPTY).split(',');
    for (var i = 0, key; i < keys.length; i++) {
        key = keys[i];
        if (G_Has(State_AppDataKeyRef, key)) {
            State_AppDataKeyRef[key]++;
        } else {
            State_AppDataKeyRef[key] = 1;
        }
    }
    return keys;
};
var TeardownKeysRef = function(keys) {
    for (var i = 0, key, v; i < keys.length; i++) {
        key = keys[i];
        if (G_Has(State_AppDataKeyRef, key)) {
            v = --State_AppDataKeyRef[key];
            if (!v) {
                delete State_AppDataKeyRef[key];
                delete State_AppData[key];
                /*#if(modules.router){#*/
                if (DEBUG) {
                    delete State_DataWhereSet[key];
                }
                /*#}#*/
            }
        }
    }
};
/*#if(modules.router){#*/
if (DEBUG) {
    setTimeout(function() {
        Router.on('changed', function() {
            setTimeout(function() {
                var keys = [];
                var cls = [];
                for (var p in State_DataWhereSet) {
                    if (!State_AppDataKeyRef[p]) {
                        cls.push(p);
                        keys.push('key:"' + p + '" set by page:"' + State_DataWhereSet[p] + '"');
                    }
                }
                if (keys.length) {
                    console.warn('beware! Remember to clean ' + keys + ' in {Magix.State}   Clean use view.mixins like mixins:[Magix.State.clean("' + cls + '")]');
                }
            }, 200);
        });
    }, 0);
}
/*#}#*/
/**
 * 可观察的内存数据对象
 * @name State
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
var State = G_Mix({
    /**
     * @lends State
     */
    /**
     * 从Magix.State中获取数据
     * @param {String} [key] 数据key
     * @return {Object}
     */
    get: function(key) {
        var r = key ? State_AppData[key] : State_AppData;
        if (DEBUG) {
            /*#if(modules.router){#*/
            if (key) {
                var loc = Router.parse();
                if (G_Has(State_DataWhereSet, key) && State_DataWhereSet[key] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + key + '" where it set by page:' + State_DataWhereSet[key]);
                }
            }
            /*#}#*/
            r = Safeguard(r, null, function(dataKey) {
                /*#if(modules.router){#*/
                var loc = Router.parse();
                if (G_Has(State_DataWhereSet, dataKey) && State_DataWhereSet[dataKey] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + dataKey + '" where it set by page:' + State_DataWhereSet[dataKey]);
                }
                /*#}#*/
            }, function(path, value) {
                var sub = key ? key : path;
                console.warn('beware! You direct set "{Magix.State}.' + sub + '" a new value  You should call Magix.State.set() and Magix.State.digest() to notify other views {Magix.State} changed');
                if (G_IsPrimitive(value) && !/\./.test(sub)) {
                    console.warn('beware! Never set a primitive value ' + JSON.stringify(value) + ' to "{Magix.State}.' + sub + '" This may will not trigger "changed" event');
                }
            });
        }
        return r;
    },
    /**
     * 设置数据
     * @param {Object} data 数据对象
     */
    set: function(data) {
        State_DataIsChanged = G_Set(data, State_AppData, State_ChangedKeys) || State_DataIsChanged;
        /*#if(modules.router){#*/
        if (DEBUG) {
            var loc = Router.parse();
            for (var p in data) {
                State_DataWhereSet[p] = loc.path;
            }
        }
        /*#}#*/
        return this;
    },
    /**
     * 检测数据变化，如果有变化则派发changed事件
     * @param  {Object} data 数据对象
     */
    digest: function(data) {
        if (data) {
            State.set(data);
        }
        if (State_DataIsChanged) {
            this.fire('changed', {
                keys: State_ChangedKeys
            });
            State_DataIsChanged = 0;
            State_ChangedKeys = {};
        }
    },
    /**
     * 获取当前数据与上一次数据有哪些变化
     * @return {Object}
     */
    diff: function() {
        return State_ChangedKeys;
    },
    /**
     * 清除数据，该方法需要与view绑定，写在view的mixins中，如mixins:[Magix.Sate.clean('user,permission')]
     * @param  {String} keys 数据key
     */
    clean: function(keys) {
        if (DEBUG) {
            var called = false;
            setTimeout(function() {
                if (!called) {
                    throw new Error('Magix.State.clean only used in View.mixins like mixins:[Magix.State.clean("p1,p2,p3")]');
                }
            }, 1000);
        }
        if (DEBUG) {
            return {
                '\x1e': keys,
                ctor: function() {
                    var me = this;
                    called = true;
                    keys = SetupKeysRef(keys);
                    me.on('destroy', function() {
                        TeardownKeysRef(keys);
                    });
                }
            };
        }
        return {
            ctor: function() {
                var me = this;
                keys = SetupKeysRef(keys);
                me.on('destroy', function() {
                    TeardownKeysRef(keys);
                });
            }
        };
    }
    /**
     * 当State中的数据有改变化后触发
     * @name State.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.keys  包含哪些数据变化的key集合
     */
}, Event);
Magix.State = State;