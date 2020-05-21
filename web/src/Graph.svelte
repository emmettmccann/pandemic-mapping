<script>
  import * as d3 from "d3";
  import { onMount, getContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";
  import { fade } from "svelte/transition";

  const { getMap } = getContext(key);
  const map = getMap();

  let simulation; // the force directed simulation
  let adjlist; // a list of edges for interaction information

  export let graphData = { nodes: [], links: [] }; // externally available graph object
  let graph = { nodes: [], links: [] }; // internal graph object for simulation and display

  onMount(() => {
    // Instantiate new force directed simulation
    simulation = d3
      .forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-2000)) // push nodes apart to reduce clumping
      .force("x", d3.forceX(window.innerWidth / 3).strength(0.2)) // center nodes on the xAxis
      .force("y", d3.forceY(window.innerHeight / 3).strength(0.05)) // center nodes on the yAxis
      .force("link", d3.forceLink(graph.links).id(d => d.id)) // add forces based on the links between nodes
      .on("tick", simTick);

    // Set up a listener to ping the simulation whenever the map moves
    map.on("move", function() {
      simulation.alpha(0.3).restart();
    });
  });

  // ===================== Graph Data Management =====================
  // When new graphData comes in, update the current graph to match
  $: updateGraph(graphData);

  // Update 'graph', adding new nodes from newGraph and keeping all nodes that match between newGraph and graph
  function updateGraph(newGraph) {
    // create a map of the existing nodes
    const existingNodes = new Map(graph.nodes.map(d => [d.id, d]));

    // build new set of nodes based on existing nodes in the old graph
    graph.nodes = newGraph.nodes.map(d =>
      Object.assign(existingNodes.get(d.id) || {}, d)
    );

    // build a new set of links
    graph.links = newGraph.links.map(d => Object.assign({}, d));

    // rebuild the adjacency list for highlighting neighbors on hover
    adjlist = [];
    graph.links.forEach(function(d) {
      adjlist[d.source + "-" + d.target] = true;
      adjlist[d.target + "-" + d.source] = true;
    });

    // reset the force simulation with the new data
    restartSim();
  }

  // ===================== SIMULATION HELPERS =====================
  function simTick() {
    graph.nodes = [...graph.nodes]; // copy over nodes from step to step
    graph.links = [...graph.links]; // copy over links from step to step

    // Update nodes where needed
    graph.nodes.map(node => {
      if (node.fixToMapLocation) {
        // get the pixel coordinates based on the map position
        let { x, y } = map.project([node.lat, node.lon]);
        node.fx = x;
        node.fy = y;
      } else {
        // Release nodes from fixed positions
        node.fx = null;
        node.fy = null;
      }
    });
  }

  function restartSim() {
    // Don't run if there is no simulation to restart
    if (!simulation) return;

    // Update the simulation.
    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);

    // Restart the simulation
    simulation.alpha(0.3).restart();
  }

  // ===================== INTERACTION =====================
  // Set hovering opacities
  function focus(focusedNode) {
    let focusedNodeID = focusedNode.id;

    // update opacity for all links
    graph.nodes.forEach(otherNode => {
      // If the other node is connected, don't change it. Otherwise, make it nearly invisible.
      otherNode.alpha =
        focusedNodeID == otherNode.id || // other node is actually this node OR
        adjlist[focusedNodeID + "-" + otherNode.id] // other node is connected to this node
          ? null // no change
          : 0.1; // reduced visibility
    });

    // update alpha for all links
    graph.links.forEach(link => {
      link.alpha =
        link.source.id == focusedNodeID || link.target.id == focusedNodeID // Is this link connected to the focused node?
          ? null // if it is connected, don't change
          : 0.001; // if not connected, set its opacity to almost 0
    });

    // force update the DOM (svelte updates on assignment and forEach does not trigger this)
    // https://svelte.dev/tutorial/updating-arrays-and-objects
    graph = graph;
  }

  // Clear manual opacities
  function unfocus() {
    graph.nodes.forEach(node => {
      node.alpha = null;
    });
    graph.links.forEach(link => {
      link.alpha = null;
    });

    graph = graph;
  }

  // animation for adding new nodes to the graph via growing the circle
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
    <g stroke="#999" opacity={link.alpha || link.data.prob}>
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
      opacity={point.alpha || 0.8}
      cx={point.x}
      cy={point.y}
      on:mouseover={focus(point)}
      on:mouseout={unfocus}>
      <title>{point.id}</title>
    </circle>
  {/each}
</svg>
