KISSY.add("app/view/default", (S, View) => {
    const $ = S.all;

    return View.extend({
        tmpl: ($$,$viewId)=>{let $g='',$_temp,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\'':'#39','`':'#96'},$er=/[&<>"'`]/g,$n=v=>''+(v==null?'':v),$ef=m=>`&${$em[m]};`,$e=v=>$n(v).replace($er,$ef),$um={'!':'%21','\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\'"]/g,$eq=v=>$n(v).replace($qr,'\\$&');$p+='<div mxs="subway_:a">Updater Demo<div id="mx_25" mx-view="app/view/content1"></div><div id="mx_26" mx-view="app/view/content2"></div><span id="loc-param">loc</span><span id="state-param">state</span></div>';return $p},
        init() {
            this.updater.digest();
            this.observeLocation('loc-param');
            this.observeState('state-param');
            Magix.Vframe.fire('mounted');
            this.owner.fire('mounted');
        },
        render() {
            try {
                const loc = Magix.Router.parse();
                const locParam = Magix.State.get('loc-param') || loc.get('loc-param') || 'loc';
                const stateParam = Magix.State.get('state-param') || loc.get('state-param') || 'state';
        
                $('#loc-param').html(locParam);
                $('#state-param').html(stateParam);
                this.owner.fire('canTest');
            } catch (err) {
                throw err;
            }
        },
        'fold<click>'(e) {
            console.log('xx');
        },
        events: {
            click: {
                a() {
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
