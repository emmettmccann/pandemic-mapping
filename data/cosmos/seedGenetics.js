const g = require("./client");

// get basic stats on the current db
// g.o().then(g.count).then(g.close);

// upload from today's nextstrain files
g.o()
  .then(dropGeneticTree)
  .then(() => g.addNodesFromFile("../artifacts/genomeNodes.json"))
  .then(() => g.addLinksFromFile("../artifacts/genomeMutationLinks.json"))
  .then(() => g.addLinksFromFile("../artifacts/genomeLocLinks.json"))
  .then(g.count)
  .then(g.finish)
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
function dropGeneticTree() {
  return g.submit("g.V().hasLabel('genome').drop()", {});
}
