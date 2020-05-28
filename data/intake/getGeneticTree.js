const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");

var genomeNodes = [];
var mutationLinks = [];
var locationLinks = [];

let states = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../static/states.json")));

getTree();

async function getTree() {
  let rawdata = await fetch("https://nextstrain.org/charon/getDataset?prefix=/ncov/north-america").then((res) =>
    res.json()
  );

  // extract divisions and save as location nodes
  const locationNodes = extractLocations(rawdata.meta);

  // recursively extract all info from the tree
  extractNode("root", rawdata.tree);

  // format the tree data
  formatTree();

  console.log("Generated %d location nodes of raw format: ", locationNodes.length);
  console.log(locationNodes[1]);
  console.log("Generated %d genome nodes of raw format: ", genomeNodes.length);
  console.log(genomeNodes[1]);
  console.log("Generated %d mutation links of raw format: ", mutationLinks.length);
  console.log(mutationLinks[1]);
  console.log("Generated %d location links of raw format: ", locationLinks.length);
  console.log(locationLinks[1]);

  // write the files
  fs.outputJsonSync("../../artifacts/locationNodes.json", locationNodes);
  fs.outputJsonSync("../../artifacts/genomeNodes.json", genomeNodes);
  fs.outputJsonSync("../../artifacts/genomeMutationLinks.json", mutationLinks);
  fs.outputJsonSync("../../artifacts/genomeLocLinks.json", locationLinks);
}

function extractNode(parentName, node) {
  let n = {
    name: node.name,
    node_attrs: node.node_attrs,
  };
  let l = {
    parent: parentName,
    child: node.name,
    mutation: node.branch_attrs,
    attrs: node.node_attrs,
  };
  genomeNodes.push(n);
  mutationLinks.push(l);
  if (node.children) node.children.forEach((el) => extractNode(node.name, el));
}

function extractLocations(meta) {
  const locations = meta.geo_resolutions[1].demes;
  let locationNodes = [];
  for (const prop in locations) {
    locationNodes.push({
      id: prop,
      lat: locations[prop].latitude,
      lon: locations[prop].longitude,
    });
  }
  return locationNodes;
}

function formatTree() {
  // format each genome node
  genomeNodes = genomeNodes.map(formatGenomeNode);
  // must come after the formatting
  genomeNodes.map(pushLocLinks);
  // format each mutation link
  mutationLinks = mutationLinks.reduce((array, link) => array.concat(formatLink(link)), []);
}

function formatGenomeNode(node) {
  return {
    label: "genome",
    id: formatID(node.name),
    sampled: node.name.slice(0, 5) != "NODE_" && getDef(node.node_attrs.gisaid_epi_isl) != undefined, // check if this is an inferred node
    author: getDef(node.node_attrs.author),
    country: getDef(node.node_attrs.country),
    // get the most likely division
    division: getDef(node.node_attrs.division),
    // get the entropy for the division. This will be non-zero for inferred nodes
    division_entropy: node.node_attrs.division.entropy,
    // get the full list of divisions
    division_estimates: node.node_attrs.division.confidence,
    location: getDef(node.node_attrs.location),
    gisaid_epi_isl: getDef(node.node_attrs.gisaid_epi_isl),
    date: getDef(node.node_attrs.num_date),
    // if this is an inferred node, pull the confidence interval for the estimated date
    date_confidence_low: node.name.slice(0, 5) == "NODE_" ? node.node_attrs.num_date.confidence[0] : undefined,
    date_confidence_high: node.name.slice(0, 5) == "NODE_" ? node.node_attrs.num_date.confidence[1] : undefined,
    date_confidence_interval: node.node_attrs.num_date.confidence[1] - node.node_attrs.num_date.confidence[0],
    originating_lab: getDef(node.node_attrs.originating_lab),
    submitting_lab: getDef(node.node_attrs.submitting_lab),
    region: getDef(node.node_attrs.region),
    sex: getDef(node.node_attrs.sex),
    // output the date as a formatted string (YYYY-MM-DD) for linking to dates (all dates in ISO format)
    date_formatted: (() => {
      let d = getDef(node.node_attrs.num_date);
      if (d == undefined) return undefined;
      d = new Date((d - 1970) * 365.25 * 24 * 60 * 60 * 1000); // convert the datetime to proper date object
      return d.toISOString().substring(0, 10);
    })(),
    stateID: getStateID(getDef(node.node_attrs.division)),
  };
}

function pushLocLinks(node) {
  const possibleDivisions = node.division_estimates;
  for (const division in possibleDivisions) {
    locationLinks.push({
      label: "SAMPLED_IN",
      parent: node.id,
      child: division,
      date: node.date,
      confidence: possibleDivisions[division],
      location: node.location,
    });
  }
}

function formatLink(link) {
  return {
    label: "MUTATED_TO",
    parent: formatID(link.parent),
    child: formatID(link.child),
    aaMut: link.mutation && link.mutation.labels ? link.mutation.labels.aa : undefined, // get the amino acid mutations if they exist
    nuc:
      link.mutation && link.mutation.mutations && link.mutation.mutations.nuc
        ? link.mutation.mutations.nuc // collapse all nucleotide mutations into a comma-separated-list
            .reduce((prev, curr) => {
              return prev + "," + curr;
            }, "")
            .slice(1) // cut out the first comma of the list (pre-content)
        : undefined,
    diff:
      link.mutation && link.mutation.mutations && link.mutation.mutations.nuc ? link.mutation.mutations.nuc.length : 0,
  };
}

// helped for pulling values out of optionally defined attributes of format
// x:{value:"DATA_HERE"}
function getDef(x) {
  if (x) return x.value;
  return undefined;
}

function formatID(x) {
  return x.replace(/\//g, "-");
}

function getStateID(division) {
  let s = states.find((el) => el.name == division);
  return s !== undefined ? s.id : undefined;
}
