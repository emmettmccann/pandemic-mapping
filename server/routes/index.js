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
router.get("/locations", function (req, res, next) {
  let session = db.getSession(req);
  session.run("MATCH (location:location) RETURN location").then((result) => {
    db.closeSession(req);
    const response = result.records.map((record) => {
      return record.get("location");
    });
    res.json(response);
  });
});

router.get("/probables", function (req, res, next) {
  let prob = parseFloat(req.query.prob);
  if (isNaN(prob)) prob = 0.4; // do it this way to allow prob to be 0

  let states = req.query.states.toString() || "";
  let maxDate = req.query.maxDate.toString() || "";
  let minDate = req.query.minDate.toString() || "";

  let parents = req.query.parents;
  let children = req.query.children;

  let q = "";
  if (states.length > 0) q += " WITH [" + states + "] as states ";
  q += " MATCH (loc:state)<-[samp:SAMPLED_IN]-(n:genome)-[r:PROBABLE_SOURCE]->(parent:state) where r.avg > " + prob;
  q += " and loc.id <> parent.id ";
  if (maxDate.length > 0) q += "and n.date_formatted < " + maxDate + " ";
  if (minDate.length > 0) q += "and n.date_formatted > " + minDate + " ";
  if (states.length > 0) {
    if (parents && children) q += " and ( loc.id in states or parent.id in states ) ";
    else if (parents) q += " and ( loc.id in states) ";
    else if (children) q += " and ( parent.id in states) ";
  }
  q +=
    " with loc as loc, parent as parent, n.date_formatted as date, r.avg as prob CALL apoc.create.vRelationship(parent,'SEEDED',{date:date,prob:prob},loc) yield rel as seed return loc,parent,seed order by loc.id ";

  console.log(q);

  let session = db.getSession(req);
  // let q = "WITH ['WA','NY'] as states MATCH (loc:state)<-[samp:SAMPLED_IN]-(n:genome)-[r:PROBABLE_SOURCE]->(parent:state) where r.avg > $prob and loc.id <> parent.id and loc.id in states with loc as loc, parent as parent, n.date_formatted as date, r.avg as prob CALL apoc.create.vRelationship(parent,'SEEDED',{date:date,prob:prob},loc) yield rel as seed return loc,parent,seed order by loc.id";
  session.run(q).then((result) => {
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

router.get("/probables/agg", function (req, res, next) {
  let prob = parseFloat(req.query.prob);
  if (isNaN(prob)) prob = 0.4; // do it this way to allow prob to be 0

  let states = req.query.states.toString() || "";
  let maxDate = req.query.maxDate.toString() || "";
  let minDate = req.query.minDate.toString() || "";

  let parents = req.query.parents;
  let children = req.query.children;

  let q = "";
  if (states.length > 0) q += " WITH [" + states + "] as states ";
  q += " MATCH (loc:state)<-[samp:SAMPLED_IN]-(n:genome)-[r:PROBABLE_SOURCE]->(parent:state) where r.avg > " + prob;
  q += " and loc.id <> parent.id ";
  if (maxDate.length > 0) q += "and n.date_formatted < " + maxDate + " ";
  if (minDate.length > 0) q += "and n.date_formatted > " + minDate + " ";
  if (states.length > 0) {
    if (parents && children) q += " and ( loc.id in states or parent.id in states ) ";
    else if (parents) q += " and ( loc.id in states) ";
    else if (children) q += " and ( parent.id in states) ";
  }
  q +=
    " with loc as loc, parent as parent, collect(n.date_formatted) as date, avg(r.avg) as prob CALL apoc.create.vRelationship(parent,'SEEDED',{date:date,prob:prob},loc) yield rel as seed return loc,parent,seed order by loc.id ";

  console.log(q);

  let session = db.getSession(req);
  // let q = "WITH ['WA','NY'] as states MATCH (loc:state)<-[samp:SAMPLED_IN]-(n:genome)-[r:PROBABLE_SOURCE]->(parent:state) where r.avg > $prob and loc.id <> parent.id and loc.id in states with loc as loc, parent as parent, n.date_formatted as date, r.avg as prob CALL apoc.create.vRelationship(parent,'SEEDED',{date:date,prob:prob},loc) yield rel as seed return loc,parent,seed order by loc.id";
  session.run(q).then((result) => {
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

router.get("/transmissions", function (req, res, next) {
  let q =
    "MATCH (parent:location)-[transmission:TRANSMISSION]->(child:location) where transmission.confidence > 0.97 return parent,transmission,child order by transmission.date";
  let session = db.getSession(req);
  session.run(q).then((result) => {
    db.closeSession(req);
    const response = result.records.map((record) => {
      return {
        parent: record.get("parent").properties,
        child: record.get("child").properties,
        data: record.get("transmission").properties,
      };
    });
    res.json(response);
  });
});

module.exports = router;
