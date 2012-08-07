var _ = require("underscore");
var vm = require('vm');
var path = require("path");

var CodeViewEngine = function (ownerModule){
  var that = {};
  that.warnings = true;
  that.generateRenderFinal = function (opts){
    return function (htmlOrNode){
      var html;
      if(htmlOrNode.jquery){
        html = htmlOrNode.get(0).outerHTML;
      }else if(htmlOrNode.outerHTML){
        html = htmlOrNode.outerHTML;
      }else{
        html = htmlOrNode.toString();
      }
      return (opts.docType || "<!doctype html>") + "\n" + html; 
    };
  };
  
  var _intermediateRenderFn;
  that.generateRenderIntermediate = function (opts){
    return _intermediateRenderFn || (intermediateRenderFn = function (htmlOrNode){return htmlOrNode;});
  };
  
  
  that.createContext = function (opts){
   var ctx = {};
   ctx.console = console;
   ctx.require = ownerModule.require.bind(ownerModule);
   ctx.setTimeout= setTimeout;
   ctx.setInterval = setInterval;
   ctx.clearTimeout = clearTimeout;
   ctx.clearInterval = clearInterval;
   ctx.__filename = opts.filename;
   ctx.__dirname = path.dirname(opts.filename);
   ctx.locals = ctx;
   return ctx;
  };
  that.destroyContext = function (context){
    context.locals = null;
    console.log("destroying context");
  };
  
  that.compile = function (str, opts){
    opts.docType = opts.docType || "<!DOCTYPE html>\n";
    var isLayout = opts.isLayout;
    var filename = opts.filename;
    var script;
    try{
      script = vm.createScript(str, filename, true);
    }catch(e){
      throw new Error("error creating script " + filename, e);
    }
    return function (locals){
      var context = locals._context || that.createContext(opts);
      _.defaults(context, locals);
      locals._context = context;
      var cleanContext = false;
      if(isLayout || (!locals.layout)){
        context.render = that.generateRenderFinal(opts);
        cleanContext = true;
      }else{
        context.render = that.generateRenderIntermediate(opts);
      }
      var result;
      try{
        result = script.runInNewContext(context);
      }catch(e){
        console.error("Error rendering '" + filename + "' \n", e);
        throw e;
      }
      if(!result && that.warnings){
       console.warn("view evaluation returned null or empty result on code view" + filename +", this is usually a bug.");
      }
      if(cleanContext){
        //break circular references to help GC.
        locals._context = null;
        that.destroyContext(context);
        context = null;
      }
      return result;    
    };
  }  
  return that;
};

module.exports = CodeViewEngine;