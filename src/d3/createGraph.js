import * as d3 from "d3";
import { colorMap } from "./colorMap";
import { DEFAULT_NODE_RADIUS, updateArrowPaths } from "./linkGeometry";

function createSimulation(nodes, links, width, height) {
  return d3.forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links)
        .id(d => d.id)
        .distance(50)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));
}

function createLinks(container, links) {
  return container
    .append("g")
    .attr("class", "edges")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("class", "edge-arrow")
    .attr("fill", "#999")
    .attr("fill-opacity", 0.6);
}

function createNodes(container, nodes, onNodeClick) {
  const node = container
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .each(d => {
      d.nodeRadius = DEFAULT_NODE_RADIUS;
    })
    .on("mouseover", function () {
      d3.select(this)
        .select(".node-background")
        .transition()
        .duration(100)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    })
    .on("mouseout", function () {
      d3.select(this)
        .select(".node-background")
        .transition()
        .duration(100)
        .attr("stroke-width", 0);
    })
    .on("click", (event, d) => {
      onNodeClick(d.id);
    });

  node
    .append("circle")
    .attr("class", "node-background")
    .attr("r", DEFAULT_NODE_RADIUS)
    .attr("fill", d => colorMap[d.colorGroup] ?? colorMap.other);

  node
    .filter(d => Boolean(d.imageUrl))
    .append("image")
    .attr("class", "node-icon")
    .attr("href", d => d.imageUrl)
    .attr("x", -3.75)
    .attr("y", -3.75)
    .attr("width", 7.5)
    .attr("height", 7.5)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("pointer-events", "none");

  node
    .append("title")
    .text(d => d.label);

  return node;
}

function createZoom(svg, container) {
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => {
      container.attr("transform", event.transform);
    });

  svg.call(zoom);

  return zoom;
}

function registerTick(simulation, node, link) {
  simulation.on("tick", () => {

    updateArrowPaths(link);

    node
      .attr("transform", d => `translate(${d.x},${d.y})`);

  });
}

export function createGraph({
  svgRef,
  nodes,
  links,
  onNodeClick,
  containerRef,
  nodeRef,
  linkRef,
  zoomRef,
  simulationRef
}) {

  const svg = d3.select(svgRef.current);

  svg.selectAll("*").remove();

  const width = svgRef.current.clientWidth;
  const height = svgRef.current.clientHeight;

  const container = svg.append("g");

  const simulation =
    createSimulation(nodes, links, width, height);

  const link =
    createLinks(container, links);

  const node =
    createNodes(container, nodes, onNodeClick);

  const zoom =
    createZoom(svg, container);

  registerTick(
    simulation,
    node,
    link
  );

  containerRef.current = container;
  nodeRef.current = node;
  linkRef.current = link;
  zoomRef.current = zoom;
  simulationRef.current = simulation;
}
