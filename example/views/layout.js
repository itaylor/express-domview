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