<script>
  import Map from "./Map.svelte";
  import MapMarker from "./MapMarker.svelte";
  import { getTimeSeries, addShutdown, addSchools } from "./loadData.js";

  let states = [];
  let selected = "current";
  let views = [
    // { id: "first_case", text: "First Case" },
    { id: "current", text: "Current Cases" },
    { id: "first_death", text: "First Death" },
    { id: "stay_home", text: "Stay Home Orders" },
    { id: "school_closure", text: "School Closures" }
  ];

  $: maxValue = getMax(states, selected);

  function getMax(s, v) {
    let vals = s
      .map(function(state) {
        for (const dateID in state.dates) {
          let date = state.dates[dateID];
          if (date.events.length > 0 && date.events[0].type == v) {
            return date.cases;
          }
        }
      })
      .filter(el => !isNaN(el));
    if (vals.length > 0) return vals.reduce((a, b) => Math.max(a, b));
  }

  async function loadData() {
    states = await getTimeSeries();
    states = await addShutdown(states);
    states = await addSchools(states);
    console.log(states);
  }

  loadData();
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<select bind:value={selected} class="fixed z-10">
  {#each views as view}
    <option value={view.id}>{view.text}</option>
  {/each}
</select>

<Map lat={41} lon={-97} zoom={3}>
  {#each states as state}
    <MapMarker {state} {maxValue} bind:view={selected} />
  {/each}

</Map>
