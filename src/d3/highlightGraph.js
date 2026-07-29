import { colorMap } from "./colorMap";

function resetGraphStyle(node, link, visibleGroups) {

  node
    .attr("r", 5)
    .attr("fill", d => colorMap[d.colorGroup] ?? colorMap.other)
    .attr("opacity", d =>
      getDefaultNodeOpacity(d, visibleGroups)
    );

  link
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("opacity", d =>
      getDefaultLinkOpacity(d, visibleGroups)
    );

}
function getNodeRadius(node, selectedNode) {

  if (node.id === selectedNode.id) {
    return 10;
  }

  if (selectedNode.connectedNodes.has(node.id)) {
    return 6;
  }

  return 5;

}
function getNodeColor(node, selectedNode) {

  if (node.id === selectedNode.id) {
    return "#ff9800";
  }

  if (selectedNode.connectedNodes.has(node.id)) {
    return "#2196f3";
  }

  return "#cccccc";

}
function getNodeOpacity(node, selectedNode) {

  if (selectedNode.connectedNodes.has(node.id)) {
    return 1;
  }

  return 0.2;

}
function updateNodeStyle(node, selectedNode) {

  node
    .attr("r", d => getNodeRadius(d, selectedNode))
    .attr("fill", d => getNodeColor(d, selectedNode))
    .attr("opacity", d => getNodeOpacity(d, selectedNode));

}
function isSelectedLink(link, selectedNode) {

  const source = link.source.id;
  const target = link.target.id;

  return (
    source === selectedNode.id ||
    target === selectedNode.id
  );

}
function updateLinkStyle(link, selectedNode) {

  link
    .attr("stroke", d =>
      isSelectedLink(d, selectedNode)
        ? "red"
        : "#cccccc"
    )
    .attr("stroke-width", d =>
      isSelectedLink(d, selectedNode)
        ? 3
        : 1
    )
    .attr("opacity", d =>
      isSelectedLink(d, selectedNode)
        ? 1
        : 0.1
    );

}
function getDefaultNodeOpacity(node, visibleGroups) {
  return visibleGroups.has(node.colorGroup)
    ? 1
    : 0.08;
}
function getDefaultLinkOpacity(link, visibleGroups) {
  const sourceVisible =
    visibleGroups.has(link.source.colorGroup);

  const targetVisible =
    visibleGroups.has(link.target.colorGroup);

  return sourceVisible && targetVisible
    ? 0.6
    : 0.05;
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
    resetGraphStyle(node, link, visibleGroups);
    return;
    }
  updateNodeStyle(node, selectedNode,visibleGroups);
  updateLinkStyle(link, selectedNode,visibleGroups);
}