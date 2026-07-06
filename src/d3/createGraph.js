import * as d3 from "d3";

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
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6);
}

function createNodes(container, nodes, onNodeClick) {
  const node = container
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "#69b3a2")
    .on("mouseover", function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("stroke-width", 0);
    })
    .on("click", (event, d) => {
      onNodeClick(d.id);
    });

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

    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

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