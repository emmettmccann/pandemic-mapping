const g = require("./client");
const fs = require("fs-extra");
const path = require("path");

let reports = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/caseReports.json")));
let locLinks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../artifacts/caseLocLinks.json")));

async function main() {
  g.open();
  await g.addCaseReports(reports);
  await g.addRelationships(locLinks);
  await g.close();
}
main();
