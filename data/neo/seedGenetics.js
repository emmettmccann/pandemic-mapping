const g = require("./client");
const fs = require("fs-extra");
const path = require("path");

let locations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/locationNodes.json")));
let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeNodes.json")));
let mutations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeMutationLinks.json")));
let locLinks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeLocLinks.json")));

async function main() {
  g.open();

  console.log("Locations");
  await g.addLocations(locations);

  console.log("Genomes");
  await g.addGenomes(nodes);

  console.log("Mutation Links");
  await g.addRelationships(mutations);

  console.log("Location Links");
  await g.addRelationships(locLinks);
  await g.close();
}
main();
