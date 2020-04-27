const fs = require("fs");
const path = require("path");
const currDate = (() => {
  let d = new Date();
  return d.getMonth() + "-" + d.getDate();
})();

export function formatTree() {
  let nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "nodes-" + currDate + ".json")));
  let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, "links-" + currDate + ".json")));
  let dates = JSON.parse(fs.readFileSync(path.resolve(__dirname, "dates-" + currDate + ".json")));

  // format each genome node
  nodes = nodes.map(formatGenomeNode);
  // format each mutation link
  links = links.map(formatLink);
  // format date links for mapping to date nodes
  dates = dates.map(formatDateLink);

  console.log("Formatted %d genome nodes like: ", nodes.length);
  console.log(nodes[1]);
  console.log("Formatted %d mutation links like: ", links.length);
  console.log(links[1]);
  console.log("Formatted %d date links like: ", dates.length);
  console.log(dates[1]);

  // write back into the same files
  fs.writeFileSync("nodes-" + currDate + ".json", JSON.stringify(nodes));
  fs.writeFileSync("links-" + currDate + ".json", JSON.stringify(links));
  fs.writeFileSync("dates-" + currDate + ".json", JSON.stringify(dates));
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

// helped for pulling values out of optionally defined attributes of format x:{value:"DATA_HERE"}
function getDef(x) {
  if (x) return x.value;
  return undefined;
}

function formatID(x) {
  return x.replace(/\//g, "-");
}
