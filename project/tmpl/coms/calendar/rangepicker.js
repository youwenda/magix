/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var $ = require('$');
var Calendar = require('./index');
var Picker = require('../bases/picker');
var DateParse = Calendar.parse;
var DateFormat = Calendar.format;
Magix.applyStyle('@rangepicker.css');
var DayMillisecond = 86400000,
    GetOffsetDate = function(offset, date) {
        if (!date) {
            date = new Date();
        }
        var uom = new Date(date.getTime() + offset * DayMillisecond);
        uom = uom.getFullYear() + '/' + (uom.getMonth() + 1) + '/' + uom.getDate();
        return new Date(uom);
    },
    Today = GetOffsetDate(0),
    Yesterday = GetOffsetDate(-1),
    GetLastMonth = function() {
        var start = new Date(Today.getFullYear(), Today.getMonth() - 1, 1),
            startYear = start.getFullYear(),
            startMonth = start.getMonth(),
            lastDay = 32 - new Date(startYear, startMonth, 32).getDate();
        return {
            start: start,
            end: new Date(startYear, startMonth, lastDay)
        };
    },
    GetLastWeek = function(start) {
        var temp = GetOffsetDate(-7),
            offset = start - temp.getDay();
        return {
            start: GetOffsetDate(offset, temp),
            end: GetOffsetDate(offset + 6, temp)
        };
    },
    LastWeekSun = GetLastWeek(0),
    LastWeekMon = GetLastWeek(1),
    LastMonth = GetLastMonth();
