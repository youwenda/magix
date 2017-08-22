var State_AppData = {};
var State_AppDataKeyRef = {};
var State_ChangedKeys = {};
var State_DataIsChanged = 0;
/*#if(modules.router){#*/
if (DEBUG) {
    var State_DataWhereSet = {};
}
/*#}#*/
var State_IsObserveChanged = function (view, keys, r) {
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
var SetupKeysRef = function (keys) {
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
var TeardownKeysRef = function (keys) {
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
    setTimeout(function () {
        Router.on('changed', function () {
            setTimeout(function () {
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
var State = G_Mix({
    get: function (key) {
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
            r = Safeguard(r, null, function (dataKey) {
                /*#if(modules.router){#*/
                var loc = Router.parse();
                if (G_Has(State_DataWhereSet, dataKey) && State_DataWhereSet[dataKey] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + dataKey + '" where it set by page:' + State_DataWhereSet[dataKey]);
                }
                /*#}#*/
            }, function (path, value) {
                var sub = key ? key : path;
                console.warn('beware! You direct set "{Magix.State}.' + sub + '" a new value  You should call Magix.State.set() and Magix.State.digest() to notify other views {Magix.State} changed');
                if (G_IsPrimitive(value) && !/\./.test(sub)) {
                    console.warn('beware! Never set a primitive value ' + JSON.stringify(value) + ' to "{Magix.State}.' + sub + '" This may will not trigger "changed" event');
                }
            });
        }
        return r;
    },
    set: function (data) {
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
    digest: function (data) {
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
    clean: function (keys) {
        if (DEBUG) {
            var called = false;
            setTimeout(function () {
                if (!called) {
                    throw new Error('Magix.State.clean only used in View.mixins like mixins:[Magix.State.clean("p1,p2,p3")]');
                }
            }, 1000);
        }
        if (DEBUG) {
            return {
                '\x1e': keys,
                ctor: function () {
                    var me = this;
                    called = true;
                    keys = SetupKeysRef(keys);
                    me.on('destroy', function () {
                        TeardownKeysRef(keys);
                    });
                }
            };
        }
        return {
            ctor: function () {
                var me = this;
                keys = SetupKeysRef(keys);
                me.on('destroy', function () {
                    TeardownKeysRef(keys);
                });
            }
        };
    }
}, Event);
Magix.State = State;