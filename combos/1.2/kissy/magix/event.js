/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add("magix/event", function(S, Magix) {
    /**
 * 根据名称生成事件数组的key
 * @param {Strig} name 事件名称
 * @return {String} 包装后的key
 */
var GenKey = function(name) {
    return '~' + name;
};

var SafeExec = Magix.safeExec;
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event = {
    /**
     * @lends Event
     */
    /**
     * 触发事件
     * @param {String} name 事件名称
     * @param {Object} data 事件对象
     * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
     * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
     */
    fire: function(name, data, remove, lastToFirst) {
        var key = GenKey(name),
            me = this,
            list = me[key];
        if (list) {
            if (!data) data = {};
            if (!data.type) data.type = name;
            var end = list.length,
                len = end - 1,
                idx, t;
            while (end--) {
                idx = lastToFirst ? end : len - end;
                t = list[idx];
                if (t.d || t.r) {
                    list.splice(idx, 1);
                    len--;
                }
                if (!t.d) SafeExec(t.f, data, me);
            }
            //
            remove = remove || len < 0; //如果list中没有回调函数，则删除
        }
        if (remove) {
            delete me[key];
        }
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     * @param {Interger} insert 事件监听插入的位置
     * @example
     * var T=Magix.mix({},Event);
        T.on('done',function(e){
            alert(1);
        });
        T.on('done',function(e){
            alert(2);
            T.off('done',arguments.callee);
        });
        T.on('done',function(e){
            alert(3);
        },0);//监听插入到开始位置

        T.once('done',function(e){
            alert('once');
        });

        T.fire('done',{data:'test'});
        T.fire('done',{data:'test2'});
     */
    on: function(name, fn, insert) {
        var key = GenKey(name);
        var list = this[key] || (this[key] = []);
        var wrap = {
            f: fn
        };
        if (isNaN(insert)) {
            wrap.r = insert;
            list.push(wrap);
        } else {
            list.splice(insert | 0, 0, wrap);
        }
    },
    /**
     * 依托另外一个对象的事件自动解绑
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     * @param {Object} relyObj 依托的对象
     * @param {String} relyName 依托的名称
     * @param {Interger} insert 事件监听插入的位置
     * @example
     * var a=Magix.mix({},Event);
     * var b=Magix.mix({},Event);
     * a.rely('test',function(e){
     *
     * },b,'destroy');
     *
     * a.fire('test');//正常
     * b.fire('destroy');
     * a.fire('test');//不再打印console.log
     */
    rely: function(name, fn, relyObj, relyName, insert) {
        var me = this;
        me.on(name, fn, insert);
        relyObj.on(relyName, function() {
            me.off(name, fn);
        }, GenKey);
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     */
    off: function(name, fn) {
        var key = GenKey(name),
            list = this[key];
        if (list) {
            if (fn) {
                for (var i = list.length - 1, t; i >= 0; i--) {
                    t = list[i];
                    if (t.f == fn && !t.d) {
                        t.d = 1;
                        break;
                    }
                }
            } else {
                delete this[key];
            }
        }
    },
    /**
     * 绑定事件，触发一次后即解绑
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     */
    once: function(name, fn) {
        this.on(name, fn, GenKey);
    }
};
Magix.mix(Magix.local, Event);
    return Event;
}, {
    requires: ["magix/magix"]
});