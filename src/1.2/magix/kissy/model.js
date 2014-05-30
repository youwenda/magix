/**
 * @fileOverview Model
 * @version 1.1
 * @author 行列
 */
KISSY.add('magix/model', function(S, Magix) {
    eval(Magix.include('../tmpl/model', 1));
    Model.extend = function(props, statics, ctor) {
        var me = this;
        var BaseModel = function() {
            me.call(this);
            if (ctor) {
                ctor.call(this);
            }
        };
        return S.extend(BaseModel, me, props, statics);
    };
    return Model;
}, {
    requires: ['magix/magix']
});