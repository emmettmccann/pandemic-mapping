async function getData() {
  let states = await fetch("./USstates_avg_latLong.json").then((res) =>
    res.json()
  );
  let stateData = await fetch(
    "https://covidtracking.com/api/states"
  ).then((res) => res.json());

  states = states.map((state) => {
    state.data = stateData.find((sd) => {
      return sd.state === state.state;
    });
    return state;
  });
  return states;
}

async function getTimeSeries() {
  let series = await fetch(
    "https://coronadatascraper.com/timeseries-byLocation.json"
  ).then((res) => res.json());
  // let states = series.filter((el) => {

  // }
  let states = [];
  for (const zone in series) {
    const el = series[zone];
    if (el.level == "state" && el.country == "United States") states.push(el);
  }
  console.log(states);
}
