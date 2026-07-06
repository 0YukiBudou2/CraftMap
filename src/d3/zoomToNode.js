import * as d3 from "d3";

export function zoomToNode({
  svgRef,
  zoomRef,
  nodes,
  nodeId
}) {

  const node = nodes.find(n => n.id === nodeId);

  if (
    !node ||
    node.x === undefined ||
    node.y === undefined
  ) {
    return;
  }

  const svg = d3.select(svgRef.current);

  const width = svgRef.current.clientWidth;
  const height = svgRef.current.clientHeight;

  const currentTransform =
    d3.zoomTransform(svgRef.current);

  const scale =
    Math.max(currentTransform.k, 1.3);

  const transform = d3.zoomIdentity
    .translate(
      width / 2 - node.x * scale,
      height / 2 - node.y * scale
    )
    .scale(scale);

  svg
    .transition()
    .duration(750)
    .call(
      zoomRef.current.transform,
      transform
    );

}