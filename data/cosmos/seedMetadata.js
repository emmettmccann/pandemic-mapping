const g = require("./client");

g.open()
  .then(dropMetadata)
  .then(() => g.addNodesFromFile("../artifacts/static/dateList.json"))
  .then(() => g.addNodesFromFile("../artifacts/static/states.json"))
  .then(g.count)
  .then(g.finish);

function dropMetadata() {
  return g.submit("g.V().hasLabel(within('date','location')).drop()", {});
}
