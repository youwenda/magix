/**
 * @fileOverview Model
 * @version 1.1
 * @author 行列
 */
define('magix/model', ['magix/magix'], function(require) {
    var Magix = require('magix/magix');
    var Extend = function(props, statics, ctor) {
        var me = this;
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                ctor.apply(this, arguments);
            }
        };
        return Magix.extend(BaseModel, me, props, statics);

    };
    eval(Magix.include('../tmpl/model', 1));
    return Model;
});