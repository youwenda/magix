var tmpl = function(text, data) {
  var settings, render, noMatch, matcher, index, source, escaper, escapes, template;

  matcher =/\/\*#=([\s\S]+?)#\*\/|\/\*#([\s\S]+?)#\*\/|$/g;

  index = 0;
  source = "__p+='";
  escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  text.replace(matcher, function(match, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escaper, function(match) {
      return '\\' + escapes[match];
    });

    if (interpolate)
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";

    if (evaluate)
      source += "';\n" + evaluate + "\n__p+='";

    index = offset + match.length;
    return match;
  });

  source += "';\n";
  //source = 'with(obj||{}){\n' + source + '}\n';
  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
  //console.log(source);
  try {
    //console.log(source);
    render = new Function('modules', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  if (data)
    return render(data);

  template = function(data) {
    return render.call(this, data);
  };

  template.source = 'function(modules){\n' + source + '}';

  return template;
};
module.exports = tmpl;