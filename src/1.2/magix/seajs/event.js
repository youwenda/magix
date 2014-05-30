/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
define("magix/event", function(require) {
    var Magix = require("./magix");
    eval(Magix.include('../tmpl/event'));
    return Event;
});