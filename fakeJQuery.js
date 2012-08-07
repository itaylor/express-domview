/*
 * A stand-in for jQuery on the server side.  Only exposes a few of the methods of jQuery.
*/
var _ = require("underscore");

var ws = [];
ws[0x0009] = true;
ws[0x000a] = true;
ws[0x000b] = true;
ws[0x000c] = true;
ws[0x000d] = true;
ws[0x0020] = true;
ws[0x0085] = true;
ws[0x00a0] = true;
ws[0x1680] = true;
ws[0x180e] = true;
ws[0x2000] = true;
ws[0x2001] = true;
ws[0x2002] = true;
ws[0x2003] = true;
ws[0x2004] = true;
ws[0x2005] = true;
ws[0x2006] = true;
ws[0x2007] = true;
ws[0x2008] = true;
ws[0x2009] = true;
ws[0x200a] = true;
ws[0x200b] = true;
ws[0x2028] = true;
ws[0x2029] = true;
ws[0x202f] = true;
ws[0x205f] = true;
ws[0x3000] = true;

var _trim = function (str){
  var len = str.length;
  if (len){
      var i = 0;
      while (ws[str.charCodeAt(--len)]);
      if (++len){
          while (ws[str.charCodeAt(i)]){ ++i; }
      }
      str = str.substring(i, len);
  }
  return str;
}

var _scriptAdder = function (){
  var that = {};
  that.idOffset = 0;
  that.scripts = [];
  that.add = function (script){
    var s = _trim(script.toString());
    if(_.isFunction(script)){
      s = "("+ s +")();\n";
    }else{
      if(s.lastIndexOf(";") != (s.length -1)){
        s+=";"
      }
    }
    that.scripts.push(s);
  };
  that.addGlobalData = function (varName, jsonData){
    that.scripts.push("window[\""+ varName + "\"] = " + JSON.stringify(jsonData));
  };
  return that;
};
var fn = {
    ensureId : function (elem){
      if(!elem.id){
        elem.id= "dynId_"+this.scriptAdder.idOffset++;
      }
      return elem.id;
    },
    attr :function (name, value){
      if(_.isString(name) && _.isString(value)){
        this.elem.setAttribute(name, value);
        return this;
      }else if (_.isString(name) && !value){
        return this.elem.getAttribute(name);
      }else if(name){
        var e = this.elem;
        _.each(name, function (val, key){
          e.setAttribute(key, val);
        });
        return this;
      }
    }, 
    data : function (objOrKey, value){
      var o = {};
      if(_.isString(objOrKey)){
        o[objOrKey] = value;
      }else{
        o = objOrKey;
      }
      var id = this.ensureId(this.elem);
      this.scriptAdder.add("$('#"+id+"').data("+JSON.stringify(o)+")");
      return this;
   },
   addClass : function (className){
     this.elem.className += " " + className;
     return this;
   },
   append : function (toAppend){
     if(_.isElement(toAppend)){
       this.elem.appendChild(toAppend);
     }else if (_.isString(toAppend)){
       this.elem.innerHTML += toAppend;
     }else if(toAppend.jquery){
       this.elem.appendChild(toAppend.get(0));
     }
     return this;
   },
   html : function (html){
     if(html === undefined){
       return this.elem.innerHTML;
     }
     if(_.isElement(html) || html.jquery){
       this.empty();
       this.append(html);
     }else if(_.isString(html)){
       this.elem.innerHTML = html;
     }
     return this;
   },
   empty : function (){
     this.elem.innerHTML = "";
     return this;
   },
   removeAttr : function (name){
     this.elem.removeAttribute(name);
     return this;
   },
   jquery : "fakejQuery",
   get : function (){
     return this.elem;
   },
   each : function(callback){
     [].forEach(function(el, idx){ callback.call(el, idx, el); });
     return this;
   }  
};
fn.bind = fn.on = function (evt, handler){
    var elem = this.elem;
    _.each(evt.split(" "), function (e){
      var id = this.ensureId(elem);
      this.scriptAdder.add("$('#"+ id +"').bind('"+evt+"',"+ handler.toString()+");");
    }.bind(this));
    return this;
};
_.each(["blur", "change", "click", "dblclick", "focus", "focusin", "focusout", "keydown", "keypress", "keyup", "load",
        "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "resize", "scroll", "select", "submit", "unload"], function (evt){
  fn[evt] = function (handler){
    return this.on(evt, handler);
  };
});


module.exports = function (){
  var scriptAdder =  _scriptAdder();
  var fakejQuery = function (elem){
    this.scriptAdder = scriptAdder;
    if(_.isFunction(elem)){
      this.scriptAdder.add("$("+elem.toString()+");");
    }else{
      this.elem = elem;
    }
  };
  
  fakejQuery.prototype = fn;

  var $ = function (elem){
    return new fakejQuery(elem);
  };
  
  var likeArray = function(obj) { return typeof obj.length == 'number';};
  $.isArray = _.isArray;
  $.trim = _trim;
  $.each = function(elements, callback) {
    var i, key;
    if (likeArray(elements))
      for(i = 0; i < elements.length; i++) {
        if(callback(i, elements[i]) === false) return elements;
      }
    else
      for(key in elements) {
        if(callback(key, elements[key]) === false) return elements;
      }
    return elements;
  };
  $.scriptAdder = scriptAdder;
  return $;
};  
