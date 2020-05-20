<script>
  import * as d3 from "d3";
  import { onMount, getContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  const { getMap } = getContext(key);
  const map = getMap();

  var width, height;

  let simulation,
    adjlist,
    container,
    link,
    transmission,
    node,
    nodeLabel,
    tooltip;

  // ===================== Graph Data Management =====================
  export let inputGraph = { nodes: [], links: [] };
  let graph = { nodes: [], links: [] };

  // When a new graph comes in, update the current graph to match
  $: graph = updateGraph(inputGraph);

  // Update 'graph', adding new nodes from newGraph and keeping all nodes that match between newGraph and graph
  function updateGraph(newGraph) {
    console.log(newGraph);

    let updatedGraph = {};

    // create a map of the existing nodes
    const oldGraphNodeMap = new Map(graph.nodes.map(d => [d.id, d]));

    // build new set of nodes based on existing nodes in the old graph
    updatedGraph.nodes = newGraph.nodes.map(d =>
      Object.assign(oldGraphNodeMap.get(d.id) || {}, d)
    );

    // build a new set of links
    updatedGraph.links = newGraph.links.map(d => Object.assign({}, d));

    return updatedGraph;
  }

  $: updateForceSimulation(graph);

  // ==========================================

  onMount(onFirstLoad);

  function onFirstLoad() {
    simulation = d3
      .forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-2000))
      .force("x", d3.forceX(window.innerWidth / 3).strength(0.2))
      .force("y", d3.forceY(window.innerHeight / 3).strength(0.05))
      .force("link", d3.forceLink(graph.links).id(d => d.id))
      .on("tick", () => {
        graph.nodes = [...graph.nodes];
        graph.nodes.map(d => {
          if (d.locFix) {
            // get the pixel coordinates based on the map position
            let { x, y } = map.project([d.lat, d.lon]);
            d.fx = x;
            d.fy = y;
          } else {
            d.fx = null;
            d.fy = null;
          }
        });
        graph.links = [...graph.links];
      });

    map.on("move", function() {
      simulation.alphaTarget(simulation.alpha());
    });
  }

  function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
  }

  function updateForceSimulation(simulationGraph) {
    if (!simulation) return;

    // Update the simulation.
    simulation.nodes(simulationGraph.nodes);
    simulation.force("link").links(simulationGraph.links);

    // Restart the simulation
    simulation.alpha(0.3).restart();
  }

  function ticked() {
    node.attr("transform", function(d) {
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });
  }

  function dblclick(d) {
    if (d.locFix) {
      d.locFix = false;
      d.fx = null;
      d.fy = null;
    } else {
      d.locFix = true;
    }
    // d3.select(this).classed("fixed", (d.fixed = false));
  }

  function fixna(x) {
    if (isFinite(x)) return x;
    return 0;
  }

  // function focus(d) {
  //   var id = d3.select(d3.event.target).datum().id;
  //   node.style("opacity", function(o) {
  //     return neigh(id, o.id) ? 0.8 : 0.1;
  //   });
  //   link.style("opacity", function(o) {
  //     return o.source.id == id || o.target.id == id ? o.data.prob : 0.0;
  //   });
  // }

  // function unfocus() {
  //   node.style("opacity", 0.8);
  //   link.style("opacity", d => {
  //     return d.data.prob;
  //   });
  // }

  // function dragstarted(d) {
  //   d3.event.sourceEvent.stopPropagation();
  //   d3.select(this).classed("fixed", (d.fixed = true));
  //   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  //   d.fx = d.x;
  //   d.fy = d.y;
  // }

  // function dragged(d) {
  //   d.fx = d3.event.x;
  //   d.fy = d3.event.y;
  // }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
  }

  function expand(node, params) {
    const actualRadius = node.r.baseVal.value;

    return {
      delay: params.delay || 0,
      duration: params.duration || 200,
      css: (t, u) => `r: ${t * actualRadius}`
    };
  }
</script>

<style>
  #graph {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: 0;
    pointer-events: none;
  }

  :global(#graph > *) {
    pointer-events: all !important;
  }
</style>

<svg id="graph">
  {#each graph.links as link (link.id)}
    <g stroke="#999" stroke-opacity={link.data.prob}>
      <line
        transition:fade={{ duration: 200 }}
        x1={link.source.x}
        y1={link.source.y}
        x2={link.target.x}
        y2={link.target.y}>
        <title>{link.source.id}</title>
      </line>
    </g>
  {/each}

  {#each graph.nodes as point (point.id)}
    <circle
      transition:expand
      class="node"
      r="7"
      opacity="0.8"
      cx={point.x}
      cy={point.y}>
      <title>{point.id}</title>
    </circle>
  {/each}
</svg>
