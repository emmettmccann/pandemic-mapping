async function fetchTimeSeriesData() {
  let series = await fetch("https://coronadatascraper.com/timeseries-byLocation.json").then((res) => res.json());

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
  return await fetch("./data/formattedNYT.json").then((res) => res.json());
}

async function getSchools() {
  return await fetch("./data/schools.json").then((res) => res.json());
}

export async function getTimeSeries() {
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

    state.dates[Object.keys(state.dates)[Object.keys(state.dates).length - 1]].events.push({
      type: "current",
      title: "Currently",
      notes: "",
    });

    return state;
  });
  return states;
}

export async function addShutdown(states) {
  let StayHomeOrders = await getNYTSHO();

  StayHomeOrders.forEach((sho) => {
    let index = states.findIndex((el) => el.id == sho.key);
    let state = states[index];
    if (sho.statewide) {
      state.dates[sho.date].events.push({
        type: "stay_home",
        title: sho.order,
        notes: sho.blurb,
      });
    }
  });
  return states;
}

export async function addSchools(states) {
  let schools = await getSchools();

  schools.forEach((sc) => {
    let index = states.findIndex((el) => el.id == sc.key);
    let state = states[index];
    state.dates[sc.date].events.push({
      type: "school_closure",
      title: sc.status,
      notes: sc.duration,
    });
  });
  return states;
}
