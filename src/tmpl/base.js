/*#if(modules.base){#*/
/*#if(!modules.mini){#*/
G_Assign(G_NOOP[G_PROTOTYPE], MEvent);
/*#}#*/
G_NOOP.extend = function extend(props, statics) {
    let me = this;
    let ctor = props && props.ctor;
    function X(...a) {
        let t = this;
        me.apply(t, a);
        if (ctor) ctor.apply(t, a);
    }
    X.extend = extend;
    return G_Extend(X, me, props, statics);
};
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
 * let T = Magix.Base.extend({
 *     hi:function(){
 *         this.fire('hi');
 *     }
 * });
 * let t = new T();
 * t.onhi=function(e){
 *     console.log(e);
 * };
 * t.hi();
 */
Magix.Base = G_NOOP;
/*#}#*/