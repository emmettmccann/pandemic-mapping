const config = {
  endpoint: "wss://wpi-iqp-covid19.gremlin.cosmos.azure.com:443/",
  primaryKey: "XcLrd2y1v8NNoM6vdJjTh55wjWdFgv8dJSO6fJpAllnZ7oCXyAKb7nLO5nsCb7lbTb9lba1zU2th0hmQD5BiNw==",
  database: "covidia",
  collection: "ncov",
};

const Gremlin = require("gremlin");
const fs = require("fs");
const path = require("path");

const cliProgress = require("cli-progress");
const _colors = require("colors");
const b1 = new cliProgress.SingleBar(
  {
    format:
      _colors.green("{bar}") + "| {percentage}% | ETA: {eta_formatted} | Time: {duration_formatted} | {value}/{total}",
  },
  cliProgress.Presets.shades_classic
);

const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
  `/dbs/${config.database}/colls/${config.collection}`,
  config.primaryKey
);

var client = new Gremlin.driver.Client(config.endpoint, {
  authenticator,
  traversalsource: "g",
  rejectUnauthorized: true,
  mimeType: "application/vnd.gremlin-v2.0+json",
});

client.count = async function () {
  return client
    .submit("g.E().count().store('Edges').V().count().store('Nodes').select('Nodes','Edges')", {})
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result._items));
    });
};

client.getShape = async function () {
  return client
    .submit(
      "g.E().groupCount().by('label').store('Edges').V().groupCount().by('label').store('Nodes').select('Nodes','Edges')",
      {}
    )
    .then(function (result) {
      console.log("Result: %s\n", JSON.stringify(result._items));
    });
};

client.addVertex = function (v, pk) {
  let query = "g.addV(type)";
  Object.keys(v).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  query += ".property('pk', '" + (toString(pk) || "testpk") + "')";
  return client.submit(query, v);
};

client.addEdge = function (e) {
  let query = "g.V(parent).addE(type).to(g.V(child))";
  Object.keys(e).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  return client.submit(query, e);
};

client.addNodesFromFile = async function (filename) {
  // open the node file
  let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));

  // start progress information
  console.log("Adding %d nodes from " + filename, nodes.length);
  b1.start(nodes.length, 0, {
    speed: "N/A",
  });

  // upload each node in the file
  for (let i = 0; i < nodes.length; i++) {
    b1.update(i + 1);
    await client.addVertex(nodes[i], str(i % 10));
  }

  b1.stop();
};

client.addLinksFromFile = async function (filename) {
  // open the link file
  let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, filename)));

  // start progress information
  console.log("Adding %d links  from " + filename, links.length);
  b1.start(links.length, 0, {
    speed: "N/A",
  });

  // upload each link in the file with status updates every 50
  for (let i = 0; i < links.length; i++) {
    b1.update(i + 1);
    await client.addEdge(links[i]);
  }

  b1.stop();
};

client.finish = function () {
  console.log("Finished");
  client.close();
};

// simple function for queries in Node REPL
client.q = function (q) {
  client.submit(q, {}).then(function (result) {
    console.log(JSON.stringify(result._items));
  });
  return "Running query";
};

module.exports = client;
