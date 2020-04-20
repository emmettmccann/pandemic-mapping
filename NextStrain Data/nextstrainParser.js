var schema = {
  type: "genome",
  id: "Shanghai/SH0020/2020",
  sampled: true,
  author: "Wang et al",
  country: "China",
  division: "Shanghai",
  location: "Snohomish County",
  gisaid_epi_isl: "EPI_ISL_416329",
  date: "2020.0860655737704",
  originating_lab: "Shanghai Public Health Clinical Center, Shanghai Medical College, Fudan University",
  region: "Asia",
  sex: "Female",
  submitting_lab:
    "National Research Center for Translational Medicine (Shanghai), Ruijin Hospital affiliated to Shanghai Jiao Tong University School of Medicine & Shanghai Public Health Clinical Center",
};

var nodeSchema = {
  type: "genome",
  id: "NODE_0000720",
  sampled: false,
  date: "2020.0722122686764",
  date_confidence_low: 2020.0461236342921,
  date_confidence_high: 2020.084336441549,
  country: "China",
  country_confidence: "0.999964205852087",
};

var mutationSchema = {
  type: "mutated",
  id: "__sourcename__-__destname__",
  aa: "__pull from labels__",
  nuc: "__comma separated__",
};

var geneNode = {
  type: "gene",
  id: "ORF1a",
  range: "266..13468",
};

const fs = require("fs");
const path = require("path");

let rawdata = fs.readFileSync(path.resolve(__dirname, "./global-4-17-genetic-tree.json"));
let africa = JSON.parse(rawdata);

// console.log(africa.tree);

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

function getMutation(link) {
  let res = link;
  res.id = link.parent + "-" + link.child;
  res.aa = link.mutation && link.mutation.labels ? link.mutation.labels.aa : undefined;
  res.nuc =
    link.mutation && link.mutation.mutations && link.mutation.mutations.nuc
      ? link.mutation.mutations.nuc
          .reduce((prev, curr) => {
            return prev + "," + curr;
          }, "")
          .slice(1)
      : undefined;

  Object.keys(res).forEach((key) => res[key] === undefined && delete res[key]);
  return res;
}

function getAttrs(node_attrs) {
  let res = {};
  res.author = getDef(node_attrs.author);
  res.date = getDef(node_attrs.num_date);
  res.region = getDef(node_attrs.region);
  res.country = getDef(node_attrs.country);
  res.location = getDef(node_attrs.location);
  res.sex = getDef(node_attrs.sex);
  res.division = getDef(node_attrs.division);
  res.lab = getDef(node_attrs.originating_lab);

  if (node.name.slice(0, 5) == "NODE_") {
    res.status = "inferred";
    res.date_confidence_low = node.node_attrs.num_date.confidence[0];
    res.date_confidence_high = node.node_attrs.num_date.confidence[1];
  } else {
    res.status = "sampled";
  }

  Object.keys(res).forEach((key) => res[key] === undefined && delete res[key]);
  return res;
}

extractNode("root", africa.tree);

function formatGenomeNode(node) {
  return {
    type: "genome",
    id: node.name,
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
    type: "link",
    id: link.parent + "-" + link.child,
    parent: link.parent,
    child: link.child,
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

nodes = nodes.map(formatGenomeNode);
links = links.map(formatLink);

fs.writeFileSync("nodes.json", JSON.stringify(nodes));
fs.writeFileSync("links.json", JSON.stringify(links));
fs.writeFileSync("dates.json", JSON.stringify(dates));

// helped for pulling values out of optionally defined attributes of format x:{value:"DATA_HERE"}
function getDef(x) {
  if (x) return x.value;
  return undefined;
}
