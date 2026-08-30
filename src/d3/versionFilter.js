export function updateVersionFilter({
  node,
  link,
  visibleGroups,
  selectedNode
}) {

  if (!node || !link) return;

  node
    .attr("opacity", d => {

      const visible =
        visibleGroups.has(d.colorGroup);

      if (!visible) return 0.08;

      if (!selectedNode) return 1;

      return selectedNode.traversalNodeIds.has(d.id)
        ? 1
        : 0.08;
    })
    .style("pointer-events", d =>
      visibleGroups.has(d.colorGroup)
        ? "auto"
        : "none"
    );

  link
    .attr("opacity", d => {

      if (selectedNode && !selectedNode.traversalLinks.has(d)) {
        return 0;
      }

      const visible =
        visibleGroups.has(d.source.colorGroup) &&
        visibleGroups.has(d.target.colorGroup);

      if (!visible) return 0.05;

      if (!selectedNode) return 1;

      return 1;
    });

}
