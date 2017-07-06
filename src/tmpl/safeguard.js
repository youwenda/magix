if (DEBUG) {
    if (window.Proxy) {
        var Safeguard = function(data, allows, getter, setter) {
            var build = function(prefix, o) {
                if (o['\x1e_sf_\x1e']) {
                    return o;
                }
                return new Proxy(o, {
                    set: function(target, property, value) {
                        if (!setter && (prefix || !G_Has(allows, property))) {
                            throw new Error('avoid writeback for:' + prefix + property + ' value:' + value + ' more info: https://github.com/thx/magix/issues/38');
                        }
                        target[property] = value;
                        if (setter) {
                            setter(prefix + property, value);
                        }
                        return true;
                    },
                    get: function(target, property) {
                        if (property == '\x1e_sf_\x1e') {
                            return true;
                        }
                        var out = target[property];
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
            if (G_IsPrimitive(data)) {
                return data;
            }
            return build('', data);
        };
    } else {
        var Safeguard = function(data) {
            return data;
        };
    }
}