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
