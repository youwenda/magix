/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.2
 **/
define("magix/manager", function(require) {
    /*
        #begin mm_fetchall_1#
        define('testMM',["magix/manager","magix/model"],function(require){
            var MM=require("magix/manager");
            var Model=require("magix/model");
        #end#

        #begin mm_fetchall_2#
        });
        #end#

        #begin mm_fetchall_3#
        seajs.use('testMM',function(TM){
        #end#
     */
    var Magix = require("./magix");
    var Event = require("./event");
    eval(Magix.include('../tmpl/manager', 1));
    return Manager;
});