LastMonth.text = '上月';
LastWeekSun.text = '上周（周日至周六）';
LastWeekMon.text = '上周（周一至周日）';
var QuickDates = {
    today: {
        text: '今天',
        start: Today,
        end: Today
    },
    yesterday: {
        text: '昨天',
        start: Yesterday,
        end: Yesterday
    },
    preMonth: LastMonth,
    preWeekSun: LastWeekSun,
    preWeekMon: LastWeekMon,
    passedThisMonth: {
        text: '本月',
        start: GetOffsetDate(-Today.getDate() + 1),
        end: Yesterday
    },
    lastestThisMonth: {
        text: '本月',
        start: GetOffsetDate(-Today.getDate() + 1),
        end: Today
    }
};
var TempDates = [2, 6, 13, 14, 29, 89];
for (var i = 0, date, dateSucc; i < TempDates.length; i++) {
    date = TempDates[i];
    dateSucc = date + 1;
    QuickDates['passed' + dateSucc] = {
        text: '过去' + dateSucc + '天',
        start: GetOffsetDate(-dateSucc),
        end: Yesterday
    };
    QuickDates['lastest' + dateSucc] = {
        text: '最近' + dateSucc + '天',
        start: GetOffsetDate(-date),
        end: Today
    };
}
var QueryQuickDateKeys = [
    'preMonth',
    'preWeekMon',
    'preWeekSun',
    'passedThisMonth',
    'lastestThisMonth'
];
var Rangepicker = Picker.extend({
    tmpl: '@rangepicker.html',
    ctor: function(ops) {
        var me = this;
        me.$dates = ops.dates;
        me.$quickDates = ops.quickDates || [];
        me.$picked = ops.picked;
    },
    inside: function(node) {
        var me = this;
        var inside = Magix.inside(node, me.id) || Magix.inside(node, me.$ownerNodeId);
        if (!inside) {
            var children = me.owner.children();
            for (var i = children.length - 1; i >= 0; i--) {
                var child = Magix.Vframe.get(children[i]);
                if (child)
                    inside = child.invoke('inside', node);
                if (inside) break;
            }
        }
        console.log(inside);
        return inside;
    },
    render: function() {
        var me = this;
        me.data.set({
            id: me.id,
            quickDatesMap: QuickDates,
            quickDates: me.$quickDates,
            dates: me.$dates
        }).digest();
        me.show();
    },
    hide: function() {
        var me = this;
        Picker.prototype.hide.call(me);
        var dates = me.data.get('dates');
        $('#start_' + me.id).val(dates.startStr);
        $('#end_' + me.id).val(dates.endStr);
    },
    'hide<click>': function() {
        this.hide();
    },
    'showDatepicker<click>': function(e) {
        var me = this,
            node = e.current,
            params = e.params;
        var dparams = {
            id: 'dp_' + node.id,
            ownerNodeId: node.id,
            selected: node.value,
            dock: me.$dock,
            picked: function(pe) {
                node.value = pe.date;
            }
        };
        if (params.first) {
            dparams.max = $('#end_' + me.id).val();
        } else {
            dparams.min = $('#start_' + me.id).val();
        }
        me.datepicker(dparams);
    },
    'picked<click>': function(e) {
        var me = this;
        var params = e.params;
        var data = me.data;
        var dates = data.get('dates'),
            start, end, startStr, endStr;
        if (params.quick) {
            dates.quickDateKey = params.key;
            var info = QuickDates[params.key];
            start = info.start;
            end = info.end;
            startStr = DateFormat(start, dates.formatter);
            endStr = DateFormat(end, dates.formatter);
            dates.startStr = startStr;
            dates.endStr = endStr;
            dates.start = start;
            dates.end = end;
            dates.quickDateText = info.text;
            data.set({
                dates: dates
            });
            data.digest();
        } else {
            startStr = $('#start_' + me.id).val();
            endStr = $('#end_' + me.id).val();
            dates = Rangepicker.getRangeDescription(startStr, endStr, me.$quickDates);
            data.set({
                dates: dates
            });
            data.digest();
        }
        if (me.$picked) {
            me.$picked(dates);
        }
        me.hide();
    }
}, {
    show: function(view, ops) {
        var id = ops.ownerNodeId;
        id = 'rp_' + id;
        var vf = Magix.Vframe.get(id);
        if (!vf) {
            $('body').append('<div id="' + id + '" />');
            view.owner.mountVframe(id, '@moduleId', ops);
        } else {
            vf.invoke('show');
        }
    },
    getSupportQuickDates: function() {
        return QuickDates;
    },
    getRangeDescription: function(start, end, translateQuickdatesKeys) {
        start = DateParse(start);
        end = DateParse(end);
        var formatter = 'yyyy-MM-dd';
        var result = {
            startStr: DateFormat(start, formatter),
            endStr: DateFormat(end, formatter),
            formatter: formatter
        };
        var quickDateKey,
            todayMillisecond = Today.getTime(),
            yesterdayMillisecond = Yesterday.getTime(),
            startMillisecond = start.getTime(),
            endMillisecond = end.getTime();
        if (startMillisecond == endMillisecond) {
            if (todayMillisecond == endMillisecond) {
                quickDateKey = 'today';
            } else if (yesterdayMillisecond == endMillisecond) {
                quickDateKey = 'yesterday';
            }
        } else {
            var mapped;
            var days = (endMillisecond - startMillisecond) / DayMillisecond + 1;
            if (yesterdayMillisecond == endMillisecond) {
                mapped = QuickDates[quickDateKey = 'passed' + days];
                if (!mapped) {
                    quickDateKey = 0;
                }
            } else if (todayMillisecond == endMillisecond) {
                mapped = QuickDates[quickDateKey = 'lastest' + days];
                if (!mapped) {
                    quickDateKey = 0;
                }
            }
        }
        if (!quickDateKey) {
            for (var i = QueryQuickDateKeys.length - 1; i > -1; i--) {
                var param = QueryQuickDateKeys[i];
                var info = QuickDates[param];
                if (endMillisecond == info.end.getTime() &&
                    startMillisecond == info.start.getTime()) {
                    quickDateKey = param;
                    break;
                }
            }
        }
        if (quickDateKey && translateQuickdatesKeys) {
            if (!Magix.toMap(translateQuickdatesKeys)[quickDateKey]) {
                quickDateKey = 0;
            }
        }
        if (quickDateKey) {
            result.quickDateText = QuickDates[quickDateKey].text;
            result.quickDateKey = quickDateKey;
        }
        return result;
    }
});

module.exports = Rangepicker;