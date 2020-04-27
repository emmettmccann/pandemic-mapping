const g = require("./client");
const currDate = require("../static/currDate");

g.open()
  .then(() => g.addLinksFromFile("../artifacts/dates-" + currDate + ".json"))
  .then(linkLocation)
  .then(g.finish)
  .catch((err) => console.log(err));

function linkLocation() {
  /*
   Find all location nodes (loc)
   Find all genome nodes (gen)
   For all intersections:
      if(loc.name == gen.division) make a new link (genome->sampledIn->location)
   */
  console.log("Linking Locations...");
  return g.submit(
    "g.V().hasLabel('location').as('loc').V().hasLabel('genome').as('gen').where('loc', eq('gen')).by('name').by('division').addE('sampledIn').from('gen').to('loc')",
    {}
  );
}
