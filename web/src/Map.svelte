<script>
  import { onMount, setContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";

  setContext(key, {
    getMap: () => map
  });

  export let lat;
  export let lon;

  let container;
  let map;

  onMount(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/mapbox-gl/dist/mapbox-gl.css";

    link.onload = () => {
      map = new mapbox.Map({
        container,
        style: "mapbox://styles/emmettmccann/ck8z41m4f014n1inw6emiz6hk",
        center: [lon, lat],
        zoom: 3.5,
        attributionControl: false
      });
      // map.getCanvas().style.cursor = "crosshair";
      map.setPitch(60);
    };

    document.head.appendChild(link);

    return () => {
      map.remove();
      link.parentNode.removeChild(link);
    };
  });
</script>

<style>
  div {
    position: absolute;
    top: 0px;
    left: 25vw;
    height: 100vh;
    width: 75vw;
  }
</style>

<div bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>
