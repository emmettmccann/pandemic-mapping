const client = require("./client");
const fs = require("fs");
const path = require("path");

// get basic stats on the current db
client.open().then(count).then(finish);

// upload from today's nextstrain files
// client
//   .open()
//   .then(dropGeneticTree)
//   .then(() => addNodesFromFile("../artifacts/nodes-3-26.json"))
//   .then(() => addLinksFromFile("../artifacts/links-3-26.json"))
//   .then(() => addLinksFromFile("../artifacts/dates-3-26.json"))
//   .then(() => count)
//   .then(finish);

function dropGeneticTree() {
  return client.submit("g.V().hasLabel('genome').drop()", {});
}

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
  // open the node file
  let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));
  console.log("Adding %d nodes", nodes.length);

  // upload each node in the file with status updates every 50
  for (let i = 0; i < nodes.length; i++) {
    if (i % 50 == 0) console.log("%d/%d", i, nodes.length);
    await addVertex(nodes[i]);
  }
}

async function addLinksFromFile(filename) {
  // open the link file
  let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));
  console.log("Adding %d nodes", links.length);

  // upload each link in the file with status updates every 50
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
