/**
 * @fileOverview Model
 * @version 1.2
 * @author 行列
 */
define('magix/model', function(require) {
    var Magix = require('./magix');
    eval(Magix.include('../tmpl/model', 1));
    Model.extend = function(props, statics, ctor) {
        var me = this;
        var BaseModel = function() {
            me.call(this);
            if (ctor) {
                ctor.call(this);
            }
        };
        return Magix.extend(BaseModel, me, props, statics);

    };
    return Model;
});