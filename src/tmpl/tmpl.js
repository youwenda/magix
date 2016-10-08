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
var Tmpl_Mathcer = /<%@([\s\S]+?)%>|<%=([\s\S]+?)%>|<%!([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;
var Tmpl_Compiler = function(text) {
  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "$p+='";
  text.replace(Tmpl_Mathcer, function(match, ref, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(Tmpl_EscapeRegExp, Tmpl_EscapeChar);
    index = offset + match.length;

    if (ref) {
      source += "'\n$s=$i();\n$p+=$s;\n$mx[$s]=" + ref + ";\n$p+='";
    } else if (escape) {
      source += "'+\n(($t=(" + escape + "))==null?'':$e($t))+\n'";
    } else if (interpolate) {
      source += "'+\n(($t=(" + interpolate + "))==null?'':$t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n$p+='";
    }
    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  source = "with($mx){\n" + source + "}\n";
  source = "var $t,$p='',$em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\\'':'&#x27;','`':'&#x60;'},$er=/[&<>\"'`]/g,$ef=function(m){return $em[m]},$e=function(v){v=v==null?'':''+v;return v.replace($er,$ef)},$i=function(){return '~'+$g++},$s;\n" + source + "return $p;\n";

  var render;
  try {
    /*jshint evil: true*/
    render = Function("$g", "$mx", source);
  } catch (e) {
    e.source = source;
    throw e;
  }
  return render;
};
var Tmpl_Cache = new G_Cache();
/**
 * Tmpl模板编译方法，语法参考underscore.template。该方法主要配合Updater存在
 * @name Tmpl
 * @beta
 * @module updater
 * @constructor
 * @param {String} text 模板字符串
 * @param {Object} data 数据对象
 * @example
 * // 主要配合updater使用
 * // html
 * // &lt;div mx-keys="a"&gt;&lt;%=a%&gt;&lt;/div&gt;
 * render:fucntion(){
 *   this.$updater.set({
 *     a:1
 *   }).digest();
 * }
 */
var Tmpl = function(text, data) {
  var fn = Tmpl_Cache.get(text);
  if (!fn) {
    fn = Tmpl_Compiler(text);
    Tmpl_Cache.set(text, fn);
  }
  return fn(1, data);
};