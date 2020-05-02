const gremlin = require("gremlin");
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

dc = new DriverRemoteConnection("wss://covid19.cgfw4tm7ipq1.us-east-2.neptune.amazonaws.com:8182/gremlin", {});

console.log(dc);

const graph = new Graph();
const g = graph.traversal().withRemote(dc);

console.log(g);

g.addV("Person")
  //   .property(id, "v1")
  .next()
  .then((data) => {
    console.log(data);
    dc.close();
  })
  .catch((error) => {
    console.log("ERROR", error);
    dc.close();
  });

//   curl https://covid19.cgfw4tm7ipq1.us-east-2.neptune.amazonaws.com:8182/gremlin/status
