/*#if(modules.base){#*/
var T_Extend = function (props, statics) {
    var me = this;
    var ctor = props && props.ctor;
    var X = function () {
        var t = this,
            a = arguments;
        me.apply(t, a);
        if (ctor) ctor.apply(t, a);
    };
    X.extend = T_Extend;
    return G_Extend(X, me, props, statics);
};
G_Mix(G_NOOP[G_PROTOTYPE], Event);
G_NOOP.extend = T_Extend;
/**
 * 组件基类
 * @name Base
 * @constructor
 * @borrows Event.fire as #fire
 * @borrows Event.on as #on
 * @borrows Event.off as #off
 * @beta
 * @module base
 * @example
 * var T = Magix.Base.extend({
 *     hi:function(){
 *         this.fire('hi');
 *     }
 * });
 * var t = new T();
 * t.onhi=function(e){
 *     console.log(e);
 * };
 * t.hi();
 */
Magix.Base = G_NOOP;
/*#}#*/