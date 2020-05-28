const neo4j = require("neo4j-driver");
const fs = require("fs-extra");
const path = require("path");
const cliProgress = require("cli-progress");
const _colors = require("colors");

// const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "pass"));

const b1 = new cliProgress.SingleBar(
  {
    format:
      _colors.green("{bar}") + "| {percentage}% | ETA: {eta_formatted} | Time: {duration_formatted} | {value}/{total}",
  },
  cliProgress.Presets.shades_classic
);

var client = {
  driver: driver,
};

client.open = function () {
  this.session = this.driver.session();
  console.log("Opened");
};

client.addVertex = function (v) {
  console.log("Adding");
  return this.session.run("CREATE (n:Genome $props) RETURN n", { props: v });
};

client.addGenomes = function (nodes) {
  return this.session.run("UNWIND $props AS map CREATE (n:genome) SET n = map", { props: nodes });
};

client.addLocations = function (locations) {
  return this.session.run("UNWIND $props AS map CREATE (n:location) SET n = map", { props: locations });
};

client.addCaseReports = function (reports) {
  return this.session.run("UNWIND $props AS map CREATE (n:report) SET n = map", { props: reports });
};

client.addRelationships = async function (rels) {
  b1.start(rels.length, 0, {
    speed: "N/A",
  });

  for (let i = 0; i < rels.length; i++) {
    b1.update(i + 1);
    const rel = rels[i];
    await this.session.run(
      "MATCH (a),(b) WHERE a.id = $parent AND b.id = $child CREATE (a)-[r:" +
        rel.label +
        " $props]->(b) RETURN type(r), r.name",
      {
        parent: rel.parent,
        child: rel.child,
        props: rel,
      }
    );
  }
  b1.stop();
};

client.close = async function () {
  console.log("Finished");
  await this.session.close();
  await this.driver.close();
  console.log("Closed");
};

module.exports = client;
