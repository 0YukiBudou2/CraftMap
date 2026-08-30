export const DEFAULT_NODE_RADIUS = 9;
export const TRAVERSAL_NODE_RADIUS = 12;
export const SELECTED_NODE_RADIUS = 16;
export const NODE_ICON_SCALE = 1.55;

const MIN_ZOOM_NODE_SCALE = 0.8;
const MAX_ZOOM_NODE_SCALE = 2;

export function getZoomNodeScale(zoomScale) {
  return Math.max(
    MIN_ZOOM_NODE_SCALE,
    Math.min(Math.sqrt(zoomScale), MAX_ZOOM_NODE_SCALE)
  );
}

export function updateNodeVisualSizes(node, zoomScale) {
  const nodeScale = getZoomNodeScale(zoomScale);

  node.each(d => {
    d.zoomScale = zoomScale;
    d.zoomNodeScale = nodeScale;
    d.nodeRadius = (d.baseNodeRadius ?? DEFAULT_NODE_RADIUS) * nodeScale;
  });

  node
    .selectAll(".node-base, .node-background")
    .attr("r", d => d.nodeRadius);

  node
    .select(".node-icon")
    .attr("x", d => -(d.nodeRadius * NODE_ICON_SCALE / 2))
    .attr("y", d => -(d.nodeRadius * NODE_ICON_SCALE / 2))
    .attr("width", d => d.nodeRadius * NODE_ICON_SCALE)
    .attr("height", d => d.nodeRadius * NODE_ICON_SCALE);
}
