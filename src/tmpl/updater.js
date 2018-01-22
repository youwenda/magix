/**
 * 使用mx-keys进行局部刷新的类
 * @constructor
 * @name Updater
 * @class
 * @beta
 * @module updater
 * @param {String} viewId Magix.View对象Id
 */
let Updater = function (viewId) {
    let me = this;
    me['@{updater#view.id}'] = viewId;
    /*#if(!modules.updaterIncrement){#*/
    me['@{updater#render.id}'] = viewId;
    /*#}#*/
    /*#if(modules.updaterIncrement){#*/
    me['@{updater#data.changed}'] = 1;
    /*#}#*/
    me['@{updater#data}'] = {
        vId: viewId,
        [G_SPLITER]: 1
    };
    me['@{updater#keys}'] = {};
};
G_Assign(Updater[G_PROTOTYPE], {
    /**
     * @lends Updater#
     */
    /*#if(!modules.updaterIncrement){#*/
    to(id, me) {
        me = this;
        me['@{updater#render.id}'] = id;
        return me;
    },
    /*#}#*/
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
    get(key, result) {
        result = this['@{updater#data}'];
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
    /*gain: function (path) {
        let result = this.$d;
        let ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },*/
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
    set(obj) {
        let me = this, { '@{upater#data}': data, '@{updater#keys}': keys } = me;
        if (obj) {
            /*#if(modules.updaterIncrement){#*/
            me['@{updater#data.changed}'] = G_Set(obj, data, keys) || me['@{updater#data.changed}'];
            /*#}else{#*/
            G_Set(obj, data, keys);
            /*#}#*/
        }
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
    digest(data, keys/*#if(modules.updaterIncrement){#*/, changed/*#}#*/) {
        let me = this;
        me.set(data);
        data = me['@{updater#data}'];
        keys = me['@{updater#keys}'];
        /*#if(modules.updaterIncrement){#*/
        changed = me['@{updater#data.changed}'];
        me['@{updater#data.changed}'] = 0;
        /*#}#*/
        me['@{updater#keys}'] = {};
        /*#if(modules.updaterIncrement){#*/
        I_UpdateDOM(me, data, changed, keys);
        /*#}else{#*/
        Partial_UpdateDOM(me, keys, data); //render
        /*#}#*/
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
    snapshot() {
        let me = this;
        me['@{updater#data.string}'] = JSONStringify(me['@{updater#data}']);
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
    altered() {
        let me = this;
        if (me['@{updater#data.string}']) {
            return me['@{updater#data.string}'] != JSONStringify(me['@{updater#data}']);
        }
    }
});