const g = require("./client");
const fs = require("fs-extra");
const path = require("path");

let states = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../static/states.json")));

async function main() {
  g.open();
  await g.addStates(states);
  await g.close();
}
main();
