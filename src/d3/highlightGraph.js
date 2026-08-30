import { colorMap } from "./colorMap";
import { DEFAULT_NODE_RADIUS, updateArrowPaths } from "./linkGeometry";

function setNodeRadius(node, getRadius) {
  node.each(d => {
    d.nodeRadius = getRadius(d);
  });

  node
    .select(".node-background")
    .attr("r", d => d.nodeRadius);

  resizeNodeIcons(node, d => d.nodeRadius);
}

function resetGraphStyle(node, link) {

  setNodeRadius(node, () => DEFAULT_NODE_RADIUS);

  node
    .select(".node-background")
    .attr("fill", d => colorMap[d.colorGroup] ?? colorMap.other);

  link
    .attr("fill", "#999")
    .attr("fill-opacity", 0.6);

  updateArrowPaths(link);

}
function getNodeRadius(node, selectedNode) {

  if (node.id === selectedNode.id) {
    return 10;
  }

  if (selectedNode.traversalNodeIds.has(node.id)) {
    return 6;
  }

  return 5;

}
function getNodeColor(node, selectedNode) {

  if (node.id === selectedNode.id) {
    return "#ff9800";
  }

  if (selectedNode.traversalNodeIds.has(node.id)) {
    return "#2196f3";
  }

  return "#cccccc";

}
function updateNodeStyle(node, selectedNode) {

  setNodeRadius(node, d => getNodeRadius(d, selectedNode));

  node
    .select(".node-background")
    .attr("fill", d => getNodeColor(d, selectedNode));

}

function resizeNodeIcons(node, getRadius) {
  node
    .select(".node-icon")
    .attr("x", d => -(getRadius(d) * 0.75))
    .attr("y", d => -(getRadius(d) * 0.75))
    .attr("width", d => getRadius(d) * 1.5)
    .attr("height", d => getRadius(d) * 1.5);
}
function isSelectedLink(link, selectedNode) {
  return selectedNode.traversalLinks.has(link);

}
function updateLinkStyle(link, selectedNode) {

  link
    .attr("fill", d =>
      isSelectedLink(d, selectedNode)
        ? "red"
        : "#cccccc"
    )
    .attr("fill-opacity", d =>
      isSelectedLink(d, selectedNode)
        ? 1
        : 0.6
    );

  updateArrowPaths(link);

}
export function highlightGraph({
  node,
  link,
  selectedNode,
  visibleGroups
}) {

  if (!node || !link) {
    return;
  }

  if (!selectedNode) {
    resetGraphStyle(node, link);
    return;
    }
  updateNodeStyle(node, selectedNode,visibleGroups);
  updateLinkStyle(link, selectedNode);
}
