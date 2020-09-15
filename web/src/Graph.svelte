<script>
  import * as d3 from "d3";
  import { onMount, getContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";
  import { fade } from "svelte/transition";

  const { getMap } = getContext(key);
  const map = getMap();

  let zoom = 3.5,
    pitch;
  $: strokeWidth = 0.5 + 1.5 * (zoom / 3) * (zoom / 3);

  let simulation; // the force directed simulation

  let selected = new Set(),
    selectOn = false;
  const edgeMarkerPadding = 80;

  const top = edgeMarkerPadding + 10,
    left = edgeMarkerPadding,
    bottom = window.innerHeight - edgeMarkerPadding - 50,
    right = window.innerWidth - edgeMarkerPadding;

  let edgeMarkers = [];

  export let graphData = { nodes: [], links: [] }; // externally available graph object
  let graph = { nodes: [], links: [] }; // internal graph object for simulation and display

  onMount(() => {
    // Set up a listener to update the graph when the map moves
    map.on("move", function() {
      tick();
      // call it again to fix any holdover errors
    });

    map.on("moveend", function() {
      setTimeout(tick, 1000);
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
    setTimeout(tick, 200);
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
      const targetNeg = link.target.x < left || link.target.y < top;
      const targetPos = link.target.x > right || link.target.y > bottom;
      const targetOffScreen = targetNeg || targetPos;
      const sourceNeg = link.source.x < left || link.source.y < top;
      const sourcePos = link.source.x > right || link.source.y > bottom;
      const sourceOffScreen = sourceNeg || sourcePos;

      // one is on and one is off.
      const partiallyOffScreen = targetOffScreen != sourceOffScreen;
      if (partiallyOffScreen && visible) {
        let linkElement = document.getElementById("link-" + link.id);
        if (linkElement) {
          let lineLength = linkElement.getTotalLength();

          // check along line, progressing from on screen to off screen
          if (targetOffScreen) {
            for (let i = 0; i < lineLength; i += edgeMarkerPadding / 2)
              if (checkArcAt(i)) break;
          } else if (sourceOffScreen) {
            for (let i = lineLength; i > 0; i -= edgeMarkerPadding / 2)
              if (checkArcAt(i)) break;
          }

          function checkArcAt(i) {
            const pt = linkElement.getPointAtLength(i);
            const pointIsOffscreen =
              pt.x <= left || pt.x >= right || pt.y <= top || pt.y >= bottom;
            if (pointIsOffscreen) {
              var p2 = linkElement.getPointAtLength(i + 3);
              pt.deg = Math.atan2(pt.y - p2.y, pt.x - p2.x) * (180 / Math.PI);

              var textCheck = {
                x: pt.x + Math.cos(pt.deg) * edgeMarkerPadding * 2,
                y: pt.y + Math.sin(pt.deg) * edgeMarkerPadding * 2
              };

              const textCheckFail =
                textCheck.x < left ||
                textCheck.y < top ||
                textCheck.x > right ||
                textCheck.y > bottom;

              pt.textAnchor = textCheckFail ? "start" : "end";

              // Make text upright
              if (pt.deg > 90) pt.deg -= 180;
              if (pt.deg < -90) pt.deg += 180;

              pt.offscreenNodeLabel = targetOffScreen
                ? link.target.id
                : link.source.id;
              pt.linkID = "#link-" + link.id;
              pt.offset = i;
              edgeMarkers = [...edgeMarkers, pt];
            }
            return pointIsOffscreen;
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

    // const eastWest = vx > 0;
    if (vx > 0) {
      vpx *= 1.3;
      vpy *= 1.3;
    }

    pitchCorrection = pitchCorrection / (Math.PI / 2);
    let controlX = vx / 2 + vpx * pitchCorrection * pitch;
    let controlY = vy / 2 + vpy * pitchCorrection * pitch;
    path += "q " + controlX + " " + controlY + " " + vx + " " + vy;

    return path;
  }

  function handleClick(point) {
    if (selected.has(point.id)) selected.delete(point.id);
    else selected.add(point.id);
    selectOn = selected.size > 0;
    tick();
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
      <!-- https://gist.github.com/molily/60fe900634801560cbd6 -->
    </filter>
    <filter id="whiteShadow" x="0" y="0" width="200%" height="200%">
      <feMorphology
        in="SourceAlpha"
        operator="dilate"
        radius="2"
        result="dilated" />
      <feColorMatrix
        in="dilated"
        type="matrix"
        values="-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0"
        result="matrix" />
      <feGaussianBlur in="matrix" stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
            dur="3s"
            repeatCount="indefinite"
            from="-0.11"
            to="1" />
        </stop>
        <stop offset="-0.01" stop-color="white" stop-opacity="1">
          <animate
            attributeName="offset"
            dur="3s"
            repeatCount="indefinite"
            from="-0.01"
            to="1.1" />
        </stop>
        <stop offset="0.0" stop-color="white" stop-opacity="0.0">
          <animate
            attributeName="offset"
            dur="3s"
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
        {#if selectOn}
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
  {#if selectOn > 0}
    {#each edgeMarkers as mark}
      <text
        style="stroke: #000;"
        x={mark.x}
        y={mark.y}
        text-anchor={mark.textAnchor}
        transform={'rotate(' + mark.deg + ',' + mark.x + ',' + mark.y + ')'}
        font-size="1em"
        alignment-baseline="middle"
        filter="url(#whiteShadow)">
        {mark.offscreenNodeLabel}
      </text>
    {/each}
  {/if}
</svg>
