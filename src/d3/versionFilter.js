export function updateVersionFilter({
  node,
  link,
  visibleGroups
}) {

  if (!node || !link) return;

  node
    .attr("opacity", d =>
      visibleGroups.has(d.colorGroup)
        ? 1
        : 0.08
    )
    .style("pointer-events", d =>
      visibleGroups.has(d.colorGroup)
        ? "auto"
        : "none"
    );

  link
    .attr("opacity", d => {
      const sourceVisible =
        visibleGroups.has(d.source.colorGroup);

      const targetVisible =
        visibleGroups.has(d.target.colorGroup);

      return sourceVisible && targetVisible
        ? 0.6
        : 0.05;
    });
}