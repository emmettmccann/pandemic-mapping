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

async function fetchTimeSeriesData() {
  let series = await fetch(
    "https://coronadatascraper.com/timeseries-byLocation.json"
  ).then((res) => res.json());

  let states = [];
  for (const zone in series) {
    const el = series[zone];
    if (el.level == "state" && el.country == "United States") states.push(el);
  }
  states.forEach((state) => {
    state.id = state.stateId.slice(-2);
  });
  return states;
}

async function getNYTSHO() {
  let states = await fetch("./data/formattedNYT.json").then((res) =>
    res.json()
  );
  return states;
}

async function getShutdown() {
  let series = await getTimeSeries();
  let sho = await getNYTSHO();

  sho = sho.map((el) => {
    let elMod = el;
    let s = series.find((seriesData) => {
      return el.key == seriesData.stateId.slice(-2);
    });
    elMod.cases = s.dates[el.date];
    elMod.stateData = s;
    return elMod;
  });
  return sho;
}

async function getTimeSeries() {
  // load the base time series for each state (live from coronadatascraper.com)
  let states = await fetchTimeSeriesData();
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
  return states;
}

async function addShutdown(states) {
  let StayHomeOrders = await getNYTSHO();

  StayHomeOrders.forEach((sho) => {
    let index = states.findIndex((el) => el.id == sho.key);
    let state = states[index];
    if (sho.statewide) {
      console.log(state);
      console.log(sho);
      console.log(state.dates[sho.date]);
      state.dates[sho.date].events.push({
        type: "stay_home",
        title: sho.order,
        notes: sho.blurb,
      });
    }
  });
  return states;
}
