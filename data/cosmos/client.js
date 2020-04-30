const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const Gremlin = require("gremlin");
const fs = require("fs");
const cliProgress = require("cli-progress");
const _colors = require("colors");

const config = {
  endpoint: "wss://wpi-iqp-covid19.gremlin.cosmos.azure.com:443/",
  primaryKey: "XcLrd2y1v8NNoM6vdJjTh55wjWdFgv8dJSO6fJpAllnZ7oCXyAKb7nLO5nsCb7lbTb9lba1zU2th0hmQD5BiNw==",
  database: "covidia",
  collection: process.env.GRAPH_NAME,
};

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

client.o = async function () {
  console.log("Connecting to %s", process.env.GRAPH_NAME);
  if (process.env.CONFIRM == "true") {
    console.log("Press ^C to cancel or any other key to continue");
    await (async () => {
      process.stdin.setRawMode(true);
      return new Promise((resolve) =>
        process.stdin.once("data", (data) => {
          const byteArray = [...data];
          if (byteArray.length > 0 && byteArray[0] === 3) {
            console.log("^C");
            process.exit(1);
          }
          process.stdin.setRawMode(false);
          resolve();
        })
      );
    })();
  }
  return client.open();
};

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
  let query = "g.addV(label)";
  Object.keys(v).forEach((k) => {
    query += ".property('" + k + "', " + k + ")";
  });
  query += ".property('pk', '" + (pk || "testpk").toString() + "')";
  return client.submit(query, v);
};

client.addEdge = function (e) {
  let query = "g.V(parent).addE(label).to(g.V(child))";
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
    await client.addVertex(nodes[i]);
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

client.finish = async function () {
  console.log("Finished");

  client.close();
  console.log("Closing");
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
  console.log("Closed");
  process.exit(1);
};

// simple function for queries in Node REPL
client.q = function (q) {
  client.submit(q, {}).then(function (result) {
    console.log(JSON.stringify(result._items));
  });
  return "Running query";
};

module.exports = client;
