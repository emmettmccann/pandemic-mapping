const g = require("./client");

g.open()
  .then(dropMetadata)
  .then(() => g.addNodesFromFile("../artifacts/static/dateList.json"))
  .then(linkDays)
  .then(() => g.addNodesFromFile("../artifacts/static/states.json"))
  .then(g.finish);

function dropMetadata() {
  console.log("Dropping Metadata");
  return g.submit("g.V().hasLabel(within('date','location')).drop()", {});
}

function linkDays() {
  console.log("Linking days");
  return g.submit(
    "g.V().hasLabel('date').as('a').V().hasLabel('date').as('b').where('a',eq('b')).by('id').by('prevDay').addE('nextDay').from('a').to('b')",
    {}
  );
}
