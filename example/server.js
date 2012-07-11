console.log("test");
var _ = require("underscore");
var express = require('express');
var app = module.exports = express.createServer();
var JQBuildViewEngine = require('../JQBuildViewEngine.js');

app.configure(function(){
  console.log("Configuring app server...");
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  app.set('views', __dirname + '/views');
  app.register('.js', JQBuildViewEngine(module));
  app.set('view engine', 'js');

  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get("/", function (req, res){
  res.render("index", {title:"Index View"});
});
app.get("/code_view_strings", function (req, res){
  res.render("code_view_strings", {layout:"layout_code_view", title:"code view"});
});

app.set('view options', {
  exampleViewOpt: {test:"this was a view option"}
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);