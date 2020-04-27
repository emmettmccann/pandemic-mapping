const fetch = require("node-fetch");
const fs = require("fs");
const currDate = require("../static/currDate");

async function casesByStateTimeline() {
  let series = await fetch("https://coronadatascraper.com/timeseries-byLocation.json").then((res) => res.json());

  let states = [];
  for (const zone in series) {
    const el = series[zone];
    if (el.level == "state" && el.country == "United States") states.push(el);
  }

  // remove extra Nevada (bug in coronadatascraper)
  states.pop();

  let cases = [];
  let caseDateLinks = [];
  let caseLocLinks = [];
  let caseCaseLinks = [];
  states.forEach((state) => {
    let prevReport = "NoPrevReports";
    for (const dateID in state.dates) {
      let date = state.dates[dateID];
      date.date = dateID;
      if (date.cases >= 0) {
        cases.push({
          id: date.date + "@" + state.stateId,
          type: "caseReport",
          cases: date.cases,
          deaths: date.deaths,
          tested: date.tested,
          source: "coronadatascraper.com",
          dateRetrieved: currDate,
        });
        caseCaseLinks.push({
          type: "nextReport",
          child: date.date + "@" + state.stateId,
          parent: prevReport,
        });
        caseDateLinks.push({
          id: date.date + "@" + state.stateId + "-dateLink",
          type: "reportedOn",
          child: date.date,
          parent: date.date + "@" + state.stateId,
        });
        caseLocLinks.push({
          id: date.date + "@" + state.stateId + "-locLink",
          type: "reportedIn",
          child: state.stateId.slice(-2),
          parent: date.date + "@" + state.stateId,
        });
        prevReport = date.date + "@" + state.stateId;
      }
    }
  });

  console.log("Found %d case reports of format: ", cases.length);
  console.log(cases[1]);

  fs.writeFileSync("../artifacts/caseReports-" + currDate + ".json", JSON.stringify(cases));
  fs.writeFileSync("../artifacts/caseCaseLinks-" + currDate + ".json", JSON.stringify(caseCaseLinks));
  fs.writeFileSync("../artifacts/caseDateLinks-" + currDate + ".json", JSON.stringify(caseDateLinks));
  fs.writeFileSync("../artifacts/caseLocLinks-" + currDate + ".json", JSON.stringify(caseLocLinks));
  console.log("Done");
}

casesByStateTimeline();
