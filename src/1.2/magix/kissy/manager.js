/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.1
 **/
KISSY.add("magix/manager", function(S, Magix, Event) {
    /*
        #begin mm_fetchall_1#
        KISSY.add('testMM',function(S,MM,Model){
        #end#

        #begin mm_fetchall_2#
        },{
            requires:["magix/manager","magix/model"]
        });
        #end#

        #begin mm_fetchall_3#
        KISSY.use('testMM',function(S,TM){
        #end#
     */
    eval(Magix.include('../tmpl/manager', 1));
    return Manager;
}, {
    requires: ["magix/magix", "magix/event"]
});