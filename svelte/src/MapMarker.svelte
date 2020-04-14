<script>
  import { getContext, onMount } from "svelte";
  import { mapbox, key } from "./mapbox.js";

  const { getMap } = getContext(key);
  const map = getMap();

  export let state;
  export let view;
  export let maxValue;
  let mark;

  $: lon = state.coordinates[0];
  $: lat = state.coordinates[1];
  $: label = state.state;
  $: rad = Math.sqrt(value / maxValue / Math.PI) * 50;
  $: value = getValue(state, view);

  function getValue(s, v) {
    for (const dateID in s.dates) {
      let date = s.dates[dateID];
      if (date.events.length > 0 && date.events[0].type == v) return date.cases;
    }
  }

  // load this info on mount so that the div is in place to take over for the marker
  onMount(() => {
    // const popup = new mapbox.Popup({ offset: 25 }).setText(rad + label);

    var marker = new mapbox.Marker(mark)
      .setLngLat([lon, lat])
      // .setPopup(popup)
      .addTo(map);
  });
</script>

<!-- <div bind:this={mark}>{label}</div> -->
<div bind:this={mark}>
  <svg height="100px" width="100px">
    <circle cx="50" cy="50" r={rad} fill="red" fill-opacity="0.5" />
    <!-- <text x="50" y="50">{value}</text> -->
  </svg>
</div>
