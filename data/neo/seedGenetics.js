const g = require("./client");
const fs = require("fs-extra");
const path = require("path");

let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeNodes.json")));
let mutations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeMutationLinks.json")));
let locLinks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/genomeLocLinks.json")));

async function main() {
  g.open();

  console.log("Genomes");
  await g.addGenomes(nodes);

  console.log("mutations");
  await g.addRelationships(mutations);

  console.log("locations");
  await g.addRelationships(locLinks);
  await g.close();
}
main();
