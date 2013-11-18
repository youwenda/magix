/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/model', function(S, Model, IO, Magix) {
    return Model.extend({
        sync: function(callback) {
            var pathInfos = Magix.local('APIPathInfo');
            var url = this.get('url');
            var path = pathInfos.loader + '/' + pathInfos.ver + '/';
            if (url) {
                path += url;
            } else {
                var cName = this.get('cName') || pathInfos.action;
                path += 'symbols/' + cName + '.json';
            }
            IO({
                url: path,
                dataType: 'json',
                success: function(data) {
                    if (S.isArray(data)) {
                        data = {
                            list: data
                        };
                    }
                    callback(null, data);
                },
                error: function(xhr, msg) {
                    callback(msg);
                }
            });
        }
    });
}, {
    requires: ['mxext/model', 'ajax', 'magix/magix']
});