                                                                __                          __                  
    .-----..--.--..-----..----..-----..-----..-----. ______ .--|  |.-----..--------..--.--.|__|.-----..--.--.--.
    |  -__||_   _||  _  ||   _||  -__||__ --||__ --||______||  _  ||  _  ||        ||  |  ||  ||  -__||  |  |  |
    |_____||__.__||   __||__|  |_____||_____||_____|        |_____||_____||__|__|__| \___/ |__||_____||________|
                  |__|                                                                                          
                                                                                      express-domview    v_0.0.1
    ------------------------------------------------------------------------------------------------------------                                                                                            
                                                                                                             
A view engine for express that allows you to write your views as standard JavaScript files that build DOM nodes.

###Design Goals:
* Make it possible to use a DOM builder and JavaScript to emit HTML from the server side.
* Make it possible to create libraries of commonly used rendering functions that can be used client or server side.
* Make it possible to bind events to DOM nodes from the server side and have them be handled on the client side.
* Keep boilerplate JavaScript in the "views" to the absolute minimum.
* Allow for the use of a real debugger, and standard JS tools in view code. (I may not quite have achieved this yet)
* Simple and approachable codebase.

###WTF?  This is the stupidest idea I've ever heard!  Why would you want to write views in JavaScript and not a templating language designed specifically for rendering HTML?
* Well, I don't like templating languages.
  * They require you to learn a new syntax and language.
  * They often times end up a mix of with complex code interspersed in templating constructs that makes them hard to read and understand.
  * They rarely, if ever, are debuggable by any method other than "print and see" debugging. 
* The problem that templating languages seek to solve is that it is difficult to create properly formatted HTML
from traditional programming language syntax.  I think that problem is adequately addressed by using a good DOM
builder library, so a templating language is not necessary.
* If you're unconvinced and still think this a stupid idea, use Jade. it's a very nice templating 
language/view engine that will probably make you very happy.

###Ok, well then why do you need a view engine at all?  Why not just emit the HTML with response.send and build the HTML in your routing methods? 
* Although I prefer to create views with JS code, the MVC paradigm still makes sense.  Separating business
logic from display logic simplifies life.
* Also, the view engine gives me a chance to eliminate boilerplate of setup and teardown of the DOM as well.

###No tests?  You suck!
* Yeah, I know, I'm working on them, honest.  I extracted this code from a larger, more ambitious project 
(that I'll probably never finish) and I had tests for many parts of it, but the tests weren't written in
such a way that they isolated this part independently.  I'll work on rewriting them.
* I'll also improve and add more examples in the examples folder.

###I want something added/fixed/changed
* Patches are welcome, and will likely be accepted so long as they don't violate the design goals

###Usage:
In your server.js or equivalent:
```
//Set your view folder
app.set('views', __dirname + '/views');
//Init the JQBuildViewEngine 
app.register('.js', require('express-domview').JQBuildViewEngine(module));

app.get("/", function (req, res){
  res.render("index", {title:"Index View", someVariable:"blah"});
});
```

In your views/index.js
```
var elem = $b(".sweet", [
  $b("a.someClass", someVariable).click(function (){
    alert("Clicked");
  }), 
]);
render(elem);
```

In your views folder as layout.js
```
var elem = $b("html", [
  $b("head",[
    $b("script", {src:"//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"}),
    $b("title", title)
  ]),
  $b("body", [
    body,
    clientScripts
  ])
]);
render(elem); 
```
output html:
```
<!DOCTYPE html>

<html>
  <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <title>Index View</title>
  </head>
  <body>
    <div class="sweet">
      <a class='someClass' id="dynId_0">blah</a>
    </div>
    <script>      
      $('#dynId_0').bind('click',function (){
          alert("Clicked");
        });
    </script>
  </body>
</html>
```

###View Scripts

View scripts are run inside of node.js, and have access to require, but are not modules themselves and are executed inside of their
own vm context.

Inside of your view script files, the following variables are defined in the context scope:
###render function(String | DOM Node | jQuery(ish) object) 
This is how you communicate back to the view engine that your view script is done.  You can call it only once, and you must call it 
before the end of the view script. You can pass it a HTML String, a DOM node, or 

###body (String | DOM Node | jQuery(ish) object)
If you are using a layout.js, it will be passed the result of render call from the body script in this variable.

###clientScripts (String)
Holds the contents of script blocks that should be written to the DOM for the client side to execute.
You'll usually want to put this in your layout.js, at the bottom of the body tag.

###addClientScript function (String | function)
Adds a client script to the list of client scripts.  You can pass it either a string or a function, if you pass it a function the function will be 
have `.toString()` called on it, which means it will NOT retain any closure scope (which makes sense when you realize that it will be called on the client). 

###require
Exposes the node.js `require` function from the parent context.  You can require anything you want and file paths will be relative to
the place that you created the JQBuildViewEngine in your server.js or equivalent.

###__dirname 
Current dir name of the view js file

###__filename
Filename of the view js file

###console
Exposes the node.js console object with all of its normal functions

###document
Exposes a DOM document node object that you can use to do document.createElement, etc.
Relies on dom-lite for this object, so it's not a "real" document node, just a thin shell

###$
Exposes a jQueryish object with support for some of the functions of jQuery.  It can add attributes with .attr, set data with .data, bind DOM events
with .click, .bind, .mouseover, etc...  It's far from a full implementation of jQuery, but still pretty useful for creating DOM nodes and wiring things to them 
after they've been created.  The implementation of this will probably grow and improve over time, and I might turn it into a stand alone project.

###$b
Exposes the jquery.build DOM builder, which you can read about in [the jquery.build documentation](http://github.com/itaylor/jquery.build)

###locals
A reference to the context variable in the current scope of the running view script.  Similar to how `window` is a reference to the current scope in the browser
 
###Additionally, all of the properties that you put in to the call to express's render function will also be in the current scope.
so if I call `res.render("index", {foo:"bar"})` inside of `index.js`, the value of the variable `foo` will be `"bar"`.  
Note: If you're wanting to test if a variable is defined, you can use either `this.foo` or `locals.foo`.

###License:
Copyright (c) 2012 Ian Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.