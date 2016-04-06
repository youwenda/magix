define("app/views/demos/partials/view-subs-popup",['magix','../../../../coms/form/index','$'],function(require){
/*Magix ,Form ,$ */
/*
    author:xinglie.lkf@taobao.com
 */

var Magix = require('magix');
var Form = require('../../../../coms/form/index');
var $ = require('$');
return Form.extend({
    tmpl: "<div class=\"mp-514-form-item\"><div class=\"mp-514-title\">停留时间</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" value=\"<%=creative.stayTime%>\" /> 秒\n    </div></div><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">延迟弹出</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" value=\"<%=creative.delayTime%>\" mx-change=\"setValue({path:'creative.delayTime'})\" /> 秒\n    </div></div><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">响应时间</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" id=\"respondTime_<%=id%>\" value=\"<%=creative.respondTime%>\" mx-change=\"setValue({path:'creative.respondTime'})\" /> 秒\n    </div></div><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">其它</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" value=\"<%=others[0]%>\" mx-change=\"setValue({path:'others.0'})\" id=\"others_0_<%=id%>\" /></div></div><div mx-guid=\"x8a31-\u001f\">@1-\u001f</div><div class=\"mp-514-form-item\"><div class=\"mp-514-title\">&nbsp;</div><div class=\"mp-514-content\"><button class=\"btn\" mx-click=\"addOthers();\">+</button></div></div>",
tmplData:[{"guid":1,"keys":["others"],"tmpl":"\n<%for(var i=1;i<others.length;i++){%>\n    <div class=\"mp-514-form-item\"><div class=\"mp-514-title\">&nbsp;</div><div class=\"mp-514-content\"><input class=\"input mp-514-w88\" value=\"<%=others[i]%>\" mx-change=\"setValue({path:'others.<%=i%>'})\" id=\"others_<%=i%>_<%=id%>\" /></div></div>\n<%}%>\n","selector":"div[mx-guid=\"x8a31-\u001f\"]","attrs":[]}],
    ctor: function(extra) {
        var me = this;
        var creative = extra.creative;
        if (!creative.others.length) creative.others.push('');
        var list = me.getShared('listData');
        console.log('list',list);
        me.data.set({
            id: me.id,
            creative: creative,
            others: creative.others
        });
        me.addValidator({
            'others.*': function(v, key) {
                if (!v) {
                    $('#others_' + key + '_' + me.id).addClass('validator-error');
                    return false;
                } else {
                    $('#others_' + key + '_' + me.id).removeClass('validator-error');
                }
            },
            'creative.respondTime': function(v) {
                if (!v) {
                    $('#respondTime_' + me.id).addClass('validator-error');
                    return false;
                } else {
                    $('#respondTime_' + me.id).removeClass('validator-error');
                }
            }
        });
    },
    render: function() {
        var me = this;
        me.data.digest();
    },
    'addOthers<click>': function() {
        var others = this.data.get('others');
        others.push('');
        this.data.set({
            others: others
        }).digest();
    }
});
});