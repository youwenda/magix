var G_COUNTER = 0;
var G_EMPTY = '';
var G_EMPTY_ARRAY = [];
var G_Slice = G_EMPTY_ARRAY.slice;
var G_COMMA = ',';
var G_NULL = null;
var G_WINDOW = window;
var G_DOCUMENT = document;
var G_DOC = $(G_DOCUMENT);
var G_HashKey = '#';
/*#if(modules.service||modules.updater){#*/
var JSONStringify = JSON.stringify;
/*#}#*/
var G_DOCBODY; //initilize at vframe_root
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
var G_SPLITER = '\x1e';
var Magix_StrObject = 'object';
var G_PROTOTYPE = 'prototype';
var G_PARAMS = 'params';
var G_PATH = 'path';
// var Magix_PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
// var Magix_PathTrimFileReg = /\/[^\/]*$/;
// var Magix_ProtocalReg = /^(?:https?:)?\/\//i;
var Magix_PathTrimParamsReg = /[#?].*$/;
var Magix_ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
var Magix_IsParam = /(?!^)=|&/;
var G_Id = function (prefix) {
    return (prefix || 'mx_') + G_COUNTER++;
};
/*#if(modules.defaultView){#*/
var MxGlobalView = G_Id();
/*#}#*/
var Magix_Cfg = {
    rootId: G_Id(),
    /*#if(modules.defaultView){#*/
    defaultView: MxGlobalView,
    /*#}#*/
    error: function (e) {
        throw e;
    }
};
var Magix_HasProp = Magix_Cfg.hasOwnProperty;

var G_GetById = function (id) {
    return typeof id == Magix_StrObject ? id : G_DOCUMENT.getElementById(id);
};
/*#if(modules.updater||modules.state){#*/
var G_IsPrimitive = function (args) {
    return !args || typeof args != Magix_StrObject;
};
var G_Set = function (newData, oldData, keys) {
    var changed = 0,
        now, old, p;
    for (p in newData) {
        now = newData[p];
        old = oldData[p];
        if (!G_IsPrimitive(now) || old != now) {
            keys[p] = 1;
            changed = 1;
        }
        oldData[p] = now;
    }
    return changed;
};
/*#}#*/
var G_NodeIn = function (a, b, r) {
    a = G_GetById(a);
    b = G_GetById(b);
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = b.contains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) { }
        }
    }
    return r;
};
var G_Mix = Object.assign || function (aim, src, p) {
    for (p in src) {
        aim[p] = src[p];
    }
    return aim;
};
/*#if(modules.style){#*/
var View_ApplyStyle = function (key, css) {
    if (css && !View_ApplyStyle[key]) {
        View_ApplyStyle[key] = 1;
        $('head').append('<style>' + css + '</style>');
    }
};
/*#}#*/

var G_ToTry = function (fns, args, context, i, r, e) {
    args = args || G_EMPTY_ARRAY;
    if (!G_IsArray(fns)) fns = [fns];
    if (!G_IsArray(args)) args = [args];
    for (i = 0; i < fns.length; i++) {
        e = fns[i];
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Magix_Cfg.error(x);
        }
    }
    return r;
};

var G_Has = function (owner, prop) {
    return owner && Magix_HasProp.call(owner, prop); //false 0 G_NULL '' undefined
};
/*#if(modules.updater){#*/
var GSet_Params = function (updater, oldParams, newParams) {
    var p, val;
    for (p in oldParams) {
        val = oldParams[p];
        newParams[p] = (val + G_EMPTY).charAt(0) == G_SPLITER ? updater.get(val) : val;
    }
};
/*#}#*/