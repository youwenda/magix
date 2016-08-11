var Tmpl_Escapes = {
  "'": "'",
  "\\": "\\",
  "\r": "r",
  "\n": "n",
  "\u2028": "u2028",
  "\u2029": "u2029"
};
var Tmpl_EscapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
var Tmpl_EscapeChar = function(match) {
  return "\\" + Tmpl_Escapes[match];
};
var Tmpl_Mathcer = /<%=([\s\S]+?)%>|<%!([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;
var Tmpl_Compiler = function(text) {
  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(Tmpl_Mathcer, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(Tmpl_EscapeRegExp, Tmpl_EscapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':__e(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }
    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  source = "with(_mx){\n" + source + "}\n";
  source = "var __t,__p='',__em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\\'':'&#x27;','`':'&#x60;'},__er=/[&<>\"'`]/g,__ef=function(m){return __em[m]},__e=function(v){v = v == null ? '' : '' + v;return v.replace(__er,__ef)};\n" +
    source + "return __p;\n";

  var render;
  try {
    render = new Function("_mx", source);
  } catch (e) {
    e.source = source;
    throw e;
  }
  return render;
};
var Tmpl_Cache = new G_Cache();
var Tmpl = function(text, data) {
  var fn = Tmpl_Cache.get(text);
  if (!fn) {
    fn = Tmpl_Compiler(text);
    Tmpl_Cache.set(text, fn);
  }
  return fn(data);
};