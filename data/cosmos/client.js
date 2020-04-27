const config = {
  endpoint: "wss://wpi-iqp-covid19.gremlin.cosmos.azure.com:443/",
  primaryKey: "XcLrd2y1v8NNoM6vdJjTh55wjWdFgv8dJSO6fJpAllnZ7oCXyAKb7nLO5nsCb7lbTb9lba1zU2th0hmQD5BiNw==",
  database: "covidia",
  collection: "covidia1",
};

const Gremlin = require("gremlin");

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

module.exports = client;
