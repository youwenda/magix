var Magix_CacheSort = function (a, b) {
    return /*#if(modules.cnum){#*/ b.n - a.n || /*#}#*/ b.f - a.f || b.t - a.t;
};
/**
 * Magix.Cache 类
 * @name Cache
 * @constructor
 * @param {Integer} [max] 缓存最大值，默认20
 * @param {Integer} [buffer] 缓冲区大小，默认5
 * @param {Function} [remove] 当缓存的元素被删除时调用
 * @example
 * var c = new Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
 * c.set('key1',{});//缓存
 * c.get('key1');//获取
 * c.del('key1');//删除
 * c.has('key1');//判断
 * //注意：缓存通常配合其它方法使用，在Magix中，对路径的解析等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
 */
var G_Cache = function (max, buffer, remove, me) {
    me = this;
    me.c = [];
    me.b = buffer | 0 || 5; //buffer先取整，如果为0则再默认5
    me.x = me.b + (max || 20);
    me.r = remove;
};

G_Mix(G_Cache[G_PROTOTYPE], {
    /**
     * @lends Cache#
     */
    /**
     * 获取缓存的值
     * @param  {String} key
     * @return {Object} 初始设置的缓存对象
     */
    get: function (key) {
        var me = this;
        var c = me.c;
        var r = c[G_SPLITER + key];
        if (r) {
            r.f++;
            r.t = G_COUNTER++;
            //console.log(r.f);
            r = r.v;
            //console.log('hit cache:'+key);
        }
        return r;
    },
    /*#if(modules.cnum){#*/
    /**
     * 获取引用值，仅启动cnum模块时该方法才存在
     * @param  {String} key 缓存key
     * @param  {Boolean} increase 是否是增长
     * @beta
     * @module cnum
     */
    num: function (key, increase) {
        var me = this,
            c = me.c,
            k = G_SPLITER + key;
        if (increase && !c[k]) {
            me.set(key, G_NULL);
        }
        var o = c[k];
        if (o) {
            if (increase) {
                o.n++;
            } else if (o.n > 0) {
                o.n--;
            }
            o.f++;
        }
    },
    /*#}#*/
    /*#if(modules.ceach||modules.service){#*/
    /**
     * 循环缓存
     * @param  {Function} cb 回调
     * @param  {Object} [ops] 回调时传递的额外参数
     * @beta
     * @module ceach|service
     */
    each: function (cb, ops, me, c, i) {
        me = this;
        c = me.c;
        for (i = c.length; i--;) {
            cb(c[i].v, ops, me);
        }
    },
    /*#}#*/
    /**
     * 设置缓存
     * @param {String} key 缓存的key
     * @param {Object} value 缓存的对象
     */
    set: function (okey, value) {
        var me = this;
        var c = me.c;

        var key = G_SPLITER + okey;
        var r = c[key];
        var t = me.b,
            f;
        if (!r) {
            if (c.length >= me.x) {
                c.sort(Magix_CacheSort);
                while (t--) {
                    /*#if(modules.cnum){#*/
                    r = c[c.length - 1]; //弹出最后一个
                    if (r.n) { //如果有引用
                        break; //直接跳出循环
                    }
                    c.pop();
                    /*#}else{#*/
                    r = c.pop();
                    /*#}#*/
                    //为什么要判断r.f>0,考虑这样的情况：用户设置a,b，主动删除了a,重新设置a,数组中的a原来指向的对象残留在列表里，当排序删除时，如果不判断则会把新设置的删除，因为key都是a
                    //
                    if (r.f > 0) me.del(r.o); //如果没有引用，则删除
                    /*#if(modules.cnum){#*/
                    f = 1; //标记无引用
                    /*#}#*/
                }
                /*#if(modules.cnum){#*/
                if (!f) { //auto increase
                    me.x += me.b;
                }
                /*#}#*/
            }
            r = {
                /*#if(modules.cnum){#*/
                n: 0,
                /*#}#*/
                o: okey
            };
            c.push(r);
            c[key] = r;
        }
        r.v = value;
        r.f = 1;
        r.t = G_COUNTER++;
    },
    /**
     * 删除缓存
     * @param  {String} key 缓存key
     */
    del: function (k) {
        k = G_SPLITER + k;
        var c = this.c;
        var r = c[k],
            m = this.r;
        if (r) {
            r.f = -1;
            r.v = G_EMPTY;
            delete c[k];
            if (m) {
                G_ToTry(m, r.o);
            }
        }
    },
    /**
     * 检测缓存中是否有给定的key
     * @param  {String} key 缓存key
     * @return {Boolean}
     */
    has: function (k) {
        return G_Has(this.c, G_SPLITER + k);
    }
});