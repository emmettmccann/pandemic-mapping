const g = require("./client");
const currDate = require("../static/currDate");

// get basic stats on the current db
// g.o().then(g.count).then(g.close);

// upload from today's nextstrain files
g.o()
  .then(dropGeneticTree)
  .then(() => g.addNodesFromFile("../artifacts/nodes-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/genomeLinks-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/locLinks-" + currDate + ".json"))
  .then(g.count)
  .then(g.finish);

function dropGeneticTree() {
  return g.submit("g.V().hasLabel('genome').drop()", {});
}
