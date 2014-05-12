/**
 * @fileOverview Model
 * @version 1.1
 * @author 行列
 */
KISSY.add('magix/model', function(S, Magix) {
    var Extend = function(props, statics, ctor) {
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                ctor.apply(this, arguments);
            }
        };
        return S.extend(BaseModel, this, props, statics);
    };
    eval(Magix.include('../tmpl/model', 1));
    return Model;
}, {
    requires: ['magix/magix']
});