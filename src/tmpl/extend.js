var T = function() {};
var G_Extend = function(ctor, base, props, statics, cProto) {
    //bProto.constructor = base;
    T[G_PROTOTYPE] = base[G_PROTOTYPE];
    cProto = new T();
    G_Mix(cProto, props);
    G_Mix(ctor, statics);
    cProto.constructor = ctor;
    ctor[G_PROTOTYPE] = cProto;
    return ctor;
};