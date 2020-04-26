const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function main() {
  let series = await fetch("https://coronadatascraper.com/timeseries-byLocation.json").then((res) => res.json());

  let states = [];
  for (const zone in series) {
    const el = series[zone];
    if (el.level == "state" && el.country == "United States") states.push(el);
  }

  states.pop();

  let stateLocData = [];
  states.forEach((state) => {
    state.id = state.stateId.slice(-2);
    stateLocData.push({
      type: "location",
      id: state.id,
      stateID: state.stateId,
      pop: state.population,
      popDensity: state.populationDensity,
      lat: state.coordinates[0],
      lon: state.coordinates[1],
      name: state.state,
    });
  });

  //   fs.writeFileSync("states.json", JSON.stringify(states));
  fs.writeFileSync("cases.json", JSON.stringify(states));
  fs.writeFileSync("states.json", JSON.stringify(stateLocData));
  console.log("Done");
}

main();
