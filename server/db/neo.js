var neo4j = require("neo4j-driver");

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "pass"));

exports.getSession = function (context) {
  if (context.neo4jSession) {
    return context.neo4jSession;
  } else {
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};

exports.closeSession = async function (context) {
  if (context.neo4jSession) {
    await context.neo4jSession.close();
    context.neo4jSession = null;
    return true;
  } else {
    return false;
  }
};
