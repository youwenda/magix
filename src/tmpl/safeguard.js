if (DEBUG) {
    var Safeguard;
    if (window.Proxy) {
        let ProxiesPool = new Map();
        Safeguard = (data, getter, setter) => {
            if (G_IsPrimitive(data)) {
                return data;
            }
            let key = getter + '\x01' + setter;
            let cached = ProxiesPool.get(data);
            if (cached && cached.key == key) {
                return cached.entity;
            }
            let build = (prefix, o) => {
                if (o['\x1e_sf_\x1e']) {
                    return o;
                }
                return new Proxy(o, {
                    set(target, property, value) {
                        if (!setter && !prefix) {
                            throw new Error('avoid writeback,key: ' + prefix + property + ' value:' + value + ' more info: https://github.com/thx/magix/issues/38');
                        }
                        target[property] = value;
                        if (setter) {
                            setter(prefix + property, value);
                        }
                        return true;
                    },
                    get(target, property) {
                        if (property == '\x1e_sf_\x1e') {
                            return true;
                        }
                        let out = target[property];
                        if (!prefix && getter) {
                            getter(property);
                        }
                        if (G_Has(target, property) && (G_IsArray(out) || G_IsObject(out))) {
                            return build(prefix + property + '.', out);
                        }
                        return out;
                    }
                });
            };
            let entity = build('', data);
            ProxiesPool.set(data, {
                key,
                entity
            });
            return entity;
        };
    } else {
        Safeguard = data => data;
    }
}