const g = require("./client");

g.o()
  .then(dropCases)
  .then(() => g.addNodesFromFile("../artifacts/caseReports.json"))
  .then(() => g.addLinksFromFile("../artifacts/caseCaseLinks.json"))
  .then(() => g.addLinksFromFile("../artifacts/caseLocLinks.json"))
  .then(g.finish);

function dropCases() {
  return g.submit("g.V().hasLabel('caseReport').drop()", {});
}
