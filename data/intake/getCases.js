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
          label: "caseReport",
          cases: date.cases,
          deaths: date.deaths,
          tested: date.tested,
          source: "coronadatascraper.com",
          date: date.date,
          dateRetrieved: currDate,
        });
        caseCaseLinks.push({
          label: "nextReport",
          child: date.date + "@" + state.stateId,
          parent: prevReport,
        });
        caseCaseLinks.push({
          label: "prevReport",
          parent: date.date + "@" + state.stateId,
          child: prevReport,
        });
        caseLocLinks.push({
          label: "reportedBy",
          date: date.date,
          child: state.stateId.slice(-2),
          parent: date.date + "@" + state.stateId,
        });
        caseLocLinks.push({
          label: "reported",
          date: date.date,
          parent: state.stateId.slice(-2),
          child: date.date + "@" + state.stateId,
        });
        prevReport = date.date + "@" + state.stateId;
      }
    }
  });

  console.log("Found %d case reports of format: ", cases.length);
  console.log(cases[1]);

  fs.writeFileSync("../artifacts/caseReports.json", JSON.stringify(cases));
  fs.writeFileSync("../artifacts/caseCaseLinks.json", JSON.stringify(caseCaseLinks));
  fs.writeFileSync("../artifacts/caseLocLinks.json", JSON.stringify(caseLocLinks));
  console.log("Done");
}

casesByStateTimeline();
