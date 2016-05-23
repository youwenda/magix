define('app/views/coms/calendar',['magix','../../../coms/calendar/rangepicker'],function(require){
/*Magix ,Rangepicker */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Rangepicker = require('../../../coms/calendar/rangepicker');
return Magix.View.extend({
    tmpl: "<div id=\"cal_<%=id%>\"></div><input class=\"input\" style=\"margin:60px\" type=\"text\" mx-click=\"showCal();\" value=\"2016-04-08\"/> <input class=\"input\" style=\"margin:60px\" type=\"text\" mx-click=\"showCal();\" value=\"2016-04-08\"/> <input class=\"input\" style=\"margin:60px\" type=\"text\" mx-click=\"showCal();\" value=\"2016-04-08\"/> <input class=\"input\" style=\"margin:60px\" type=\"text\" mx-click=\"showCal({dock:'right'});\" value=\"2016-04-08\" x=\"2\"/> <input class=\"input\" style=\"margin:60px;width:160px;position: absolute;right:100px;top:100px\" type=\"text\" mx-click=\"showRangeCal({dock:'right'});\" value=\"2016-04-08~2016-04-12\"/><div href=\"#!/index\" mx-click=\"showCal1()\" style=\"float:left;margin:100px\">test anchor</div>",
    render: function() {
        var me = this;
        me.data.set({
            id: me.id
        }).digest();
        me.calendar('cal_' + me.id, {
            min: '2015-02-12',
            max: '2030-08-09',
            selected: '2016/7/21',
            picked: function(e) {
                console.log(e.date);
            }
        });
    },
    'showCal<click>': function(e) {
         //console.log(e);
        var ipt = e.current;
        this.datepicker({
            ownerNodeId: ipt.id || (ipt.id = Magix.guid('cal_')),
            dock: e.params.dock,
            selected: ipt.value,
            picked: function(e) {
                console.log(e);
                ipt.value = e.date;
            }
        });
    },
    'showCal1<click>': function(e) {
        e.preventDefault();
        var ipt = e.current;
        this.datepicker({
            ownerNodeId: ipt.id || (ipt.id = Magix.guid('cal_')),
            dock: e.params.dock,
            selected: ipt.innerHTML,
            picked: function(e) {
                ipt.innerHTML = e.date;
            }
        });
    },
    'showRangeCal<click>': function(e) {
        e.preventDefault();
        var ipt = e.current;
        var dates = ipt.value.split('~');
        var quickDateKeys = [
            'today',
            'yesterday',
            'lastestThisMonth',
            'lastest7',
            'lastest15',
            'lastest30',
            'preMonth',
            'passedThisMonth',
            'passed30'
        ];
        dates = Rangepicker.getRangeDescription(dates[0], dates[1], quickDateKeys);
        this.rangepicker({
            ownerNodeId: ipt.id || (ipt.id = Magix.guid('rng_')),
            dock: e.params.dock,
            dates: dates,
            quickDates: quickDateKeys,
            picked: function(e) {
                ipt.value = e.startStr + '~' + e.endStr;
            }
        });
    }
});
});