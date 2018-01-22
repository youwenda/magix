let Tmpl_EscapeSlashRegExp = /\\|'/g;
let Tmpl_EscapeBreakReturnRegExp = /\r|\n/g;
let Tmpl_Mathcer = /<%([@=!])?([\s\S]*?)%>|$/g;
let Tmpl_Compiler = text => {
    // Compile the template source, escaping string literals appropriately.
    let index = 0;
    let source = "$p+='";
    text.replace(Tmpl_Mathcer, (match, operate, content, offset) => {
        source += text.slice(index, offset).replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
        index = offset + match.length;
        if (DEBUG) {
            let expr = text.slice(index - match.length + 2 + (operate ? 1 : 0), index - 2);
            let artReg = /^'(\d+)\x11([^\x11]+)\x11'$/;
            let artM = expr.match(artReg);
            let art = '';
            let line = -1;
            if (artM) {
                expr = expr.replace(artReg, '');
                art = artM[2];
                line = artM[1];
            } else {
                expr = expr.replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
            }
            if (operate == "@") {
                source += "';$expr='<%" + operate + expr + "%>';$p+=$i(" + content + ");$p+='";
            } else if (operate == "=") {
                source += "'+($expr='<%" + operate + expr + "%>',$e(" + content + "))+'";
            } else if (operate == "!") {
                source += "'+($expr='<%" + operate + expr + "%>',$n(" + content + "))+'";
            } else if (content) {
                if (line > -1) {
                    source += "';$art='" + art + "';$line=" + line + ";";
                } else {
                    source += "';";
                }
                source += "$expr='<%" + expr + "%>';" + content + ";$p+='";
            }
        } else {
            if (operate == "@") {
                source += `';$p+=$i(${content});$p+='`;
            } else if (operate == "=") {
                source += `'+$e(${content})+'`;
            } else if (operate == "!") {
                source += `'+$n(${content})+'`;
            } else if (content) {
                source += `';${content};$p+='`;
            }
        }
        // Adobe VMs need the match returned to produce the correct offset.
        return match;
    });
    source += "';";
    /*#if(modules.es3){#*/

    if (DEBUG) {
        source = "var $expr,$art,$line;try{" + source + "}catch(ex){$throw(ex,$expr,$art,$line)}";
    }

    source = "var $t,$p='',$em={'&':'amp','<':'lt','>':'gt','\"':'#34','\\'':'#39','`':'#96'},$er=/[&<>\"'`]/g,$n=function(v){return v==null?'':''+v},$ef=function(m){return '&'+$em[m]+';'},$e=function(v){return $n(v).replace($er,$ef)},$i=function(v,k,f){for(f=$$[$g];--f;)if($$[k=$g+f]===v)return k;$$[k=$g+$$[$g]++]=v;return k},$um={'!':'%21','\\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=function(m){return $um[m]},$uq=/[!')(*]/g,$eu=function(v){return encodeURIComponent($n(v)).replace($uq,$uf)},$qr=/[\\\\'\"]/g,$eq=function(v){return $n(v).replace($qr,'\\\\$&')};" + source + "return $p";

    /*#}else{#*/
    if (DEBUG) {
        source = "let $expr,$art,$line;try{" + source + "}catch(ex){$throw(ex,$expr,$art,$line)}";
    }

    source = `let $t,$p='',$em={'&':'amp','<':'lt','>':'gt','"':'#34','\\'':'#39','\`':'#96'},$er=/[&<>"'\`]/g,$n=v=>v==null?'':''+v,$ef=m=>'&'+$em[m]+';',$e=v=>$n(v).replace($er,$ef),$i=(v,k,f)=>{for(f=$$[$g];--f;)if($$[k=$g+f]===v)return k;$$[k=$g+$$[$g]++]=v;return k},$um={'!':'%21','\\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=m=>$um[m],$uq=/[!')(*]/g,$eu=v=>encodeURIComponent($n(v)).replace($uq,$uf),$qr=/[\\\\'"]/g,$eq=v=>$n(v).replace($qr,'\\\\$&');${source}return $p`;
    /*#}#*/
    //console.log(source);
    if (DEBUG) {
        /*jshint evil: true*/
        return Function("$g", "$$", "$throw", source);
    }
    /*jshint evil: true*/
    return Function("$g", "$$", source);
};
let Tmpl_Cache = new G_Cache();
let Tmpl = (text, data, file) => {
    let fn = Tmpl_Cache.get(text);
    if (!fn) {
        fn = Tmpl_Compiler(text);
        Tmpl_Cache.set(text, fn);
    }
    if (DEBUG) {
        return fn(G_SPLITER, data, (ex, expr, art, line) => {
            setTimeout(() => {
                if (file) {
                    throw `render view error: ${ex.message || ex}${art ? `\r\n\tsrc art: {{${art}}}\t\n\tat line: ${line}` : ''}\r\n\t${art ? 'translate to:' : 'expr:'} ${expr}\r\n\tat file: ${file}`;
                } else {
                    throw new Error(`render view error: ${ex.message || ex}\r\n\texpr: ${expr}`);
                }
            }, 0);
        });
    }
    return fn(G_SPLITER, data);
};