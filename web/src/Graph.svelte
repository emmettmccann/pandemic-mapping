<script>
  import * as d3 from "d3";
  import { onMount, getContext } from "svelte";
  import { mapbox, key } from "./mapbox.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  var width, height;
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  export let graph = {};
  let simulation,
    adjlist,
    svg,
    container,
    link,
    transmission,
    node,
    nodeLabel,
    tooltip;

  let loaded = false;
  let map = {};
  let mark;

  let m = 0;
  let mInterval = setInterval(() => {
    console.log("interval running");
  }, 10000);

  onMount(async () => {
    onFirstLoad();
    loaded = true;
    // update(graph);
  });

  $: update(graph);
  // $: (() => {
  //   if (loaded) ticked();
  // })(map);

  function onFirstLoad() {
    svg = d3.select("#graph");
    width = window.innerWidth;
    height = window.innerHeight;
    console.log(width);

    simulation = d3
      .forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-2000))
      // .force("center", d3.forceCenter(width / 3, height / 3))
      .force("x", d3.forceX(width / 3).strength(0.2))
      .force("y", d3.forceY(height / 3).strength(0.05))
      .force(
        "link",
        d3
          .forceLink(graph.links)
          .id(function(d) {
            return d.id;
          })
          .distance(50)
          .strength(1)
      )
      .on("tick", ticked);

    container = svg.append("g");
    link = container
      .append("g")
      .attr("class", "link")
      .selectAll("link");

    transmission = container
      .append("g")
      .attr("class", "link")
      .selectAll("link");

    node = container
      .append("g")
      .attr("class", "node")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll(".node");

    nodeLabel = container
      .append("g")
      .attr("class", "node")
      .attr("stroke", "transparent")
      .attr("fill", "#fff")
      .selectAll(".nodeLabel");

    setTimeout(() => {
      const { getMap } = getContext(key);
      map = getMap();
      dispatch("ready");
      alert("Map is loaded");
      map.on("render", () => {
        console.log("ticking");

        persist();
      });
    }, 2000);

    tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "100")
      .style("visibility", "hidden")
      // .style("background", "#000")
      .style("font-weight", 700)
      .text("a simple tooltip");

    // svg
    //   .call(
    //     d3
    //       .zoom()
    //       .scaleExtent([0.1, 4])
    //       .on("zoom", function() {
    //         container.attr("transform", d3.event.transform);
    //       })
    //   )
    //   .on("dblclick.zoom", null);
  }

  function persist() {
    simulation.alphaTarget(simulation.alpha());
  }

  function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
  }

  function nodeSettings() {
    node.on("mouseover", focus).on("mouseout", unfocus);
    node.on("dblclick", dblclick);

    node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    node.on("mouseover", focus).on("mouseout", unfocus);
  }

  function update(newGraph) {
    if (!loaded) return;

    const old = new Map(node.data().map(d => [d.id, d]));
    graph.nodes = graph.nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    graph.links = graph.links.map(d => Object.assign({}, d));

    adjlist = [];
    newGraph.links.forEach(function(d) {
      adjlist[d.source + "-" + d.target] = true;
      adjlist[d.target + "-" + d.source] = true;
    });

    // update links
    link = link.data(graph.links, d => {
      return d.source.id + "-" + d.target.id;
    });
    link.exit().remove();
    link = link
      .enter()
      .append("line")
      .attr("stroke", "#000")
      .attr("stroke-weight", 1.5)
      .attr("opacity", d => {
        return d.data.prob;
      })
      .merge(link);

    transmission = transmission.data(graph.links, d => {
      return d.source.id + "-" + d.target.id;
    });
    transmission.exit().remove();
    transmission = transmission
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", "#ff0000")
      .attr("opacity", d => {
        return d.data.prob;
      })
      .merge(transmission);

    // update nodes
    node = node.data(graph.nodes, d => d.id);
    node
      .exit()
      .each(removeMapMarker)
      .remove();
    node = node
      .enter()
      .append("circle")
      .attr("r", 12)
      .attr("stroke", "transparent")
      .attr("opacity", 0.8)
      .each(addMapMarker)
      .on("mousemove", function() {
        return tooltip
          .style("top", d3.event.pageY - 30 + "px")
          .style("left", d3.event.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      })
      .merge(node);

    // update labels
    nodeLabel = nodeLabel.data(graph.nodes, d => d.id);
    nodeLabel
      .exit()
      .each(removeMapMarker)
      .remove();
    nodeLabel = nodeLabel
      .enter()
      .append("text")
      .attr("dx", function(d) {
        return -7;
      })
      .attr("dy", function(d) {
        return 3;
      })
      .text(function(d) {
        return d.id;
      })
      .attr("font-size", "10px")
      .attr("stroke", "transparent")
      .attr("fill", "#fff")
      .attr("pointer-events", "none")
      .attr("opacity", 1)
      .each(addMapMarker)
      .merge(nodeLabel);

    console.log(graph.nodes);

    // Update and restart the simulation.
    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
    nodeSettings();
    simulation.alpha(0.3).restart();

    clearInterval(mInterval);
    mInterval = setInterval(() => {
      m += 0.01;
      if (m > 1) m = 0;
      persist();
    }, 20);
  }

  function ticked() {
    link
      .attr("x1", function(d) {
        return fixna(d.source.x);
      })
      .attr("y1", function(d) {
        return fixna(d.source.y);
      })
      .attr("x2", function(d) {
        return fixna(d.target.x);
      })
      .attr("y2", function(d) {
        return fixna(d.target.y);
      });
    transmission.attr("transform", calcPosition);
    node.attr("transform", function(d) {
      if (d.locFix) {
        let x = d.marker._pos.x,
          y = d.marker._pos.y;
        d.fy = y;
        d.fx = x;
      } else {
        d.fx = null;
        d.fy = null;
      }
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });
    nodeLabel.attr("transform", function(d) {
      if (d.locFix) {
        let x = d.marker._pos.x,
          y = d.marker._pos.y;
        d.fy = y;
        d.fx = x;
      } else {
        d.fx = null;
        d.fy = null;
      }
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

  function focus(d) {
    tooltip.text(d.name);
    tooltip.style("visibility", "visible");
    tooltip.style("opacity", 1);
    var id = d3.select(d3.event.target).datum().id;
    node.style("opacity", function(o) {
      return neigh(id, o.id) ? 0.8 : 0.1;
    });
    link.style("opacity", function(o) {
      return o.source.id == id || o.target.id == id ? o.data.prob : 0.0;
    });
    transmission.style("opacity", function(o) {
      return o.source.id == id || o.target.id == id ? o.data.prob : 0.0;
    });
  }

  function unfocus() {
    tooltip.style("visibility", "hidden");
    node.style("opacity", 0.8);
    link.style("opacity", d => {
      return d.data.prob;
    });
    transmission.style("opacity", d => {
      return d.data.prob;
    });
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("fixed", (d.fixed = true));
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
  }

  function addMapMarker(d, i) {
    d.marker = new mapbox.Marker(mark).setLngLat([d.lat, d.lon]).addTo(map);
  }

  function removeMapMarker(d, i) {
    d.marker.remove();
  }

  function calcPosition(d) {
    let yMove = d.target.y - d.source.y;
    let xMove = d.target.x - d.source.x;
    let yOffset = yMove * m;
    let xOffset = xMove * m;
    let yPos = d.source.y + yOffset;
    let xPos = d.source.x + xOffset;
    return "translate(" + fixna(xPos) + "," + fixna(yPos) + ")";
  }
</script>

<style>
  #graph {
    position: absolute;
    top: 0px;
    left: 25vw;
    height: 100vh;
    width: 75vw;
    z-index: 0;
    pointer-events: none;
  }

  :global(#graph > *) {
    pointer-events: all !important;
  }
</style>

<svg id="graph" />
<div bind:this={mark} style="position: absolute; width: 0px; height: 0px;" />
