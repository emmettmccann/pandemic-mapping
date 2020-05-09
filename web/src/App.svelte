<script>
  import Transmission from "./Transmission.svelte";
  let prob = 0.5;
  let trans = [];
  let states = [];
  let links = [];

  function getLinks() {
    console.log(prob);
    fetch("http://localhost:3000/probables?prob=" + prob)
      .then(response => response.json())
      .then(res => {
        // console.log(res);
        // trans = res;
        states = [];
        links = [];
        res.forEach(link => {
          let pExists = states.findIndex(state => {
            return state.id == link.parent.id;
          });
          let cExists = states.findIndex(state => {
            return state.id == link.child.id;
          });
          if (pExists == -1) states.push(link.parent);
          if (cExists == -1) states.push(link.child);
        });
        console.log(states);
        res.forEach(link => {
          let pIndex = states.findIndex(state => {
            return state.id == link.parent.id;
          });
          let cIndex = states.findIndex(state => {
            return state.id == link.child.id;
          });
          links.push({
            source: pIndex,
            target: cIndex
          });
        });
        console.log(links);
        renderGraph();
      });
  }

  function dblclick(d) {
    d3.select(this).classed("fixed", (d.fixed = false));
  }

  function dragstart(d) {
    d3.select(this).classed("fixed", (d.fixed = true));
  }

  function renderGraph() {
    var width = 800,
      height = 800;
    var force = d3.layout
      .force()
      .charge(-1000)
      .linkDistance(100)
      .size([width, height]);

    var svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("pointer-events", "all");

    force
      .nodes(states)
      .links(links)
      .start();

    var link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link");

    var node = svg
      .selectAll(".node")
      .data(states)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("dblclick", dblclick)
      .call(force.drag);

    node.append("circle").attr("r", 10);

    node
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.name;
      });

    var drag = force.drag().on("dragstart", dragstart);

    // html title attribute
    node.append("title").text(d => {
      return d.name;
    });

    // force feed algo ticks
    force.on("tick", () => {
      link
        .attr("x1", d => {
          return d.source.x;
        })
        .attr("y1", d => {
          return d.source.y;
        })
        .attr("x2", d => {
          return d.target.x;
        })
        .attr("y2", d => {
          return d.target.y;
        });

      node
        .attr("transform", d => {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("cy", d => {
          return d.y;
        });
    });
  }
</script>

<style>
  #graph {
    height: 100vh;
    width: 100vw;
  }
  :global(.link) {
    stroke: #999;
    stroke-opacity: 0.6;
    stroke-width: 1px;
  }

  :global(.fixed) {
    /* this will apply to <body> */
    fill: crimson;
  }
</style>

<main>
  <input
    type="range"
    bind:value={prob}
    min="0"
    max="1"
    step="0.1"
    on:mouseup={getLinks} />
  <!-- {#each trans as transmission}
    <Transmission {transmission} />
  {/each} -->
  <div id="graph" />
</main>
