var _ = require("underscore");
var Document = require("dom-lite").Document;
var vm = require('vm');
var CodeViewEngine = require("./CodeViewEngine.js");
var jqBuild = require("jquery.build");
var fakeJQuery = require("./fakeJQuery.js");

/*
* Extends CodeViewEngine to provide support for using jquery.build plugin as a 
* way to render views on the server side
*/
var JQBuildViewEngine = function (ownerModule){
  var that = CodeViewEngine(ownerModule);
  
  that.superCreateContext = that.createContext;
  
  that.firstClientScript = null;
  
  /**
  * Adds to the context a jQueryish object in $, $.build with an alias of $b
  * A Document object in document.  An addClientScript function that adds a new script body
  * to be run on the client, and a clientScripts property that returns the results of all the addClientScript
  * calls as a single script node with their contents.
  */
  that.createContext = function (opts){
    var context = that.superCreateContext(opts);
    var document = context.document = new Document();
    var $ = context.$ = fakeJQuery();
    context.addClientScript = $.scriptAdder.add;
    if(that.firstClientScript){
      context.addClientScript(that.firstClientScript);
    }
    context.$b = jqBuild($, document);
    context.__defineGetter__("clientScripts", function() {
      var elem = context.document.createElement("script");
      elem.text = $.scriptAdder.scripts.join("\n");
      return elem;  
    });
    return context;
  }
  return that;
};

module.exports = JQBuildViewEngine;