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

let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../nodes.json")));
let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../links.json")));

function dropGraph() {
  console.log("Running Drop");
  return client.submit("g.V().drop()", {}).then(function (result) {
    console.log("Result: %s\n", JSON.stringify(result));
  });
}

function addVertex1() {
  console.log("Running Add Vertex1");
  return client
    .submit(
      "g.addV(label).property('id', id).property('firstName', firstName).property('age', age).property('userid', userid).property('pk', 'pk')",
      {
        label: "person",
        id: "thomas",
        firstName: "Thomas",
        age: 44,
        userid: 1,
      }
    )
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result));
    });
}

function addVertex(v) {
  let query = "g.addV(type)";
  Object.keys(v).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  query += ".property('pk', 'testpk')";
  return client.submit(query, v);
}

function addMut(e) {
  let query = "g.V(parent).addE(type).to(g.V(child))";
  Object.keys(e).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  return client.submit(query, e);
}

function addVertex2() {
  console.log("Running Add Vertex2");
  return client
    .submit(
      "g.addV(label).property('id', id).property('firstName', firstName).property('lastName', lastName).property('age', age).property('userid', userid).property('pk', 'pk')",
      {
        label: "person",
        id: "mary",
        firstName: "Mary",
        lastName: "Andersen",
        age: 39,
        userid: 2,
      }
    )
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result));
    });
}

function addEdge() {
  console.log("Running Add Edge");
  return client
    .submit("g.V(source).addE(relationship).to(g.V(target))", {
      source: "thomas",
      relationship: "knows",
      target: "mary",
    })
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result));
    });
}

function countVertices() {
  console.log("Running Count");
  return client.submit("g.V().count()", {}).then(function (result) {
    console.log("Result: %s\n", JSON.stringify(result));
  });
}

function finish() {
  console.log("Finished");
  console.log("Press any key to exit");

  process.stdin.resume();
  process.stdin.on("data", process.exit.bind(process, 0));
}

client
  .open()
  .then(dropGraph)
  .then(async function () {
    console.log("Adding %d nodes", nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      if (i % 50 == 0) console.log(i);
      await addVertex(nodes[i]);
    }
  })
  .then(async function () {
    console.log("Adding %d links", links.length);
    for (let i = 1; i < links.length; i++) {
      if (i % 50 == 0) console.log(i);
      await addMut(links[i]);
    }
  })
  .then(countVertices)
  .then((res) => {
    client.close();
    finish();
  })
  .catch((err) => console.error("Fatal error:", err));

// client
//   .open()
//   .then(async function () {
//     console.log("Adding %d links", links.length);
//     for (let i = 1; i < links.length; i++) {
//       if (i % 100 == 0) console.log(i);
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
