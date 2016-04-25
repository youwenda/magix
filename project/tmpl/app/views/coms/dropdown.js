/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('@dropdown.css');
module.exports = Magix.View.extend({
    tmpl: '@dropdown.html',
    ctor: function() {
        var me = this;
        var big = [];
        for (var i = 0; i < 200000; i++) {
            big.push({
                id: i,
                text: i + ':' + Math.random()
            });
        }
        me.$big = big;
        me.data.set({
            viewId: me.id
        });
        me.observe('d2Id', null);

        //me.render();
    },
    render: function(name) {
        var me = this;
        var loc = Magix.Router.parse();
        me.request('render').all(name || 'list', function(err, bag) {
            me.data.set({
                list: bag.get('data', []),
                d2Id: loc.params.d2Id || 21,
                citySelected: '',
                cities: [{
                    text: '请选择城市',
                    id: ''
                }]
            }).digest();
            me.dropdown('d1_' + me.id, {
                list: bag.get('data', []),
                width: name ? 200 : 100,
            });
            me.dropdown('d2_' + me.id, {
                list: bag.get('data', []),
                selected: loc.params.d2Id || 21,
                height: 100,
                width: name ? 200 : 300,
                search: true,
                picked: function(e) {
                    console.log(e);
                    Magix.Router.to({
                        d2Id: e.id
                    });
                }
            });
            me.dropdown('d3_' + me.id, {
                list: bag.get('data', [])
            });
            me.dropdown('d4_' + me.id, {

                search: true,
                list: me.$big
            });
            me.dropdown('p_' + me.id, {
                list: [{
                    "id": "",
                    "text": "请选择省份"
                }, {
                    "id": "zj",
                    "text": "浙江"
                }, {
                    "id": "hn",
                    "text": "河南"
                }],
                selected: '',
                picked: function(e) {
                    if (e.id == 'hn') {
                        me.data.set({
                            citySelected: 'zz',
                            cities: [{
                                "id": "zz",
                                "text": "郑州"
                            }]
                        })
                    } else if (e.id == 'zj') {
                        me.data.set({
                            citySelected: 'hz',
                            cities: [{
                                "id": "hz",
                                "text": "杭州"
                            }]
                        })
                    } else {
                        me.data.set({
                            citySelected: '',
                            cities: [{
                                text: '请选择城市',
                                id: ''
                            }]
                        });
                    }
                    me.data.digest();
                }
            });
        });
    },
    'changeService<click>': function() {
        this.render('list1');
    }
});