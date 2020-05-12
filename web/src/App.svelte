<script>
  import * as d3 from "d3";
  import Graph from "./Graph.svelte";

  let prob = 0.5;
  let trans = [];
  // let states = [];
  // let links = [];
  let graph = {};

  // createGraph();

  function getLinks() {
    console.log(prob);
    fetch("http://localhost:3000/probables?prob=" + prob)
      .then(response => response.json())
      .then(res => {
        graph = probableLinksToGraph(res);
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
    position: fixed;
    z-index: 10;
  }
</style>

<main>
  <div id="slide">
    <input
      type="range"
      bind:value={prob}
      min="0"
      max="1"
      step="0.1"
      on:mouseup={getLinks} />
  </div>
  <Graph {graph} />

</main>
