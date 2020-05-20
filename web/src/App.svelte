<script>
  import * as d3 from "d3";
  import Graph from "./Graph.svelte";
  import Map from "./Map.svelte";
  import Select from "svelte-select";

  let prob = 0.5;
  let trans = [];
  const stateOptions = [
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "DC", label: "Washington, D.C." },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
    { value: "GU", label: "Guam" },
    { value: "PR", label: "Puerto Rico" },
    { value: "AS", label: "American Samoa" },
    { value: "MP", label: "Northern Mariana Islands" },
    { value: "VI", label: "United States Virgin Islands" }
  ];

  let selectedValue = [];
  $: selectedStateKeys = join(selectedValue);

  const dates = [
    "2019-12-24",
    "2019-12-26",
    "2019-12-30",
    "2020-01-02",
    "2020-01-05",
    "2020-01-08",
    "2020-01-13",
    "2020-01-16",
    "2020-01-19",
    "2020-01-20",
    "2020-01-21",
    "2020-01-22",
    "2020-01-23",
    "2020-01-24",
    "2020-01-25",
    "2020-01-26",
    "2020-01-27",
    "2020-01-28",
    "2020-01-29",
    "2020-01-30",
    "2020-01-31",
    "2020-02-01",
    "2020-02-02",
    "2020-02-03",
    "2020-02-04",
    "2020-02-05",
    "2020-02-06",
    "2020-02-07",
    "2020-02-08",
    "2020-02-09",
    "2020-02-10",
    "2020-02-11",
    "2020-02-12",
    "2020-02-13",
    "2020-02-14",
    "2020-02-16",
    "2020-02-17",
    "2020-02-18",
    "2020-02-19",
    "2020-02-20",
    "2020-02-21",
    "2020-02-22",
    "2020-02-23",
    "2020-02-24",
    "2020-02-25",
    "2020-02-26",
    "2020-02-27",
    "2020-02-28",
    "2020-02-29",
    "2020-03-01",
    "2020-03-02",
    "2020-03-03",
    "2020-03-04",
    "2020-03-05",
    "2020-03-06",
    "2020-03-07",
    "2020-03-08",
    "2020-03-09",
    "2020-03-10",
    "2020-03-11",
    "2020-03-12",
    "2020-03-13",
    "2020-03-14",
    "2020-03-15",
    "2020-03-16",
    "2020-03-17",
    "2020-03-18",
    "2020-03-19",
    "2020-03-20",
    "2020-03-21",
    "2020-03-22",
    "2020-03-23",
    "2020-03-24",
    "2020-03-25",
    "2020-03-26",
    "2020-03-27",
    "2020-03-28",
    "2020-03-29",
    "2020-03-30",
    "2020-03-31",
    "2020-04-01",
    "2020-04-02",
    "2020-04-03",
    "2020-04-04",
    "2020-04-05",
    "2020-04-06",
    "2020-04-07",
    "2020-04-08",
    "2020-04-09",
    "2020-04-10",
    "2020-04-11",
    "2020-04-12",
    "2020-04-13",
    "2020-04-14",
    "2020-04-15",
    "2020-04-16",
    "2020-04-17",
    "2020-04-18",
    "2020-04-19",
    "2020-04-20",
    "2020-04-21",
    "2020-04-22",
    "2020-04-23",
    "2020-04-24",
    "2020-04-25",
    "2020-04-26",
    "2020-04-28",
    "2020-04-29"
  ];
  let maxDateIndex = dates.length - 1;
  $: maxDate = dates[maxDateIndex];
  let minDateIndex = 0;
  $: minDate = dates[minDateIndex];

  function join(sStates) {
    if (sStates == undefined) return "";
    if (sStates.length === 1) return "'" + sStates[0].value + "'";
    return sStates
      .reduce((prev, curr) => {
        return prev + ",'" + curr.value + "'";
      }, "'")
      .slice(2); // cut out the first comma of the list (pre-content)
  }

  let locationLock = true;
  let locationLockSelected = true;
  let parents = true;
  let children = true;
  let maxDate = "2020-04-02";
  // let links = [];
  let graph = {};
  let ready = true;

  $: liveReload(
    prob,
    selectedStateKeys,
    locationLock,
    locationLockSelected,
    parents,
    children,
    maxDate,
    minDate
  );

  // createGraph();
  function setReady() {
    ready = true;
  }

  function liveReload(p, s, l1, l2, par, chi, mxd, mnd) {
    if (ready) getLinks();
  }

  function getLinks() {
    if (!ready) return;
    console.log(prob);
    let url = "http://localhost:3000/probables/agg?";
    url += "prob=" + prob;
    url += "&states=" + selectedStateKeys;
    url += "&maxDate=" + "'" + maxDate + "'";
    url += "&minDate=" + "'" + minDate + "'";
    if (parents) url += "&parents=true";
    if (children) url += "&children=true";
    fetch(url)
      .then(response => response.json())
      .then(res => {
        let g = probableLinksToGraph(res);
        console.log(g);

        g.nodes.forEach(node => {
          if (locationLock) {
            node.locFix = true;
          } else if (locationLockSelected) {
            if (
              selectedValue.findIndex(item => {
                console.log(selectedValue);
                console.log(item);

                return item.value == node.id;
              }) > -1
            ) {
              node.locFix = true;
            } else {
              node.locFix = false;
            }
          } else {
            node.locFix = false;
          }
        });

        graph = g;
      });
  }

  function probableLinksToGraph(apiResponse) {
    let states = [];
    let links = [];
    apiResponse.forEach(link => {
      let pExists = states.findIndex(state => {
        return state.id == link.parent.id;
      });
      let cExists = states.findIndex(state => {
        return state.id == link.child.id;
      });
      if (pExists == -1) states.push(link.parent);
      if (cExists == -1) states.push(link.child);
    });
    apiResponse.forEach(link => {
      links.push({
        id: link.parent.id + "-" + link.child.id,
        source: link.parent.id,
        target: link.child.id,
        data: link.data
      });
    });
    return { nodes: states, links: links };
  }
