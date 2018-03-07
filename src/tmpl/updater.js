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
    /*#if(!modules.updaterDOM&&!modules.updaterVDOM&&!modules.updaterVRDOM){#*/
    me['@{updater#render.id}'] = viewId;
    /*#}#*/
    me['@{updater#data}'] = {
        vId: viewId,
        [G_SPLITER]: 1
    };
    /*#if(!modules.updaterVDOM&&!modules.updaterVRDOM&&!modules.updaterDOM){#*/
    me['@{updater#keys}'] = {};
    /*#}#*/
};
G_Assign(Updater[G_PROTOTYPE], {
    /**
     * @lends Updater#
     */
    /*#if(!modules.updaterDOM&&!modules.updaterVDOM&&!modules.updaterVRDOM){#*/
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
        let me = this;
        /*#if(!modules.updaterVDOM&&!modules.updaterVRDOM&&!modules.updaterDOM){#*/
        G_Set(obj, me['@{upater#data}'], me['@{updater#keys}']);
        /*#}else{#*/
        G_Assign(me['@{updater#data}'], obj);
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
    digest(data) {
        let me = this;
        me.set(data);
        /*#if(!modules.updaterVDOM&&!modules.updaterVRDOM&&!modules.updaterDOM){#*/
        let keys = me['@{updater#keys}'];
        me['@{updater#keys}'] = {};
        /*#}#*/

        /*#if(modules.updaterVRDOM){#*/
        VR_UpdateDOM(me);
        /*#}else if(modules.updaterVDOM){#*/
        V_UpdateDOM(me);
        /*#}else if(modules.updaterDOM){#*/
        I_UpdateDOM(me);
        /*#}else{#*/
        Partial_UpdateDOM(me, keys); //render
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