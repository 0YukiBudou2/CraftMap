import * as d3 from "d3";
import { getNodeColors } from "./colorMap";
import { updateArrowPaths } from "./linkGeometry";
import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_EDGE_OPACITY
} from "./linkVisuals";
import {
  DEFAULT_NODE_RADIUS,
  NODE_ICON_SCALE,
  SELECTED_NODE_RADIUS,
  TRAVERSAL_NODE_RADIUS,
  updateNodeVisualSizes
} from "./nodeVisuals";

function createLinks(container, links) {
  return container
    .append("g")
    .attr("class", "edges")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("class", "edge-arrow")
    .attr("fill", DEFAULT_EDGE_COLOR)
    .attr("fill-opacity", DEFAULT_EDGE_OPACITY);
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
      d.baseNodeRadius = DEFAULT_NODE_RADIUS;
      d.zoomNodeScale = 1;
      d.nodeRadius = DEFAULT_NODE_RADIUS;
    })
    .on("mouseover", function () {
      d3.select(this)
        .select(".node-background")
        .transition()
        .duration(100)
        .attr("stroke", "#333")
        .attr("stroke-width", d => {
          if (d.baseNodeRadius === SELECTED_NODE_RADIUS) return 4;
          if (d.baseNodeRadius === TRAVERSAL_NODE_RADIUS) return 3;
          return 2;
        });
    })
    .on("mouseout", function () {
      d3.select(this)
        .select(".node-background")
        .transition()
        .duration(100)
        .attr("stroke-width", d => {
          if (d.baseNodeRadius === SELECTED_NODE_RADIUS) return 3;
          if (d.baseNodeRadius === TRAVERSAL_NODE_RADIUS) return 2;
          return 1;
        });
    })
    .on("click", (event, d) => {
      event.preventDefault();
      onNodeClick(d.id);
    });

  node
    .append("circle")
    .attr("class", "node-base")
    .attr("r", DEFAULT_NODE_RADIUS)
    .attr("fill", "#fff")
    .attr("fill-opacity", 0.94);

  node
    .append("circle")
    .attr("class", "node-background")
    .attr("r", DEFAULT_NODE_RADIUS)
    .attr("fill", d => getNodeColors(d.colorGroup).fill)
    .attr("fill-opacity", 0.72)
    .attr("stroke", d => getNodeColors(d.colorGroup).stroke)
    .attr("stroke-opacity", 0.9)
    .attr("stroke-width", 1);

  node
    .filter(d => Boolean(d.imageUrl))
    .append("image")
    .attr("class", "node-icon")
    .attr("href", d => d.imageUrl)
    .attr("x", -(DEFAULT_NODE_RADIUS * NODE_ICON_SCALE / 2))
    .attr("y", -(DEFAULT_NODE_RADIUS * NODE_ICON_SCALE / 2))
    .attr("width", DEFAULT_NODE_RADIUS * NODE_ICON_SCALE)
    .attr("height", DEFAULT_NODE_RADIUS * NODE_ICON_SCALE)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("pointer-events", "none");

  node
    .append("title")
    .text(d => d.label);

  return node;
}

function createZoom(svg, container, node, link) {
  let resizeFrame = null;
  let pendingZoomScale = 1;

  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .clickDistance(4)
    .on("zoom", (event) => {
      container.attr("transform", event.transform);

      pendingZoomScale = event.transform.k;
      if (resizeFrame !== null) return;

      resizeFrame = requestAnimationFrame(() => {
        updateNodeVisualSizes(node, pendingZoomScale);
        updateArrowPaths(link);
        resizeFrame = null;
      });
    });

  svg.call(zoom);

  return zoom;
}

function positionGraph(node, link) {
  node.attr("transform", d => `translate(${d.x},${d.y})`);
  updateArrowPaths(link);
}

export function createGraph({
  svgRef,
  nodes,
  links,
  onNodeClick,
  containerRef,
  nodeRef,
  linkRef,
  zoomRef
}) {

  const svg = d3.select(svgRef.current);

  svg.selectAll("*").remove();

  const container = svg.append("g");

  const link =
    createLinks(container, links);

  const node =
    createNodes(container, nodes, onNodeClick);

  const zoom =
    createZoom(svg, container, node, link);

  positionGraph(node, link);

  containerRef.current = container;
  nodeRef.current = node;
  linkRef.current = link;
  zoomRef.current = zoom;
}
