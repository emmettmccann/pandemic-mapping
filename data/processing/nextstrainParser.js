const fs = require("fs");
const path = require("path");

let rawdata = fs.readFileSync(path.resolve(__dirname, "./global-4-22-genetic-tree.json"));
let africa = JSON.parse(rawdata);

let nodes = [];
let links = [];
let dates = [];

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
  let d = {
    parent: node.name,
    attrs: node.node_attrs,
  };
  nodes.push(n);
  links.push(l);
  dates.push(d);
  if (node.children) node.children.forEach((el) => extractNode(node.name, el));
}

function formatGenomeNode(node) {
  return {
    type: "genome",
    id: formatID(node.name),
    sampled: node.name.slice(0, 5) != "NODE_", // check if this is an inferred node
    author: getDef(node.node_attrs.author),
    country: getDef(node.node_attrs.country),
    division: getDef(node.node_attrs.division),
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
  };
}

function formatLink(link) {
  return {
    type: "mutated",
    id: formatID(link.parent + "-" + link.child),
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
  };
}

function formatDateLink(date) {
  return {
    type: "at",
    id: formatID(date.parent + "@" + date.attrs.num_date.value),
    parent: date.parent,
    child: (() => {
      let d = getDef(date.attrs.num_date);
      if (d == undefined) return undefined;
      d = new Date((d - 1970) * 365.25 * 24 * 60 * 60 * 1000); // convert the datetime to proper date object
      return d.toISOString().substring(0, 10);
    })(),
  };
}

// recursively extract all info from the tree
extractNode("root", africa.tree);

// format each genome node and mutation relationships
nodes = nodes.map(formatGenomeNode);
links = links.map(formatLink);
// format date links for mapping to date nodes
dates = dates.map(formatDateLink);

console.log("Generated %d genome nodes of format: ", nodes.length);
console.log(nodes[1]);
console.log("Generated %d mutation links of format: ", links.length);
console.log(links[1]);
console.log("Generated %d date links of format: ", dates.length);
console.log(dates[1]);

fs.writeFileSync("nodes-4-22.json", JSON.stringify(nodes));
fs.writeFileSync("links-4-22.json", JSON.stringify(links));
fs.writeFileSync("dates-4-22.json", JSON.stringify(dates));

// helped for pulling values out of optionally defined attributes of format x:{value:"DATA_HERE"}
function getDef(x) {
  if (x) return x.value;
  return undefined;
}

function formatID(x) {
  return x.replace(/\//g, "-");
}