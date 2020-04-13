const fs = require("fs");
const path = require("path");

let rawdata = fs.readFileSync(path.resolve(__dirname, "./nytsho.json"));
let data = JSON.parse(rawdata);

//   let data = await fetch("/Users/emmettmccann/Desktop/nytsho.json");
let orders = [];
data.forEach((el) => {
  let remap = {};
  remap.name = el.statename;
  remap.key = el.key;
  remap.blurb = el.blurb;
  if (el.statewide) {
    remap.statewide = true;
    remap.order = el.values[0].order;
    remap.formal = el.values[0].formal_order;
    remap.date = el.values[0].date_effective_fmt;
    remap.date = remap.date.substring(0, 10);
  } else {
    remap.statewide = false;
  }
  //   console.log(remap);
  orders.push(remap);
});

let toWrite = JSON.stringify(orders);
fs.writeFileSync("formattedNYT.json", toWrite);
// }

// let x = loadNYT();
