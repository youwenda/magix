define("app/views/coms/dropdown",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
Magix.applyStyle('mp-5bd',".mp-5bd-dropdown{height:36px;float:left;margin:0 8px}.mp-5bd-bottom{position:absolute;bottom:0;left:400px}.mp-5bd-wrapper{margin:50px}");
return Magix.View.extend({
    tmpl: "<div class=\"mp-5bd-wrapper\"><div id=\"d1_<%=viewId%>\" class=\"mp-5bd-dropdown\"></div><div id=\"d2_<%=viewId%>\" class=\"mp-5bd-dropdown\"></div><button mx-click=\"changeService()\" class=\"btn btn-size25\">切换数据源</button><div id=\"d3_<%=viewId%>\" class=\"mp-5bd-dropdown mp-5bd-bottom\"></div><div class=\"mp-5bd-dropdown\" mx-view=\"coms/dropdown/index?source=script&selected=<%=d2Id%>\" mx-guid=\"xb411-\u001f\">@1-\u001f</div><br /><div class=\"mp-5bd-dropdown\" id=\"p_<%=viewId%>\"></div><div class=\"mp-5bd-dropdown\" mx-view=\"coms/dropdown/index?source=script&selected=<%=citySelected%>\" mx-guid=\"xb412-\u001f\">@2-\u001f</div></div>",
tmplData:[{"guid":1,"keys":["d2Id"],"tmpl":"<script type=\"text/magix\">\n            <%=JSON.stringify(list)%>\n        </script>","selector":"div[mx-guid=\"xb411-\u001f\"]","attrs":[{"n":"mx-view","v":"coms/dropdown/index?source=script&selected=<%=d2Id%>"}],"vf":true},{"guid":2,"keys":["cities","citySelected"],"tmpl":"<script type=\"text/magix\">\n            <%=JSON.stringify(cities)%>\n        </script>","selector":"div[mx-guid=\"xb412-\u001f\"]","attrs":[{"n":"mx-view","v":"coms/dropdown/index?source=script&selected=<%=citySelected%>"}],"vf":true}],
    ctor: function() {
        var me = this;
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
                width:name?200:100,
            });
            me.dropdown('d2_' + me.id, {
                list: bag.get('data', []),
                selected: loc.params.d2Id || 21,
                height: 100,
                width: name?200:300,
                search:true,
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
});