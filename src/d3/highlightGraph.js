function resetGraphStyle(node, link) {

  node
    .attr("r", 5)
    .attr("fill", "#69b3a2")
    .attr("opacity", 1);

  link
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("opacity", 0.6);

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
export function highlightGraph({
  node,
  link,
  selectedNode
}) {

  if (!node || !link) {
    return;
  }

  if (!selectedNode) {
    resetGraphStyle(node, link);
    return;
    }
  updateNodeStyle(node, selectedNode);
  updateLinkStyle(link, selectedNode);
}