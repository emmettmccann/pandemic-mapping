var express = require("express");
var router = express.Router();
var db = require("../db/neo.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  let session = db.getSession(req);
  session.run("MATCH (n) RETURN n limit 1").then((response) => {
    res.send(response);
  });
  // res.render('index', { title: 'Express' });
});

module.exports = router;
