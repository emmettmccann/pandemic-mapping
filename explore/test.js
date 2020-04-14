async function main() {
  // load the base time series for each state (live from coronadatascraper.com)
  let states = await getTimeSeries();
  // clean series by adding in case and death counts for null
  // also add in first case and first death events
  states = states.map((state) => {
    let firstCase = false,
      firstDeath = false;
    for (const dateID in state.dates) {
      let date = state.dates[dateID];
      date.date = dateID;
      date.events = [];
      if (!date.hasOwnProperty("cases") && !firstCase) {
        date.cases = 0;
      }
      if (!date.hasOwnProperty("deaths") && !firstDeath) {
        date.deaths = 0;
      }
      if (!firstCase && date.cases > 0) {
        firstCase = true;
        date.events.push({
          type: "first_case",
          title: "First Case",
          notes: "",
        });
      }
      if (!firstDeath && date.deaths > 0) {
        firstDeath = true;
        date.events.push({
          type: "first_death",
          title: "First Death",
          notes: "",
        });
      }
    }

    return state;
  });
}
// main();
