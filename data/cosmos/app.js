const client = require("./client");
const fs = require("fs");
const path = require("path");

function addVertex(v) {
  let query = "g.addV(type)";
  Object.keys(v).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  query += ".property('pk', 'testpk')";
  return client.submit(query, v);
}

function addEdge(e) {
  let query = "g.V(parent).addE(type).to(g.V(child))";
  Object.keys(e).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  return client.submit(query, e);
}

async function addNodesFromFile(filename) {
  let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));
  console.log("Adding %d nodes", nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    if (i % 50 == 0) console.log("%d/%d", i, nodes.length);
    await addVertex(nodes[i]);
  }
}

async function addLinksFromFile(filename) {
  let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));
  console.log("Adding %d nodes", links.length);
  for (let i = 0; i < links.length; i++) {
    if (i % 50 == 0) console.log("%d/%d", i, links.length);
    await addEdge(links[i]);
  }
}

function count() {
  return client
    .submit("g.E().count().store('Edges').V().count().store('Nodes').select('Nodes','Edges')", {})
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result._items));
    });
}
function finish() {
  console.log("Finished");
  client.close();
}

client.open().then(count).then(finish);

// client
//   .open()
//   .then(() => addNodesFromFile("../artifacts/nodes-3-26.json"))
//   .then(() => addLinksFromFile("../artifacts/links-3-26.json"))
//   .then(() => addLinksFromFile("../artifacts/dates-3-26.json"))
//   .then(() => countVertices)
//   .then(finish);
