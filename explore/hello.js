const t = {
  name: "emmett",
};

console.log("saving...");

fs.writeFileSync("testobj.json", JSON.stringify(t));
