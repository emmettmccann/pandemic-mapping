const fs = require("fs");
const fetch = require("node-fetch");
const currDate = (() => {
  let d = new Date();
  return d.getMonth() + "-" + d.getDate();
})();

export async function getTree() {
  let rawdata = await fetch("https://nextstrain.org/charon/getDataset?prefix=/ncov/north-america").then((res) =>
    res.json()
  );

  let nodes = [];
  let links = [];
  let dates = [];

  // recursively extract all info from the tree
  extractNode("root", rawdata.tree);

  console.log("Generated %d genome nodes of raw format: ", nodes.length);
  console.log(nodes[1]);
  console.log("Generated %d mutation links of raw format: ", links.length);
  console.log(links[1]);
  console.log("Generated %d date links of raw format: ", dates.length);
  console.log(dates[1]);

  fs.writeFileSync("../artifacts/nodes-" + currDate + ".json", JSON.stringify(nodes));
  fs.writeFileSync("../artifacts/links-" + currDate + ".json", JSON.stringify(links));
  fs.writeFileSync("../artifacts/dates-" + currDate + ".json", JSON.stringify(dates));
}

function extractNode(parentName, node) {
  let n = {
    name: node.name,
    node_attrs: node.node_attrs,
  };
  let l = {
    parent: parentName,
    child: node.name,
    mutation: node.branch_attrs,
    attrs: node.node_attrs,
  };
  let d = {
    parent: node.name,
    attrs: node.node_attrs,
  };
  nodes.push(n);
  links.push(l);
  dates.push(d);
  if (node.children) node.children.forEach((el) => extractNode(node.name, el));
}
