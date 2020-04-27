const fs = require("fs");
const path = require("path");

const t = {
  name: "emmett",
};

console.log("saving...");

fs.writeFileSync("testobj.json", JSON.stringify(t));
