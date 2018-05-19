function T() { }
let G_Extend = (ctor, base, props, statics, cProto) => {
    //bProto.constructor = base;
    T[G_PROTOTYPE] = base[G_PROTOTYPE];
    cProto = new T();
    G_Assign(cProto, props);
    G_Assign(ctor, statics);
    cProto.constructor = ctor;
    ctor[G_PROTOTYPE] = cProto;
    return ctor;
};