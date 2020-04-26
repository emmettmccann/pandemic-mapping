"use strict";

const Gremlin = require("gremlin");
const config = require("./config");
const fs = require("fs");
const path = require("path");

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
  `/dbs/${config.database}/colls/${config.collection}`,
  config.primaryKey
);

const client = new Gremlin.driver.Client(config.endpoint, {
  authenticator,
  traversalsource: "g",
  rejectUnauthorized: true,
  mimeType: "application/vnd.gremlin-v2.0+json",
});

function addVertex(v) {
  let query = "g.addV(type)";
  Object.keys(v).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  query += ".property('pk', 'testpk')";
  console.log(v.id);
  return client.submit(query, v);
}

function addEdge(e) {
  let query = "g.V(parent).addE(type).to(g.V(child))";
  Object.keys(e).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  return client.submit(query, e);
}

function countVertices() {
  console.log("Running Count");
  return client.submit("g.V().count()", {}).then(function (result) {
    console.log("Result: %s\n", JSON.stringify(result));
  });
}

async function addNodesFromFile(filename) {}
async function addNodesFromFile(filename) {
  let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));
  console.log("Adding %d links", links.length);
  for (let i = 0; i < links.length; i++) {
    if (i % 50 == 0) console.log(i);
    await addEdge(links[i]);
  }
}

function finish() {
  console.log("Finished");
  client.close();
}

client
  .open()
  .then(async function () {
    let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../caseData/states.json")));
    console.log("Adding %d nodes", nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      if (i % 50 == 0) console.log(i);
      await addVertex(nodes[i]);
    }
  })
  .then(finish)
  .catch((err) => console.error("Fatal error:", err));

// client
//   .open()
//   .then(dropGraph)
//   .then(async function () {
//     console.log("Adding %d nodes", nodes.length);
//     for (let i = 0; i < nodes.length; i++) {
//       if (i % 50 == 0) console.log(i);
//       await addVertex(nodes[i]);
//     }
//   })
//   .then(async function () {
//     console.log("Adding %d links", links.length);
//     for (let i = 1; i < links.length; i++) {
//       if (i % 50 == 0) console.log(i);
//       await addMut(links[i]);
//     }
//   })
//   .then(countVertices)
//   .then((res) => {
//     client.close();
//     finish();
//   })
//   .catch((err) => console.error("Fatal error:", err));

// client
//   .open()
//   .then(dropGraph)
//   .then(addVertex1)
//   .then(countVertices)
//   .then((res) => {
//     client.close();
//     finish();
//   })
//   .catch((err) => console.error("Fatal error:", err));
