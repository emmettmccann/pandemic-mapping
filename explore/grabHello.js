const fs = require("fs");
const path = require("path");

let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./testobj.json")));

console.log(JSON.stringify(nodes));
