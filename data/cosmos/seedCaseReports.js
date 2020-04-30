const g = require("./client");
const currDate = require("../static/currDate");

g.o()
  .then(dropCases)
  .then(() => g.addNodesFromFile("../artifacts/caseReports-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/caseLocLinks-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/caseCaseLinks-" + currDate + ".json"))
  .then(g.finish);

function dropCases() {
  return g.submit("g.V().hasLabel('caseReport').drop()", {});
}
