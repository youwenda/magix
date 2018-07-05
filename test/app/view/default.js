KISSY.add("app/view/default", function (S, View) {
    return View.extend({
        tmpl: ($$,$viewId)=>{let $g='',$_temp,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\'':'#39','`':'#96'},$er=/[&<>"'`]/g,$n=v=>''+(v==null?'':v),$ef=m=>`&${$em[m]};`,$e=v=>$n(v).replace($er,$ef),$um={'!':'%21','\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\'"]/g,$eq=v=>$n(v).replace($qr,'\\$&');$p+='<div mxs="subway_:a">Updater Demo<div id="mx_25" mx-view="app/view/content1"></div><div id="mx_26" mx-view="app/view/content2"></div></div>';return $p},
        init: function (){
            this.updater.digest();
            Magix.Vframe.fire('mounted');
            this.owner.fire('mounted');
        },
        'fold<click>'(e) {
            console.log('xx');
        },
        events: {
            click: {
                a: function () {
                    return 'a0'
                }
            }
        }
    });
}, {
    requires: [
        'app/view/p1'
    ]
});