</script>

<style>
  #slide {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 10;
    width: 25vw;
    height: 100vh;
    background-color: white;
    padding-top: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  map {
    z-index: -10;
  }
</style>

<main>
  <div id="slide">
    <h2>Transmission Probability:</h2>
    0.1
    <input type="range" bind:value={prob} min="0.1" max="0.9" step="0.1" />
    0.9 probability
    <p>
      Viewing transmissions with greater than
      <b>{prob}</b>
      chance of having occured
    </p>

    <h2>Set Time Range:</h2>
    {dates[0]}
    <input
      type="range"
      bind:value={maxDateIndex}
      min={0}
      max={dates.length - 1}
      step={1} />
    {dates[dates.length - 1]}
    <p>
      {dates[0]}
      <input
        type="range"
        bind:value={minDateIndex}
        min={0}
        max={dates.length - 1}
        step={1} />
      {dates[dates.length - 1]}
    </p>
    <p>
      Samples between
      <b>{minDate} and {maxDate}</b>
    </p>

    <h2>State Filter:</h2>
    <Select bind:selectedValue items={stateOptions} isMulti={true} />
    <h2>Location Lock:</h2>
    <input type="checkbox" bind:checked={locationLock} />
    All nodes
    <input type="checkbox" bind:checked={locationLockSelected} />
    Focused nodes
    <h2>Lineage:</h2>
    <input type="checkbox" bind:checked={parents} />
    Possible Ancestors
    <input type="checkbox" bind:checked={children} />
    Possible Descendants
  </div>
  <Map lat={41} lon={-97} zoom={3}>
    {#if graph.nodes}
      <!-- content here -->
      <Graph inputGraph={graph} on:ready={setReady} />
    {/if}
  </Map>

</main>
