<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  var width = 800;
  var height = 600;
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  export let graph = {};
  let simulation, adjlist, svg, container, link, node;

  let loaded = false;

  onMount(async () => {
    onFirstLoad();
    loaded = true;
    update(graph);
  });

  $: update(graph);

  function onFirstLoad() {
    simulation = d3
      .forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-2000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.2))
      .force("y", d3.forceY(height / 2).strength(0.2))
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

    svg = d3
      .select("#graph")
      .attr("width", width)
      .attr("height", height);
    container = svg.append("g");
    link = container
      .append("g")
      .attr("stroke", "#000")
      .attr("class", "link")
      .attr("stroke-width", 1.5)
      .selectAll("link");

    node = container
      .append("g")
      .attr("class", "node")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll(".node");

    svg
      .call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on("zoom", function() {
            container.attr("transform", d3.event.transform);
          })
      )
      .on("dblclick.zoom", null);
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
      .attr("opacity", d => {
        return d.data.prob;
      })
      .merge(link);

    // update nodes
    node = node.data(graph.nodes, d => d.id);
    node.exit().remove();
    node = node
      .enter()
      .append("circle")
      .attr("r", 8)
      .merge(node);

    // Update and restart the simulation.
    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
    nodeSettings();
    simulation.alpha(0.3).restart();
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
    node.attr("transform", function(d) {
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });
  }

  function dblclick(d) {
    d3.select(this).classed("fixed", (d.fixed = false));
    d.fx = null;
    d.fy = null;
  }

  function fixna(x) {
    if (isFinite(x)) return x;
    return 0;
  }

  function focus(d) {
    var id = d3.select(d3.event.target).datum().id;
    node.style("opacity", function(o) {
      return neigh(id, o.id) ? 1 : 0.1;
    });
    link.style("opacity", function(o) {
      return o.source.id == id || o.target.id == id ? 1 : 0.0;
    });
  }

  function unfocus() {
    node.style("opacity", 1);
    link.style("opacity", d => {
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
</script>

<style>
  #graph {
    height: 100vh;
    width: 100vw;
  }
</style>

<svg id="graph" />
