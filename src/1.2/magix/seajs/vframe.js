/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.2
 */
define('magix/vframe', function(require) {
    var Magix = require("./magix");
    var Event = require("./event");
    var BaseView = require("./view");
    eval(Magix.include('../tmpl/vframe'));
    return Vframe;
});