var Tmpl_EscapeSlashRegExp = /\\|'/g;
var Tmpl_EscapeBreakReturnRegExp = /\r|\n/g;
var Tmpl_Mathcer = /<%([@=!])?([\s\S]*?)%>|$/g;
var Tmpl_Compiler = function(text) {
    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "$p+='";
    text.replace(Tmpl_Mathcer, function(match, operate, content, offset) {
        source += text.slice(index, offset).replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
        index = offset + match.length;
        if (DEBUG) {
            var expr = text.slice(index - match.length, index).replace(/\${2}\./, "").replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
            if (operate == "@") {
                source += "';$expr='" + expr + "';$p+=$i(" + content + ");$p+='";
            } else if (operate == "=") {
                source += "'+($expr='" + expr + "',$e(" + content + "))+'";
            } else if (operate == "!") {
                source += "'+($expr='" + expr + "',$n(" + content + "))+'";
            } else if (content) {
                source += "';$expr='" + expr + "';" + content + ";$p+='";
            }
        } else {
            if (operate == "@") {
                source += "';$p+=$i(" + content + ");$p+='";
            } else if (operate == "=") {
                source += "'+$e(" + content + ")+'";
            } else if (operate == "!") {
                source += "'+$n(" + content + ")+'";
            } else if (content) {
                source += "';" + content + ";$p+='";
            }
        }
        // Adobe VMs need the match returned to produce the correct offset.
        return match;
    });
    source += "';";

    if (DEBUG) {
        source = "var $expr;try{" + source + "}catch(ex){$throw(ex,$expr)}";
    }
    // If a variable is not specified, place data values in local scope.
    //source = "with($mx){\n" + source + "}\n";
    source = "var $t,$p='',$em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&#34;','\\'':'&#39;','`':'&#96;'},$er=/[&<>\"'`]/g,$n=function(v){return v==null?'':''+v},$ef=function(m){return $em[m]},$e=function(v){return $n(v).replace($er,$ef)},$i=function(v,k,f){for(f=$$[$g];--f;)if($$[k=$g+f]===v)return k;$$[k=$g+$$[$g]++]=v;return k},$um={'!':'%21','\\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=function(m){return $um[m]},$uq=/[!')(*]/g,$eu=function(v){return encodeURIComponent($n(v)).replace($uq,$uf)},$qr=/[\\\\'\"]/g,$eq=function(v){return $n(v).replace($qr,'\\\\$&')};" + source + "return $p";
    if (DEBUG) {
        /*jshint evil: true*/
        return Function("$g", "$$", "$throw", source);
    }
    /*jshint evil: true*/
    return Function("$g", "$$", source);
};
var Tmpl_Cache = new G_Cache();
var Tmpl = function(text, data) {
    var fn = Tmpl_Cache.get(text);
    if (!fn) {
        fn = Tmpl_Compiler(text);
        Tmpl_Cache.set(text, fn);
    }
    return fn.call(data, G_SPLITER, data);
};
if (DEBUG) {
    var Tmpl = function(text, data, file) {
        var fn = Tmpl_Cache.get(text);
        if (!fn) {
            fn = Tmpl_Compiler(text);
            Tmpl_Cache.set(text, fn);
        }
        return fn.call(data, G_SPLITER, data, function(ex, expr) {
            setTimeout(function() {
                if (file) {
                    throw "tmpl exec error:" + ex.message + "\r\n\texpr " + expr + "\r\n\tfile " + file;
                } else {
                    throw new Error("tmpl exec error:" + ex.message + "\r\n\texpr " + expr);
                }
            }, 0);
        });
    };
}