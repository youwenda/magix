/*3.1.9 Licensed MIT*/define("magix",["$"],function(n){var t,e=n.noop,r=function(n,t){if(n)if(f(n))require(n,t);else try{t(require(n))}catch(e){require([n],t)}else t&&t()},i=function(){},o=function(n,t,e,r,o){return i[x]=t[x],o=new i,j(o,e),j(n,r),o.constructor=n,n[x]=o,n},a=n.isPlainObject,f=n.isArray,u=function(t,e){n(t).html(e)},c=function(t,e,r,i){e&&!c[t]&&(c[t]=1,r=n(g+S),r.length?(i=r.prop("styleSheet"),i?i.cssText+=e:r.append(e)):n("head").append('<style id="'+S+'">'+e+"</style>"))},s=0,$="",h=[],d=h.slice,l=",",v=null,p=window,m=document,g="#",y=JSON.stringify,w="\x1e",b="object",x="prototype",k="/",V=/[#?].*$/,q=/([^=&?\/#]+)=?([^&#?]*)/g,T=/(?!^)=|&/,I=function(n){return(n||"mx_")+s++},S=I(),A=I(),U={rootId:I(),defaultView:A,error:function(n){throw n}},H=U.hasOwnProperty,E=function(n){return typeof n==b?n:m.getElementById(n)},O=function(n,t,e){if(n=E(n),t=E(t),n&&t&&(e=n==t,!e))try{e=t.contains?t.contains(n):16&t.compareDocumentPosition(n)}catch(r){}return e},j=function(n,t,e){for(e in t)n[e]=t[e];return n},M=function(n,t,e,r,i,o){for(t=t||h,f(n)||(n=[n]),f(t)||(t=[t]),r=0;o=n[r];r++)try{i=o&&o.apply(e,t)}catch(a){U.error(a)}return i},P=function(n,t){return n&&H.call(n,t)},Z=function(n,t){return t.f-n.f||t.t-n.t},C=function(n,t,e,r){r=this,r.c=[],r.b=0|t||5,r.x=r.b+(n||20),r.r=e};j(C[x],{get:function(n){var t=this,e=t.c,r=e[w+n];return r&&(r.f++,r.t=s++,r=r.v),r},each:function(n,t,e,r,i){for(e=this,r=e.c,i=r.length-1;i>-1;i--)n(r[i].v,t,e)},set:function(n,t){var e=this,r=e.c,i=w+n,o=r[i],a=e.b;if(!o){if(r.length>=e.x)for(r.sort(Z);a--;)o=r.pop(),o.f>0&&e.del(o.o);o={o:n},r.push(o),r[i]=o}o.v=t,o.f=1,o.t=s++},del:function(n){n=w+n;var t=this.c,e=t[n],r=this.r;e&&(e.f=-1,e.v=$,delete t[n],r&&M(r,e.o,e))},has:function(n){return P(this.c,w+n)}});var L,F=new C,R=function(n,t,e){try{e=decodeURIComponent(e)}catch(r){}L[t]=e},B=function(n){var t,e=F.get(n);return e||(L={},t=n.replace(V,$),n==t&&T.test(t)&&(t=$),n.replace(t,$).replace(q,R),F.set(n,e={a:t,b:L})),{path:e.a,params:j({},e.b)}},D=function(n,t,e){var r,i,o,a=[];for(i in t)r=t[i]+$,(!e||r||P(e,i))&&(r=encodeURIComponent(r),a.push(o=i+"="+r));return o&&(n+=(n&&(~n.indexOf("?")?"&":"?"))+a.join("&")),n},N=function(n,t){var e,r,i,o={};if(n&&(i=n.length))for(e=0;e<i;e++)r=n[e],o[t&&r?r[t]:r]=t?r:(0|o[r])+1;return o},J=Object.keys||function(n,t,e){t=[];for(e in n)P(n,e)&&t.push(e);return t},K={config:function(n,t){return t=U,n&&(t=a(n)?j(t,n):t[n]),t},boot:function(n){j(U,n),r(U.ini,function(t){j(U,t),j(U,n),r(U.exts,function(){wn.on("changed",Hn),fn()})})},toMap:N,toTry:M,toUrl:D,parseUrl:B,mix:j,has:P,keys:J,inside:O,node:E,applyStyle:c,guid:I,Cache:C},Q="on",_={fire:function(n,t,e,r){var i,o,a,f,u=w+n,c=this,s=c[u];if(t||(t={}),t.type||(t.type=n),s)for(i=s.length,o=i-1;i--;)a=r?i:o-i,f=s[a],f.f?(f.x=1,M(f.f,t,c),f.x=$):f.x||(s.splice(a,1),o--);s=c[Q+n],s&&M(s,t,c),e&&c.off(n)},on:function(n,t){var e=this,r=w+n,i=e[r]||(e[r]=[]);i.push({f:t})},off:function(n,t){var e,r,i=w+n,o=this,a=o[i];if(t){if(a)for(e=a.length;e--;)if(r=a[e],r.f==t){r.f=$;break}}else delete o[i],delete o[Q+n]}};K.Event=_;var z,G,W,X,Y,nn,tn,en,rn=n.isFunction,on=g+"!",an=function(n,t,e,r,i){n=D(n,t,i),n!=e.srcHash&&(n=on+n,r?dn.replace(n):dn.hash=n)},fn=function(){var t,e,r=wn.parse().srcHash;n(p).on("hashchange",function(n,i){e||(i=wn.parse(),t=i.srcHash,t!=r&&(n={backward:function(){e=$,dn.hash=on+r},forward:function(){r=t,e=$,wn.diff()},prevent:function(){e=1}},wn.fire("change",n),e||n.forward()))}),p.onbeforeunload=function(n){n=n||p.event;var t={};if(wn.fire("pageunload",t),t.msg)return n&&(n.returnValue=t.msg),t.msg},wn.diff()},un="path",cn="view",sn="params",$n=new C,hn=new C,dn=p.location,ln={params:{},href:$},vn=/(?:^.*\/\/[^\/]+|#.*$)/gi,pn=/^[^#]*#?!?/,mn=function(n,t){return t=this[sn],t[n]||$},gn=function(n,t){if(X||(X=U.routes||{},Y=U.unmatchView,tn=U.defaultView,en=U.defaultPath||k,nn=rn(X),nn||X[en]||(X[en]=tn)),!n[cn]){var e=n.hash[un]||z&&n.query[un]||en;t=nn?X.call(U,e,n):X[e]||Y||tn,n[un]=e,n[cn]=t}},yn=function(n,t){var e=n.href,r=t.href,i=e+w+r,o=hn.get(i);if(!o){var a,f,u,c;o={force:!e},o[sn]=c={};var s,$,h=n[sn],d=t[sn],l=[un,cn].concat(J(h),J(d));for(s=l.length-1;s>=0;s--)$=l[s],1==s&&(h=n,d=t,c=o),f=h[$],u=d[$],f!=u&&(c[$]={from:f,to:u},a=1);hn.set(i,o={a:a,b:o})}return o},wn=j({parse:function(n){n=n||dn.href;var t,e,r,i,o,a=$n.get(n);return a||(t=n.replace(vn,$),e=n.replace(pn,$),r=B(t),i=B(e),o=j({},r[sn]),j(o,i[sn]),a={get:mn,href:n,srcQuery:t,srcHash:e,query:r,hash:i,params:o},gn(a),$n.set(n,a)),a},diff:function(){var n=wn.parse(),t=yn(ln,ln=n);return t.a&&(W=ln[sn],wn.fire("changed",G=t.b)),G},to:function(n,t,e){!t&&a(n)&&(t=n,n=$);var r=B(n),i=r[sn],o=r[un],f=ln[un],u=ln.query[sn];if(j(i,t),o){if(!z)for(f in u)P(i,f)||(i[f]=$)}else W&&(o=f,i=j(j({},W),i));an(o,W=i,ln,e,u)}},_);K.Router=wn;var bn,xn,kn=function(n,t,e){n.$d||n.$h||n.$cc!=n.$rc||(n.$cr||(n.$cr=1,n.$ca=0,n.fire("created")),t=n.id,e=Tn[n.pId],e&&!P(e.$r,t)&&(e.$r[t]=1,e.$rc++,kn(e)))},Vn=function(n,t,e,r){t||(t={}),!n.$ca&&n.$cr&&(n.$cr=0,n.$ca=1,n.fire("alter",t),e=n.id,r=Tn[n.pId],r&&P(r.$r,e)&&(r.$rc--,delete r.$r[e],Vn(r,t)))},qn=function(n,e){return bn||(t=m.body,n=U.rootId,e=E(n),e||(t.id=n),bn=new En(n)),bn},Tn={},In=function(n,t){P(Tn,n)||(Tn[n]=t,En.fire("add",{vframe:t}),n=E(n),n&&(n.vframe=t))},Sn=function(n,t,e){for(t=n.$il,t.$p=1;t.length;)e=t.shift(),e.r||n.invoke(e.n,e.a),delete t[e.k]},An=function(n,t,e){e=Tn[n],e&&(delete Tn[n],En.fire("remove",{vframe:e,fcc:t}),n=E(n),n&&(n.vframe=v))},Un=function(n,t){if(n&&(t=n.$v)&&t.$s>0){var e=dt(t);e&&t.render();for(var r=n.children(),i=r.length,o=0;o<i;)Un(Tn[r[o++]])}},Hn=function(n){var t,e=qn();(t=n.view)?e.mountView(t.to):Un(e)},En=function(n,t,e){e=this,e.id=n,e.$c={},e.$cc=0,e.$rc=0,e.$s=1,e.$r={},e.$il=[],e.pId=t,In(n,e)};j(En,j({all:function(){return Tn},get:function(n){return Tn[n]}},_)),j(j(En[x],_),{mountView:function(n,t){var e,i,o,a=this,f=E(a.id);if(!a.$a&&f&&(a.$a=1,a.$t=f.innerHTML),a.unmountView(),a.$d=0,f&&n){a.path=n,e=B(n),o=e.path,i=++a.$s;var u,c,s=e.params,$=Tn[a.pId];if($=$&&$.$v,$=$&&$.$updater,$&&n.indexOf(w)>0)for(u in s)c=s[u],c.charAt(0)==w&&(s[u]=$.get(c));j(s,t),r(o,function(n){i==a.$s&&(n||U.error(Error("cannot load:"+o)),$t(n),o=new n({owner:a,id:a.id},s),a.$v=o,ut(o),o.init(s),o.render(),o.tmpl||o.$p||o.endUpdate())})}},unmountView:function(){var n,t,e=this,r=e.$v;e.$il=[],r&&(xn||(t=1,xn={id:e.id}),e.$d=1,e.unmountZone(),Vn(e,xn),e.$v=0,lt(r),n=E(e.id),n&&e.$a&&u(n,e.$t),t&&(xn=0)),e.$s++},mountVframe:function(n,t,e){var r,i=this;return Vn(i),r=Tn[n],r||(P(i.$c,n)||(i.$cl=$,i.$cc++),i.$c[n]=n,r=new En(n,i.id)),r.mountView(t,e),r},mountZone:function(t,e){var r,i,o,a=this,f=[];t=t||a.id;var u=n(g+t+" [mx-view]");for(a.$h=1,r=0;r<u.length;r++)i=u[r],o=i.id||(i.id=I()),i.$m||(i.$m=1,f.push([o,i.getAttribute("mx-view")]));for(;f.length;)i=f.shift(),a.mountVframe(i[0],i[1],e);a.$h=0,kn(a)},unmountVframe:function(n,t){var e,r,i,o=this;n=n?o.$c[n]:o.id,e=Tn[n],e&&(r=e.$cr,i=e.pId,e.unmountView(),An(n,r),e.id=e.pId=$,e=Tn[i],e&&P(e.$c,n)&&(delete e.$c[n],e.$cl=$,e.$cc--,t||kn(e)))},unmountZone:function(n){var t,e=this,r=e.$c;for(t in r)(!n||t!=n&&O(t,n))&&e.unmountVframe(t,1)},parent:function(n,t){for(t=this,n=n>>>0||1;t&&n--;)t=Tn[t.pId];return t},children:function(n){return n=this,n.$cl||(n.$cl=J(n.$c))},invoke:function(n,t){var e,r,i,o,a,f=this,u=f.$il;return(r=f.$v)&&u.$p?e=(i=r[n])&&M(i,t,r):(o=u[a=w+n],o&&(o.r=mt(t)==mt(o.a)),o={n:n,a:t,k:a},u.push(o),u[a]=o),e}}),K.Vframe=En;var On=function(n,t){t=n.data,n.eventTarget=n.currentTarget,M(t.f,n,t.v)},jn=function(t,e,r,i,o,a){i?n(t).off(e,o,r):n(t).on(e,o,a,r)},Mn="parentNode",Pn=new C(30,10),Zn=/(?:([\w\-]+)\u001e)?([^\(]+)\(([\s\S]*)?\)/,Cn={},Ln=function(n){for(var e,r,i,o,a,f,u,c,s=n.target,$=n.type,d="mx-"+$,l=[];s!=t&&1==s.nodeType&&((e=s.getAttribute(d))&&(l=[],f=Pn.get(e),f||(f=e.match(Zn)||h,f={v:f[1],n:f[2],i:f[3]},f.p=f.i&&M(Function("return "+f.i))||{},Pn.set(e,f)),a=f.v,a?(i=Tn[a],o=i&&i.$v,o&&o.$s>0&&(u=f.n+w+$,c=o[u],c&&(n.eventTarget=s,n.params=f.p,M(c,n,o)))):U.error(Error("bad:"+e))),!((r=s.$)&&r[$]||n.mxStop||n.isPropagationStopped()));)l.push(s),s=s[Mn]||t;for(;s=l.pop();)r=s.$||(s.$={}),r[$]=1},Fn=function(n,e){var r=0|Cn[n],i=r>0?1:0;r+=e?-i:i,r||(jn(t,n,Ln,e),e||(r=1)),Cn[n]=r},Rn=/\\|'/g,Bn=/\r|\n/g,Dn=/<%([@=!])?([\s\S]+?)%>|$/g,Nn=function(n){var t=0,e="$p+='";return n.replace(Dn,function(r,i,o,a){return e+=n.slice(t,a).replace(Rn,"\\$&").replace(Bn,"\\n"),t=a+r.length,"@"==i?e+="'\n$s=$i();\n$p+=$s;\n$$[$s]="+o+";\n$p+='":"="==i?e+="'+\n(($t=("+o+"))==null?'':$e($t))+\n'":"!"==i?e+="'+\n(($t=("+o+"))==null?'':$t)+\n'":o&&(e+="';\n"+o+"\n$p+='"),r}),e+="';\n",e="var $t,$p='',$em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\\'':'&#x27;','`':'&#x60;'},$er=/[&<>\"'`]/g,$ef=function(m){return $em[m]},$e=function(v){return (''+v).replace($er,$ef)},$i=function(){return '"+w+"'+$g++},$s;\n"+e+"return $p;\n",Function("$g","$$",e)},Jn=new C,Kn=function(n,t){var e=Jn.get(n);return e||(e=Nn(n),Jn.set(n,e)),e(1,t)},Qn=/\u001f(\d+)\u001f/g,_n=/([\w\-]+)(?:=(["'])([\s\S]*?)\2)?/g,zn={amp:"&",lt:"<",gt:">",quot:'"',"#x27":"'","#x60":"`"},Gn=/&([^;]+?);/g,Wn=function(n,t){return zn[t]||n},Xn=function(n,t,e,r,i,o,a,f,u){var c=n.id||(n.id=I());if(!e[c]){e[c]=1;var s,$,h;if(o){var d=it(Kn(r.attr,i),f),l={};d.replace(_n,function(n,t,e,r){l[t]=r});for(var v,p,m,g,y,w=r.attrs.length-1;w>=0;w--)v=r.attrs[w],p=v.n,y=v.f,v.v?(s=1,$=l[p]):(m=v.p?n[y||p]:n.getAttribute(p),g=v.b?P(l,p):l[p]||"",m!=g&&(v.p?(v.q&&(g=g.replace(Gn,Wn)),n[y||p]=g):g?n.setAttribute(p,g):n.removeAttribute(p)))}s&&(h=Tn[c],h&&h[$?"unmountView":"unmountVframe"]()),a&&(t.setHTML(c,Kn(r.tmpl,i)),u.fire("update",{node:n})),s&&$&&t.owner.mountVframe(c,$)}},Yn=function(t,e,r,i){var o=Tn[t.$i],a=o&&o.$v;if(a){var f=a.tmpl,u=f.html,c=f.subs,s=a.id;if(e||!t.$rd)if(t.$rd&&r&&c)for(var $,h,d,l,v,p,m,g,y={},w=c.length-1;w>=0;w--){if(d=0,l=0,h=c[w],v=1,m=h.mask,$=h.pKeys)for(p=$.length;--p>=0;)if(P(r,$[p])){v=0;break}if(v){for($=h.keys,p=$.length,v=0;--p>=0;)if(P(r,$[p])){if(v=1,!m||d&&l){d=h.tmpl,l=h.attr;break}g=m.charAt(p),d=d||1&g,l=l||2&g}if(v){var b=n(it(h.path,s));for(p=0;p<b.length;)Xn(b[p++],a,y,h,i,l,d,s,t)}}}else{var x,k,V=function(n,t){return x[t].tmpl};if(c){if(!c.$)for(c.$=x={},k=c.length;k>0;){var q=c[--k];q.s&&(x[q.s]=q,q.tmpl=q.tmpl.replace(Qn,V),delete q.s)}x=c.$}t.$rd=1;var T=u.replace(Qn,V);a.setHTML(t.$t,Kn(T,i))}}},nt=function(n){var t=this;t.$i=n,t.$t=n,t.$data={},t.$keys={},t.$fk={}},tt=nt.prototype;j(tt,_),j(tt,{to:function(n,t){return t=this,t.$t=n,t},get:function(n){var t=this.$data;return n&&(t=t[n]),t},set:function(n){var t,e=this;for(var r in n)e.$u=1,e.$keys[r]=1,e.$data[r]=t=n[r],rn(t)&&(e.$fkf=1,e.$fk[r]=1);return e},digest:function(){var n,t,e=this,r=e.$data;return n=e.$u,t=e.$keys,Yn(e,n,t,r),n&&(e.fire("changed",{keys:t}),delete e.$lss),e.$fkf?e.$keys=j({},e.$fk):(e.$u=0,e.$keys={}),e},snapshot:function(){var n=this,t=n.$data;return n.$ss=y(t),n},altered:function(){var n=this,t=n.$data;return n.$ss?n.$ss!=y(t):1}});var et=/^(\$?)([^<]+)<([^>]+)>$/,rt=/\u001f/g,it=function(n,t){return(n+$).replace(rt,t||this.id)},ot=function(n,t){var e,r,i=n.$r;for(e in i)r=i[e],(t||r.x)&&at(i,e,1)},at=function(n,t,e){var r,i,o=n[t];return o&&(i=o.e,r=i.destroy,r&&e&&M(r,h,i),delete n[t]),i},ft=function(n,t,e){t=n.render,n.render=function(){e=this,e.$s>0&&(e.$s++,e.fire("rendercall"),ot(e),M(t,d.call(arguments),e))}},ut=function(n,t){var e,r,i=n.$eo;for(e in i)Fn(e,t);for(i=n.$el,e=i.length;e--;)r=i[e],jn(r.e||g+n.id,r.n,On,t,r.s,{v:n,f:r.f})},ct=[],st={win:p,doc:m},$t=function(n){if(!n[w]){n[w]=1;var t,e,r,i,o,a,f,u,c=n[x],s={},$=[];for(f in c)if(t=c[f],e=f.match(et))for(a=e[1],r=e[2],i=e[3].split(l);u=i.pop();)a?(o=st[r],$.push({f:t,s:o?v:r,n:u,e:o})):(s[u]=1,u=r+w+u,c[u]||(c[u]=t));ft(c),c.$eo=s,c.$el=$}},ht=function(n,t,e){for(var r=0;r<n.length&&!(e=P(t,n[r]));r++);return e},dt=function(n){var t,e=n.$l;return e.f&&(e.p&&(t=G[un]),t||(t=ht(e.k,G[sn]))),t},lt=function(n){n.$s>0&&(n.$s=0,n.fire("destroy",0,1,1),ot(n,1),ut(n,1)),n.$s--},vt=function(n,t){t=this,j(t,n),t.$l={k:[]},t.$r={},t.$s=1,t.$updater=new nt(t.id),M(ct,n,t)},pt=vt[x];j(vt,{merge:function(n,t){t=n&&n.ctor,t&&ct.push(t),j(pt,n)},extend:function(n,t){var e=this;n=n||{};var r=n.ctor,i=function(n,t){e.call(this,n,t),r&&r.call(this,t)};return i.extend=e.extend,o(i,e,n,t)}}),j(j(pt,_),{render:e,init:e,wrapEvent:it,beginUpdate:function(n,t){t=this,t.$s>0&&t.$p&&t.owner.unmountZone(n)},endUpdate:function(n,t,e,r){t=this,t.$s>0&&(r=t.$p,t.$p=1,e=t.owner,e.mountZone(n),r||setTimeout(function(){Sn(e)},0))},wrapAsync:function(n,t){var e=this,r=e.$s;return function(){r>0&&r==e.$s&&n&&n.apply(t||e,arguments)}},observe:function(n,t){var e,r,i=this;e=i.$l,e.f=1,r=e.k,a(n)&&(t=n.path,n=n.params),e.p=t,n&&(e.k=r.concat((n+$).split(l)))},capture:function(n,t,e,r,i){return r=this.$r,t?(at(r,n,1),i={e:t,x:e},r[n]=i):(i=r[n],t=i&&i.e||t),t},release:function(n,t){return at(this.$r,n,t)},leaveTip:function(n,t){var e=this,r=function(r){r.prevent(),t()?e.leaveConfirm(n,r):r.forward()},i=function(e){t()&&(e.msg=n)};wn.on("change",r),wn.on("pageunload",i),e.on("destroy",function(){wn.off("change",r),wn.off("pageunload",i)})},share:function(n,t){var e=this;e.$sd||(e.$sd={}),e.$sd[n]=t},getShared:function(n){var t,e=this,r=e.$sd;if(r&&(t=P(r,n)))return r[n];var i=e.owner.parent();return i?i.invoke("getShared",n):void 0},setHTML:function(n,t){var e,r=this;r.beginUpdate(n),r.$s>0&&(e=E(n),e&&u(e,it(t,r.id))),r.endUpdate(n)}}),K.View=vt;var mt=n.type,gt=n.proxy,yt=n.now||Date.now,wt=function(){this.id=I("b"),this.$={}};j(wt[x],{get:function(n,t,e){var r=this,i=arguments.length,o=i>=2,a=r.$,u=a;if(i){for(var c,s=f(n)?d.call(n):(n+$).split(".");(c=s.shift())&&u;)u=u[c];c&&(u=e)}return o&&mt(t)!=mt(u)&&(U.error(Error("type neq:"+n)),u=t),u},set:function(n,t){var e,r=this;a(n)||(e={},e[n]=t,n=e),j(r.$,n)}});var bt=1,xt=2,kt=function(n,t,e){e=this[n],e&&(delete this[n],M(e,t,e.e))},Vt=function(n,t,e,r,i,o){var a=[],f=v,u=0;return function(c,s){var $,h=this;u++;var d=h.$m,l=d.k;a[c+1]=h;var p={bag:h,error:s};if(s)f=s,t.fire("fail",p),$=1;else if(!o.has(l)){l&&o.set(l,h),d.t=yt();var m=d.a;m&&M(m,h,h),d.x&&t.clear(d.x),t.fire("done",p),$=1}if(!e.$o){var g=u==r;g&&(e.$b=0,i==xt&&(a[0]=f,M(n,a,e))),i==bt&&M(n,[s?s:v,h,g,c],e)}$&&t.fire("end",p)}},qt=function(n,t,e,r,i){if(n.$o)return n;if(n.$b)return n.enqueue(function(){qt(this,t,e,r,i)});n.$b=1;var o=n.constructor,a=o.$r;f(t)||(t=[t]);for(var u,c=t.length,s=Vt(e,o,n,c,r,o.$c),$=0;$<c;$++)if(u=t[$]){var h,d=o.get(u,i),l=d.e,v=l.$m.k,p=gt(s,l,$);v&&a[v]?a[v].push(p):d.u?(v&&(h=[p],h.e=l,a[v]=h,p=gt(kt,a,v)),o.$s(l,p)):p()}return n},Tt=function(){var n=this;n.id=I("s"),n.$q=[]};j(Tt[x],{all:function(n,t){return qt(this,n,t,xt)},save:function(n,t){return qt(this,n,t,xt,1)},one:function(n,t){return qt(this,n,t,bt)},enqueue:function(n){var t=this;return t.$o||(t.$q.push(n),t.dequeue(t.$a)),t},dequeue:function(){var n=this,t=d.call(arguments);n.$b||n.$o||(n.$b=1,setTimeout(function(){if(n.$b=0,!n.$o){var e=n.$q.shift();e&&M(e,n.$a=t,n)}},0))},destroy:function(n){n=this,n.$o=1,n.$q=0}});var It=function(n,t,e){return e=[y(t),y(n)],e.join(w)},St=function(n,t,e,r){r=n&&n.$m,r&&t[r.n]&&e.del(r.k)},At=j({add:function(n){var t=this,e=t.$m;f(n)||(n=[n]);for(var r,i,o=n.length-1;o>-1;o--)r=n[o],r&&(i=r.name,r.cache=0|r.cache,e[i]=r)},create:function(n){var t=this,e=t.meta(n),r=e.cache,i=new wt;i.set(e),i.$m={n:e.name,a:e.after,x:e.cleans,k:r&&It(e,n)},a(n)&&i.set(n);var o=e.before;return o&&M(o,i,i),t.fire("begin",{bag:i}),i},meta:function(n){var t=this,e=t.$m,r=n.name||n,i=e[r];return i||n},get:function(n,t){var e,r,i=this;return t||(e=i.cached(n)),e||(e=i.create(n),r=1),{e:e,u:r}},clear:function(n){this.$c.each(St,N((n+$).split(l)))},cached:function(n){var t,e,r=this,i=r.$c,o=r.meta(n),a=o.cache;if(a&&(e=It(o,n)),e){var f=r.$r,u=f[e];u?t=u.e:(t=i.get(e),t&&a>0&&yt()-t.$m.t>a&&(i.del(e),t=0))}return t}},_);Tt.extend=function(n,t,e){var r=this,i=function(){r.call(this)};return i.$s=n,i.$c=new C(t,e),i.$r={},i.$m={},o(i,r,v,At)},K.Service=Tt;var Ut=function(n,t){var e=this,r=n&&n.ctor,i=function(){var n=this,t=arguments;e.apply(n,t),r&&r.apply(n,t)};return i.extend=Ut,o(i,e,n,t)};return j(e[x],_),e.extend=Ut,K.Base=e,define(A,function(){return vt.extend()}),K});