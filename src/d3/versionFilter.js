export function updateVersionFilter({
  node,
  link,
  visibleGroups,
  selectedNode
}) {

  if (!node || !link) return;

  node.each(d => {
  if (d.colorGroup === "other") {
    console.log("OTHER:", d.id);
  }
});
  node
    .attr("opacity", d => {

      const visible =
        visibleGroups.has(d.colorGroup);

      if (!visible) return 0.08;

      if (!selectedNode) return 1;

      return selectedNode.connectedNodes.has(d.id)
        ? 1
        : 0.2;
    })
    .style("pointer-events", d =>
      visibleGroups.has(d.colorGroup)
        ? "auto"
        : "none"
    );

  link
    .attr("opacity", d => {

      const visible =
        visibleGroups.has(d.source.colorGroup) &&
        visibleGroups.has(d.target.colorGroup);

      if (!visible) return 0.05;

      if (!selectedNode) return 0.6;

      return (
        d.source.id === selectedNode.id ||
        d.target.id === selectedNode.id
      )
        ? 1
        : 0.1;
    });

}