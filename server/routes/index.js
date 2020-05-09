var express = require("express");
var router = express.Router();
var db = require("../db/neo.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  let session = db.getSession(req);
  session.run("MATCH (n) RETURN n limit 1").then((response) => {
    db.closeSession(req);
    const singleRecord = response.records[0];
    const node = singleRecord.get(0);
    res.json(node);
  });
});

/* GET home page. */
router.get("/states", function (req, res, next) {
  let session = db.getSession(req);
  session.run("MATCH (state:state) RETURN state").then((result) => {
    db.closeSession(req);
    const response = result.records.map((record) => {
      return record.get("state");
    });
    res.json(response);
  });
});

router.get("/probables", function (req, res, next) {
  let prob = parseFloat(req.query.prob);
  if (isNaN(prob)) prob = 0.4; // do it this way to allow prob to be 0

  let session = db.getSession(req);
  const q =
    "WITH ['WA','NY'] as states MATCH (loc:state)<-[samp:SAMPLED_IN]-(n:genome)-[r:PROBABLE_SOURCE]->(parent:state) where r.avg > $prob and loc.id <> parent.id and loc.id in states with loc as loc, parent as parent, n.date_formatted as date, r.avg as prob CALL apoc.create.vRelationship(parent,'SEEDED',{date:date,prob:prob},loc) yield rel as seed return loc,parent,seed order by loc.id";
  session.run(q, { prob: prob }).then((result) => {
    db.closeSession(req);
    const response = result.records.map((record) => {
      return {
        parent: record.get("parent").properties,
        child: record.get("loc").properties,
        data: record.get("seed").properties,
      };
    });
    res.json(response);
  });
});

module.exports = router;
