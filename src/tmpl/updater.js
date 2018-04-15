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
    me['@{updater#data.changed}'] = 1;
    /*#if(!modules.updaterDOM&&!modules.updaterVDOM){#*/
    me['@{updater#render.id}'] = viewId;
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
    /*#if(!modules.updaterDOM&&!modules.updaterVDOM){#*/
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
        me['@{updater#data.changed}'] = G_Set(obj, me['@{upater#data}'], me['@{updater#keys}']) || me['@{updater#data.changed}'];
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
        let me = this.set(data),
            keys = me['@{updater#keys}'],
            changed = me['@{updater#data.changed}'];
        me['@{updater#data.changed}'] = 0;
        me['@{updater#keys}'] = {};
        data = me['@{updater#data}'];
        /*#if(modules.updaterVDOM||modules.updaterDOM){#*/
        /*#if(modules.updaterAsync){#*/
        return new Promise(resolve => {
            /*#}#*/
            let selfId = me['@{updater#view.id}'],
                vf = Vframe_Vframes[selfId],
                view = vf && vf['@{vframe#view.entity}'],
                ref = { d: [], v: [] },
                node = G_GetById(selfId),
                tmpl, vdom;
            if (changed && view && view['@{view#sign}'] > 0 &&
                (tmpl = view['@{view#template.object}'])) {
                delete Body_RangeEvents[selfId];
                delete Body_RangeVframes[selfId];
                /*#if(!modules.updaterAsync){#*/
                console.time('[updater time:' + selfId + ']');
                console.time('[html to dom:' + selfId + ']');
                /*#if(modules.updaterVDOM){#*/
                vdom = TO_VDOM(tmpl(data, selfId));
                /*#}else{#*/
                vdom = I_GetNode(tmpl(data, selfId), node);
                /*#}#*/
                console.timeEnd('[html to dom:' + selfId + ']');
                /*#}#*/
                /*#if(modules.updaterAsync){#*/
                Async_SetNewTask(vf, () => {
                    console.log('ui ready', selfId);
                    /*#}else{#*/
                    /*#if(modules.updaterVDOM){#*/
                    V_SetChildNodes(node, me['@{updater#vdom}'], vdom, ref, vf, data, keys);
                    me['@{updater#vdom}'] = vdom;
                    /*#}else{#*/
                    I_SetChildNodes(node, vdom, ref, vf, data, keys);
                    /*#}#*/
                    /*#}#*/
                    for (vdom of ref.d) {
                        vdom[0].id = vdom[1];
                    }

                    for (vdom of ref.v) {
                        vdom['@{view#render.short}']();
                    }
                    if (ref.c || !view['@{view#rendered}']) {
                        view.endUpdate(selfId);
                    }
                    if (ref.c) {
                        /*#if(modules.naked){#*/
                        G_Trigger(G_DOCUMENT, 'htmlchanged', {
                            vId: selfId
                        });
                        /*#}else if(modules.kissy){#*/
                        G_DOC.fire('htmlchanged', {
                            vId: selfId
                        });
                        /*#}else{#*/
                        G_DOC.trigger({
                            type: 'htmlchanged',
                            vId: selfId
                        });
                        /*#}#*/
                    }
                    view.fire('domready');
                    /*#if(modules.updaterAsync){#*/
                    resolve();
                });
                Async_AddTask(vf, () => {
                    console.time('[updater time:' + selfId + ']');
                    console.time('[html to dom:' + selfId + ']');
                    /*#if(modules.updaterVDOM){#*/
                    vdom = TO_VDOM(tmpl(data, selfId));
                    /*#}else{#*/
                    vdom = I_GetNode(tmpl(data, selfId), node);
                    /*#}#*/
                    console.timeEnd('[html to dom:' + selfId + ']');
                    /*#if(modules.updaterVDOM){#*/
                    V_SetChildNodes(node, me['@{updater#vdom}'], vdom, ref, vf, data, keys);
                    if (!me['@{updater#vdom}']) me['@{updater#vdom}'] = vdom;
                    /*#}else{#*/
                    I_SetChildNodes(node, vdom, ref, vf, data, keys);
                    /*#}#*/
                    console.timeEnd('[updater time:' + selfId + ']');
                    Async_CheckStatus(selfId);
                });
                /*#}else{#*/
                console.timeEnd('[updater time:' + selfId + ']');
                /*#}#*/
            }
            /*#if(modules.updaterAsync){#*/
            else {
                resolve();
            }
        });
        /*#}#*/
        /*#}else{#*/
        changed && Partial_UpdateDOM(me, keys); //render
        /*#}#*/
        /*#if(!modules.updaterAsync){#*/
        return Promise.resolve();
        /*#}#*/
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
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} origin 源字符串
     */
    translate(data) {
        return G_TranslateData(this['@{updater#data}'], data, 1);
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} origin 源字符串
     */
    parse(origin) {
        return G_ParseExpr(origin, this['@{updater#data}']);
    }
});