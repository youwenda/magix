if (DEBUG) {
    var Safeguard;
    if (window.Proxy) {
        Safeguard = (data, getter, setter) => {
            let build = (prefix, o) => {
                if (o['\x1e_sf_\x1e']) {
                    return o;
                }
                return new Proxy(o, {
                    set(target, property, value) {
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
            if (G_IsPrimitive(data)) {
                return data;
            }
            return build('', data);
        };
    } else {
        Safeguard = data => data;
    }
}