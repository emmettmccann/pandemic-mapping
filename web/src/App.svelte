<script>
  import State from "./State.svelte";
  import Transmission from "./Transmission.svelte";
  export let name;
  let states = [];
  let prob = 0.5;
  let trans = [];
  fetch("http://localhost:3000/probables")
    .then(response => response.json())
    .then(responseJson => {
      console.log(responseJson);
      trans = responseJson;
    });

  function sendProb() {
    console.log(prob);
    fetch("http://localhost:3000/probables?prob=" + prob)
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        trans = responseJson;
      });
  }
</script>

<style>

</style>

<main>
  <input
    type="range"
    bind:value={prob}
    min="0"
    max="1"
    step="0.1"
    on:mouseup={sendProb} />
  {#each states as state}
    <State {state} />
  {/each}
  {#each trans as transmission}
    <Transmission {transmission} />
  {/each}
</main>
