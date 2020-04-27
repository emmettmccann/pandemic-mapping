const g = require("./client");
const currDate = require("../static/currDate");

g.open()
  .then(dropCases)
  .then(() => g.addNodesFromFile("../artifacts/caseReports-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/caseLocLinks-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/caseDateLinks-" + currDate + ".json"))
  .then(() => g.addLinksFromFile("../artifacts/caseCaseLinks-" + currDate + ".json"))
  .then(g.finish);

function dropCases() {
  return g.submit("g.V().hasLabel('caseReport').drop()", {});
}

// function linkReports() {
//   console.log("Linking reports (day to day)");
//   return g.submit(
//     "g.V().hasLabel('caseReport').as('a').V().hasLabel('caseReport').as('b').where('a',eq('b')).by('id').by('prevReport').addE('nextReport').from('a').to('b')",
//     {}
//   );
// }
