/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vinvoke', function(S, View, Magix) {
    var Base = View.prototype;
    var SafeExec = Magix.safeExec;

    var ViewInited = function() {
        console.log(this.id, this.owner.viewPrimed);
        Base.fire.call(ViewInited, this.id, 0, 1);
    };

    var SyncInvoke = function(vf, method, args) {
        var result;
        if (vf.viewPrimed) {
            var view = vf.view;
            var fn = view[method];
            if (fn) {
                result = SafeExec(fn, args, view);
            }
        }
        return result;
    };

    var InvokeVframeView = function(view, id, wait, method, args, callback) {
        var result;
        var vom = view.vom;
        var vf = vom.get(id);
        if (wait) {
            var fn = function(e) {
                vf = vom.get(id);
                if (vf && vf.viewPrimed) {
                    result = SyncInvoke(vf, method, args);
                    if (callback) {
                        SafeExec(callback, result);
                    }
                } else if (!e) {
                    console.log('wait for invoke', id);
                    Base.on.call(ViewInited, id, fn);
                }
            };
            result = view.manage({
                destroy: function() {
                    console.log('destroy invoke vframe view');
                    Base.off.call(ViewInited, id, fn);
                }
            });
            fn();
        } else if (vf) {
            result = SyncInvoke(vf, method, args);
        }
        return result;
    };
    View.mixin({
        /**
         * 调用其它view的方法
         * @param  {String} vfId vframe的id
         * @param  {String} methodName view的方法名
         * @param {Array} args 参数
         * @return {Object}
         */
        invokeView: function(vfId, methodName, args) {
            return InvokeVframeView(this, vfId, 0, methodName, args);
        },
        /**
         * 以异步的方式调用其它view的方法，该方法会等待其它view的加载完成
         * @param  {String} vfId vframe的id
         * @param  {String} methodName view的方法名
         * @param  {Array} args 参数
         * @param  {Function} callback 用于接收调用完成后的返回值
         */
        invokeViewAsync: function(vfId, methodName, args, callback) {
            InvokeVframeView(this, vfId, 1, methodName, args, callback);
        }
    }, function() {
        var me = this;
        me.on('interact', function() {
            me.on('primed', ViewInited);
        });
    });
}, {
    requires: ['mxext/view', 'magix/magix']
});