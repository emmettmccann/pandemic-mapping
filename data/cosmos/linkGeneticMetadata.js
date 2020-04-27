const g = require("./client");

g.open().then(linkLocation).then(linkDate).then(g.finish);

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

function linkDate() {
  /*
   Find all date nodes (date)
   Find all genome nodes (gen)
   For all intersections:
      if(date.id == b.date_formatted) make a new link (genome->sampledOn->date)
   */
  console.log("Linking Dates...");
  return g.submit(
    "g.V().hasLabel('date').as('date').V().hasLabel('genome').as('gen').where('date', eq('gen')).by('id').by('date_formatted').addE('sampledOn').from('gen').to('date')",
    {}
  );
}
