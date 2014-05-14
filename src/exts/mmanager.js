/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/mmanager', function(S, MM, Magix) {
    var JoinedCache = Magix.cache();
    var MConvert = function(obj, prefix, toObject) {
        var a = toObject ? {} : [];
        prefix = prefix || '';
        var one;
        var mix = Magix.mix;
        for (var p in obj) {
            one = obj[p];
            if (toObject) {
                if (prefix) {
                    p = prefix + p;
                }
                a[p] = one;
            } else {
                if (prefix) {
                    one = mix({}, one);
                    one.name = prefix + one.name;
                }
                a.push(one);
            }
        }
        return a;
    };
    return MM.mixin({
        /**
         * 注册常用方法，或以把经常几个同时请求的model封装成一个方法以便快捷调用
         * @param {Object} methods 方法对象
         */
        registerMethods: function(methods) {
            var me = this;
            var cMethods = me.$mMetods;
            var one;
            for (var p in methods) {
                one = methods[p];
                me[p] = one;
                cMethods[p] = one;
            }
        },
        /**
         * 联合其它MManager查询
         * @param {MManager} manager 要联合的Manager
         * @param {String} [prefix] 为联合的Manager中的元信息名称加的前缀，当2个Manager内部有同名的元信息时的解决方案
         * @return {MManager}
         * @example
         * //假设我们有2个Manager
         * var ReportManager=MM.create(AppModel);
         * ReportManager.registerModels([{
         *     name:'News_List'
         *     url:'report/news/list.json'
         * }]);
         *
         * var VideoManager=MM.create(AppModel);
         * VideoManager.registerModels([{
         *     name:'News_List',
         *     url:'video/news/list.json'
         * }]);
         *
         * //考虑以上2个manager同时使用的情况：我们需要体育新闻和视频新闻，我们可能会这样写：
         *  render:function(){
         *      var me=this;
         *      var r1=ReportManager.fetchAll({
         *          name:'News_List'
         *      },function(e,m){
         *          if(!e){
         *              var r2=VideoManager.fetchAll({
         *                  name:'News_List'
         *              },function(e,m){
         *
         *              });
         *              me.manage(r2);
         *          }
         *      });
         *      me.manage(r1);
         *  }
         *
         * //如上需要嵌套，而且不能同时发起请求。通过join后我们可以把2个manager合并成一个来请求：
         *
         * var TempManager=ReportManager.join(VideoManager,'Video_');//因为ReportManger与VideoManager有相同的News_List,因此我们给Video的加上一个前缀Video_以示区分
         * var r=TempManager.fetchAll([{
         *     name:'News_List'
         * },{
         *     name:'Video_News_List'
         * }],function(e,reportNews,videoNews){
         *
         * });
         * me.manage(r);
         */
        join: function(manager, prefix) {
            var me = this;
            var mclass = me.$mClass;
            if (mclass != manager.$mClass) {
                throw new Error('modelClass diff!');
            }
            var key = prefix + '$' + me.id + '$' + manager.id;
            var m = JoinedCache.get(key);
            var keys = me.$sKeys;
            if (!m) {
                m = MM.create(mclass, keys.concat(manager.$sKeys));
                m.registerModels(MConvert(me.$mMetas));
                m.registerMethods(me.$mMetods);

                m.registerModels(MConvert(manager.$mMetas, prefix));
                m.registerMethods(MConvert(manager.$mMetods, prefix, 1));
                //inited done fail 事件处理...
                JoinedCache.set(key, m);
            }
            return m;
        }
    }, function() {
        var me = this;
        me.$mMetods = {};
    });
}, {
    requires: ['mxext/mmanager', 'magix/magix']
});