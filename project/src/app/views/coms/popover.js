define("app/views/coms/popover",['magix'],function(require){
/*Magix */
/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
return Magix.View.extend({
    tmpl: "<div mx-view=\"coms/popover/index?content=left&dock=left&icon=left\" style=\"margin:50px;\"></div><div mx-view=\"coms/popover/index?content=right&dock=right&icon=right\" style=\"margin:50px;\"></div><div mx-view=\"coms/popover/index?content=top&dock=top&icon=top\" style=\"margin:50px;\"></div><div mx-view=\"coms/popover/index?content=bottom&dock=bottom&icon=bottom\" style=\"margin:50px;\"></div>",
    render: function() {
        var me = this;
        me.data.digest();
        console.log('popover');
        console.log(me.owner.parent());
    }
});
});