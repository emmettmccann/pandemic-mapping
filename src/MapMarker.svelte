<script>
  import { getContext, onMount } from "svelte";
  import { mapbox, key } from "./mapbox.js";

  const { getMap } = getContext(key);
  const map = getMap();

  export let state;
  export let view;
  export let maxValue;
  let mark;
  let hov = false;

  $: lon = state.coordinates[0];
  $: lat = state.coordinates[1];
  $: label = state.state;
  $: rad = Math.sqrt(date.cases / maxValue / Math.PI) * 50;
  $: date = getValue(state, view);

  function getValue(s, v) {
    for (const dateID in s.dates) {
      let date = s.dates[dateID];
      if (date.events.length > 0 && date.events[0].type == v) return date;
    }
    return {};
  }

  // load this info on mount so that the div is in place to take over for the marker
  onMount(() => {
    // const popup = new mapbox.Popup({ offset: 25 }).setText(rad + label);

    var marker = new mapbox.Marker(mark)
      .setLngLat([lon, lat])
      // .setPopup(popup)
      .addTo(map);
  });

  function enter() {
    hov = true;
  }
  function leave() {
    hov = false;
  }
</script>

<style>
  .hov {
    @apply z-10;
  }
</style>

<!-- <div bind:this={mark}>{label}</div> -->
<div bind:this={mark} style="pointer-events : none;" class:hov>
  <svg height="100px" width="100px">
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="white"
      fill-opacity="0.0"
      on:mouseenter={enter}
      on:mouseleave={leave}
      style="pointer-events : auto; cursor: crosshair;"
      class="z-0" />
    <circle
      cx="50"
      cy="50"
      r={rad}
      fill="red"
      fill-opacity="0.5"
      on:mouseenter={enter}
      on:mouseleave={leave}
      style="pointer-events : auto; cursor: crosshair;"
      class="z-0" />
    {#if hov}
      <g style="pointer-events : none;" class="z-10">
        <rect
          x="5"
          y="5"
          height="90"
          width="90"
          rx="5"
          ry="5"
          fill="white"
          fill-opacity="0.95" />
        <text x="50" y="25" text-anchor="middle" class="text-lg font-medium">
          {label}
        </text>
        <foreignObject x="10" y="35" width="80" height="40">
          <p class="leading-tight text-center">{date.events[0].title}</p>
        </foreignObject>
        <!-- <text x="50" y="50" text-anchor="middle"></text> -->
        <text x="50" y="80" text-anchor="middle">@ {date.cases} cases</text>
      </g>
    {/if}
  </svg>
</div>
