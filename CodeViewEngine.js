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
   var ctx = vm.createContext();
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
  }
  
  that.compile = function (str, opts){
    try{
      var script = vm.createScript(str, null, opts.filename, true);
    }catch(e){
      e.message = "Syntax error compiling code view: '" + opts.filename + "'. see error log for details;";
      throw e;
    }
    opts.docType = opts.docType || "<!DOCTYPE html>\n";
    return function (locals){
      var context = locals._context || that.createContext(opts);
      _.defaults(context, locals);
      locals._context = context;
      var cleanContext = false;
      if(opts.isLayout || (!locals.layout)){
        context.render = that.generateRenderFinal(opts);
        cleanContext = true;
      }else{
        context.render = that.generateRenderIntermediate(opts);
      }
      var result;
      try{
        var result = script.runInContext(context);
      }catch(e){
        e.message = "Error rendering '" +opts.filename + "' \n"+  e.message;
        throw(e);
      }
      if(!result && that.warnings){
       console.warn("view evaluation returned null or empty result on code view" +opts.filename +", this is usually a bug.");
      }
      if(cleanContext){
        //break circular references to help GC.
        locals._context = null;
        context.locals = null;
        context = null;
      }
      return result;    
    };
  }  
  return that;
};

module.exports = CodeViewEngine;