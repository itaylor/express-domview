var _ = require("underscore");

console.log("This is the title", title);

addClientScript(function (){
  console.log("hello");
});

var elem = $b(".sweet", [
  $b("a", title).click(function (){
    alert("Clicked");
  }), 
  _.map(["test a", "test b"], function(item){
    return $b(".test", item);
  })
]);

render(elem);
