/**
 * 使用mx-keys进行局部刷新的类
 * @constructor
 * @name Updater
 * @class
 * @beta
 * @module updater
 * @param {String} viewId Magix.View对象Id
 * @property {Object} $data 存放数据的对象
 */
var Updater = function(viewId) {
    var me = this;
    me.$i = viewId;
    me.$t = viewId;
    me.$data = {};
    /*#if(modules.updaterSetState){#*/
    me.$keys = {};
    /*#}else{#*/
    me.$json = {};
    /*#}#*/
};
var UP = Updater.prototype;
G_Mix(UP, {
    /**
     * @lends Updater#
     */
    to: function(id, me) {
        me = this;
        me.$t = id;
        return me;
    },
    /**
     * 获取放入的数据
     * @param  {String} [key] key
     * @return {Object} 返回对应的数据，当key未传递时，返回整个数据对象
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    get: function(key) {
        var result = this.$data;
        if (key) {
            result = result[key];
        }
        return result;
    },
    /**
     * 通过path获取值
     * @param  {String} path 点分割的路径
     * @return {Object}
     */
    gain: function(path) {
        var result = this.$data;
        var ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },
    /**
     * 获取放入的数据
     * @param  {Object} obj 待放入的数据
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    set: function(obj) {
        var me = this,
            data = me.$data,
            keys = me.$keys;
        /*#if(modules.updaterSetState){#*/
        G_Set(obj, data, keys);
        /*#}else{#*/
        G_Mix(data, obj);
        /*#}#*/
        return me;
    },
    /**
     * 检测数据变化，更新界面，放入数据后需要显式调用该方法才可以把数据更新到界面
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     }).digest();
     * }
     */
    digest: function(data) {
        var me = this;
        if (data) {
            me.set(data);
        }
        data = me.$data;
        /*#if(modules.updaterSetState){#*/
        var keys = me.$keys;
        /*#}else{#*/
        var keys = {};
        var json = me.$json;
        var val, key, valJSON, lchange;
        for (key in data) {
            val = data[key];
            lchange = 0;
            valJSON = JSONStringify(val);
            if (!G_Has(json, key)) {
                json[key] = valJSON;
                lchange = 1;
            } else {
                lchange = valJSON != json[key];
                json[key] = valJSON;
            }
            if (lchange) {
                keys[key] = 1;
            }
        }
        /*#}#*/
        /*#if(modules.updaterSetState){#*/
        me.$keys = {};
        /*#}#*/
        Partial_UpdateDOM(me, keys, data); //render
        return me;
    },
    /**
     * 获取当前数据状态的快照，配合altered方法可获得数据是否有变化
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    snapshot: function() {
        var me = this;
        me.$ss = JSONStringify(me.$data);
        return me;
    },
    /**
     * 检测数据是否有变动
     * @return {Boolean} 是否变动
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    altered: function() {
        var me = this;
        if (me.$ss) {
            return me.$ss != JSONStringify(me.$data);
        }
    }
});