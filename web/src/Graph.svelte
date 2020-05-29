<script>
  import * as d3 from "d3";
  import { onMount, getContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";
  import { fade } from "svelte/transition";

  const { getMap } = getContext(key);
  const map = getMap();

  let zoom, pitch;
  $: strokeWidth = 0.5 + 1.5 * (zoom / 3) * (zoom / 3);

  let simulation; // the force directed simulation

  let selected = new Set();

  const width = window.innerWidth,
    height = window.innerHeight;

  let edgeMarkers = [];

  export let graphData = { nodes: [], links: [] }; // externally available graph object
  let graph = { nodes: [], links: [] }; // internal graph object for simulation and display

  onMount(() => {
    // Set up a listener to update the graph when the map moves
    map.on("move", function() {
      tick();
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

    graph.links.forEach(link => {
      link.source = { id: link.source };
      link.target = { id: link.target };
    });

    tick();
  }

  // ===================== SIMULATION HELPERS =====================
  async function tick() {
    console.log("tick");

    // Update nodes where needed
    graph.nodes.forEach(node => {
      // get the pixel coordinates based on the map position
      let { x, y } = map.project([node.lon, node.lat]);
      node.x = x;
      node.y = y;
    });

    const nodeMap = new Map(graph.nodes.map(d => [d.id, d]));

    graph.links.forEach(link => {
      link.target = nodeMap.get(link.target.id);
      link.source = nodeMap.get(link.source.id);
    });

    graph.nodes = [...graph.nodes]; // copy over nodes from step to step
    graph.links = [...graph.links]; // copy over links from step to step

    edgeMarkers = [];

    graph.links.forEach(link => {
      const visible =
        selected.has(link.source.id) ||
        selected.has(link.target.id) ||
        selected.size == 0;
      const targetNeg = link.target.x < 0 || link.target.y < 0;
      const targetPos = link.target.x > width || link.target.y > height;
      const targetOffScreen = targetNeg || targetPos;
      const sourceNeg = link.source.x < 0 || link.source.y < 0;
      const sourcePos = link.source.x > width || link.source.y > height;
      const sourceOffScreen = sourceNeg || sourcePos;

      // one is on and one is off.
      const partiallyOffScreen = targetOffScreen != sourceOffScreen;
      if (partiallyOffScreen && visible) {
        const topBorder = { x1: 0, x2: width, y1: 0, y2: 0 };
        const linkLine = {
          x1: link.source.x,
          x2: link.target.x,
          y1: link.source.y,
          y2: link.target.y
        };
        // console.log(line_line_intersect(topBorder, linkLine));
        let linkElement = document.getElementById("link-" + link.id);
        if (linkElement) {
          let lineLength = linkElement.getTotalLength();
          for (let i = 0; i < lineLength; i += lineLength / 10) {
            const pt = linkElement.getPointAtLength(i);
            if (
              pt.x <= 10 ||
              pt.x >= width - 10 ||
              pt.y <= 10 ||
              pt.y >= height - 10
            ) {
              pt.label = targetOffScreen ? link.target.id : link.source.id;
              pt.linkID = "#link-" + link.id;
              pt.offset = i;
              edgeMarkers = [...edgeMarkers, pt];
            }
          }
        }
      }
    });

    zoom = map.getZoom();
    pitch = map.getPitch() / 200;
  }

  // ===================== INTERACTION =====================
  // Set hovering opacities
  function focus(focusedNode) {
    let focusedNodeID = focusedNode.id;

    // update alpha for all nodes
    graph.nodes.forEach(otherNode => {
      // If the other node is connected, don't change it. Otherwise, make it nearly invisible.
      otherNode.alpha =
        focusedNodeID == otherNode.id //|| // other node is actually this node OR
          ? // adjlist[focusedNodeID + "-" + otherNode.id] // other node is connected to this node
            null // no change
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
    graph.nodes.forEach(node => (node.alpha = null));
    graph.links.forEach(link => (link.alpha = null));
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

  function getCurve(link) {
    let path = "M " + link.source.x + " " + link.source.y + " ";
    let vx = link.target.x - link.source.x;
    let vy = link.target.y - link.source.y;
    let vpx = vy;
    let vpy = -vx;

    let pitchCorrection = Math.abs(Math.atan2(vpx, vpy)) - Math.PI / 2;

    pitchCorrection = pitchCorrection / (Math.PI / 2);
    let controlX = vx / 2 + vpx * pitchCorrection * pitch;
    let controlY = vy / 2 + vpy * pitchCorrection * pitch;
    path += "q " + controlX + " " + controlY + " " + vx + " " + vy;

    return path;
  }

  function handleClick(point) {
    if (selected.has(point.id)) selected.delete(point.id);
    else selected.add(point.id);
    console.log(selected);
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

  :global(#graph > #node) {
    pointer-events: all !important;
  }
  :global(#graph > #link) {
    pointer-events: none !important;
  }
</style>

<svg id="graph" on:wheel={event => map.scrollZoom.wheel(event)}>
  <defs>
    <filter id="shadow" filterUnits="userSpaceOnUse">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="coloredBlur" />
      <!-- <feOffset dx="2" dy="2" result="offsetblur" /> -->
      <feMerge>
        <feMergeNode in="coloredBlur" />
      </feMerge>
    </filter>
    <filter id="glow" filterUnits="userSpaceOnUse">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="nodeGradient">
      <stop offset="20%" stop-color="black" stop-opacity="1" />
      <stop offset="70%" stop-color="black" stop-opacity="0.2" />
      <stop offset="100%" stop-color="black" stop-opacity="0" />
    </radialGradient>
  </defs>

  {#each graph.links as link (link.id)}
    {#if selected.has(link.source.id) || selected.has(link.target.id) || selected.size == 0}
      <line
        stroke="black"
        stroke-width="2px"
        x1={link.source.x}
        y1={link.source.y}
        x2={link.target.x}
        y2={link.target.y}
        opacity={link.alpha || 0.1}
        filter="url(#shadow)" />
    {/if}
  {/each}

  {#each graph.nodes as point (point.id)}
    <g id="node">
      <circle
        transition:expand
        class="node"
        r={zoom * 3}
        fill="url(#nodeGradient)"
        opacity={selected.has(point.id) || selected.size == 0 ? 0.6 : 0.1}
        cx={point.x}
        cy={point.y}
        on:mouseover={focus(point)}
        on:mouseout={unfocus}
        on:click={handleClick(point)}>
        <title>{point.id}</title>
      </circle>
    </g>
  {/each}

  {#each graph.links as link (link.id)}
    {#if selected.has(link.source.id) || selected.has(link.target.id) || selected.size == 0}
      <linearGradient
        id={link.id.replace(/\s+/g, '') + 'grad'}
        gradientUnits="userSpaceOnUse"
        x1={link.source.x}
        y1={link.source.y}
        x2={link.target.x}
        y2={link.target.y}>
        <stop offset="0" stop-color="royalblue" />
        <stop offset="1" stop-color="limegreen" />
      </linearGradient>
      <linearGradient
        id={link.id.replace(/\s+/g, '') + 'animate'}
        gradientUnits="userSpaceOnUse"
        x1={link.source.x}
        y1={link.source.y}
        x2={link.target.x}
        y2={link.target.y}>
        <stop offset="-0.11" stop-color="white" stop-opacity="0.0">
          <animate
            attributeName="offset"
            dur="5s"
            repeatCount="indefinite"
            from="-0.11"
            to="1" />
        </stop>
        <stop offset="-0.01" stop-color="white" stop-opacity="1">
          <animate
            attributeName="offset"
            dur="5s"
            repeatCount="indefinite"
            from="-0.01"
            to="1.1" />
        </stop>
        <stop offset="0.0" stop-color="white" stop-opacity="0.0">
          <animate
            attributeName="offset"
            dur="5s"
            repeatCount="indefinite"
            from="0"
            to="1.11" />
        </stop>
      </linearGradient>

      <g id="link">
        <path
          id={'link-' + link.id}
          stroke={'url(#' + link.id.replace(/\s+/g, '') + 'grad)'}
          d={getCurve(link)}
          fill="transparent"
          stroke-width={strokeWidth}
          opacity={link.alpha || 0.8}
          transition:fade={{ duration: 200 }}
          stroke-linecap="round" />
        {#if link && selected.size > 0}
          <path
            stroke={'url(#' + link.id.replace(/\s+/g, '') + 'animate)'}
            d={getCurve(link)}
            fill="transparent"
            stroke-width={strokeWidth * 0.8}
            opacity={link.alpha || 1}
            transition:fade={{ duration: 200 }}
            stroke-linecap="round" />
        {/if}
      </g>
    {/if}
  {/each}
  {#each edgeMarkers as mark}
    <!-- <text x={mark.x} y={mark.y}>{marsk.label}</text> -->
    <text style="stroke: #000;">
      <textPath xlink:href={mark.linkID} side="right" startOffset={mark.offset}>
        {mark.label}
      </textPath>
    </text>
  {/each}
</svg>
