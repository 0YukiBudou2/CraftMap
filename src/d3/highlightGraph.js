import { getNodeColors } from "./colorMap";
import { updateArrowPaths } from "./linkGeometry";
import {
  DEFAULT_NODE_RADIUS,
  SELECTED_NODE_RADIUS,
  TRAVERSAL_NODE_RADIUS,
  updateNodeVisualSizes
} from "./nodeVisuals";

function setNodeRadius(node, getRadius) {
  node.each(d => {
    d.baseNodeRadius = getRadius(d);
  });

  const zoomScale = node.datum()?.zoomScale ?? 1;
  updateNodeVisualSizes(node, zoomScale);
}

function resetGraphStyle(node, link) {

  setNodeRadius(node, () => DEFAULT_NODE_RADIUS);

  node
    .select(".node-background")
    .attr("fill", d => getNodeColors(d.colorGroup).fill)
    .attr("fill-opacity", 0.72)
    .attr("stroke", d => getNodeColors(d.colorGroup).stroke)
    .attr("stroke-opacity", 0.9)
    .attr("stroke-width", 1);

  link
    .attr("fill", "#999")
    .attr("fill-opacity", 0.6);

  updateArrowPaths(link);

}
function getNodeRadius(node, selectedNode) {

  if (node.id === selectedNode.id) {
    return SELECTED_NODE_RADIUS;
  }

  if (selectedNode.traversalNodeIds.has(node.id)) {
    return TRAVERSAL_NODE_RADIUS;
  }

  return DEFAULT_NODE_RADIUS;

}
function updateNodeStyle(node, selectedNode) {

  setNodeRadius(node, d => getNodeRadius(d, selectedNode));

  node
    .select(".node-background")
    .attr("fill", d => getNodeColors(d.colorGroup).fill)
    .attr("fill-opacity", 0.72)
    .attr("stroke", d => getNodeColors(d.colorGroup).stroke)
    .attr("stroke-opacity", 0.9)
    .attr("stroke-width", d => {
      if (d.id === selectedNode.id) return 3;
      if (selectedNode.traversalNodeIds.has(d.id)) return 2;
      return 1;
    });

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
