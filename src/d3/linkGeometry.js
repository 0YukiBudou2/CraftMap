import { DEFAULT_NODE_RADIUS } from "./nodeVisuals";
const ARROW_TARGET_GAP = 3;
const ARROW_HEAD_LENGTH = 7;
const ARROW_HEAD_HALF_WIDTH = 4;
const ARROW_SHAFT_HALF_WIDTH = 1.25;

function getArrowPath(source, target) {
  const startNode = source;
  const endNode = target;
  const dx = endNode.x - startNode.x;
  const dy = endNode.y - startNode.y;
  const distance = Math.hypot(dx, dy);

  if (!distance) {
    return "";
  }

  const unitX = dx / distance;
  const unitY = dy / distance;
  const normalX = -unitY;
  const normalY = unitX;
  const sourceOffset = startNode.nodeRadius ?? DEFAULT_NODE_RADIUS;
  const targetOffset =
    (endNode.nodeRadius ?? DEFAULT_NODE_RADIUS) + ARROW_TARGET_GAP;
  const arrowLength = distance - sourceOffset - targetOffset;

  if (arrowLength <= 0) {
    return "";
  }

  const startX = startNode.x + unitX * sourceOffset;
  const startY = startNode.y + unitY * sourceOffset;
  const tipX = endNode.x - unitX * targetOffset;
  const tipY = endNode.y - unitY * targetOffset;
  const headLength = Math.min(ARROW_HEAD_LENGTH, arrowLength * 0.45);
  const headHalfWidth = Math.min(ARROW_HEAD_HALF_WIDTH, arrowLength * 0.35);
  const shaftHalfWidth = Math.min(
    ARROW_SHAFT_HALF_WIDTH,
    headHalfWidth * 0.5
  );
  const headBaseX = tipX - unitX * headLength;
  const headBaseY = tipY - unitY * headLength;

  const points = [
    [startX + normalX * shaftHalfWidth, startY + normalY * shaftHalfWidth],
    [headBaseX + normalX * shaftHalfWidth, headBaseY + normalY * shaftHalfWidth],
    [headBaseX + normalX * headHalfWidth, headBaseY + normalY * headHalfWidth],
    [tipX, tipY],
    [headBaseX - normalX * headHalfWidth, headBaseY - normalY * headHalfWidth],
    [headBaseX - normalX * shaftHalfWidth, headBaseY - normalY * shaftHalfWidth],
    [startX - normalX * shaftHalfWidth, startY - normalY * shaftHalfWidth]
  ];

  return `M${points.map(point => point.join(",")).join("L")}Z`;
}

export function updateArrowPaths(link) {
  link
    .attr("d", d => getArrowPath(d.source, d.target));
}
