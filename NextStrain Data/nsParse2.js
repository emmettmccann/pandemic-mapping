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

// const alasql = require("alasql");
// const fs = require("fs");
// const path = require("path");

// let rawdata = fs.readFileSync(path.resolve(__dirname, "./nextstrain-africa.json"), "utf8");
// // console.log(rawdata);

// rawdata = /("tree": \{)[\s\S]*/.exec(rawdata);
// // console.log(rawdata);

// let na = /("name")([\s\S]*?)("node_attrs": \{)([\s\S]*?)(\}[^,])/;
// let nas = na.exec(rawdata);
// nas = nas.map((el) => {
//   console.log(el);
//   return JSON.parse("{" + el + "}");
// });
// console.log(nas[0]);

function getAttrs(node_attrs) {
  let res = {};
  res.author = getDef(node_attrs.author);

  Object.keys(res).forEach((key) => res[key] === undefined && delete res[key]);
  return res;
}

function getDef(x) {
  if (x) return x.value;
  return undefined;
}

let t = {};
let yes = {
  author: {
    value: "Andy",
  },
};
// console.log(t);
// console.log(yes);
// console.log(getAttrs(t));
// console.log(getAttrs(yes));
