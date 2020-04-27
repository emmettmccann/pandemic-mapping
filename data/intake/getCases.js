const fetch = require("node-fetch");
const fs = require("fs");

export async function casesByStateTimeline() {
  let series = await fetch("https://coronadatascraper.com/timeseries-byLocation.json").then((res) => res.json());

  let states = [];
  for (const zone in series) {
    const el = series[zone];
    if (el.level == "state" && el.country == "United States") states.push(el);
  }

  // remove extra Nevada (bug in coronadatascraper)
  states.pop();

  fs.writeFileSync("../artifacts/casesByStateTimeline.json", JSON.stringify(states));
  console.log("Done");
}
