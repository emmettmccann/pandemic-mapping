const g = require("./client");

g.o()
  .then(dropMetadata)
  .then(() => g.addNodesFromFile("../static/states.json"))
  .then(g.finish);

function dropMetadata() {
  console.log("Dropping Metadata");
  return g.submit("g.V().hasLabel(within('date','location')).drop()", {});
}
