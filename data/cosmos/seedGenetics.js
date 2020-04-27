const g = require("./client");
const fs = require("fs");
const path = require("path");
const currDate = require("../static/currDate");

// get basic stats on the current db
g.open().then(g.count).then(g.close);

// upload from today's nextstrain files
// g.open()
//   .then(dropGeneticTree)
//   .then(() => g.addNodesFromFile("../artifacts/nodes-" + currDate + ".json"))
//   .then(() => g.addLinksFromFile("../artifacts/links-" + currDate + ".json"))
//   .then(() => g.addLinksFromFile("../artifacts/dates-" + currDate + ".json"))
//   .then(g.count)
//   .then(finish);

function dropGeneticTree() {
  return g.submit("g.V().hasLabel('genome').drop()", {});
}
