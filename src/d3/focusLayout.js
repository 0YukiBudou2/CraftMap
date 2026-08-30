import * as d3 from "d3";
import { updateArrowPaths } from "./linkGeometry";

const FOCUS_LINK_DISTANCE = 75;
const FOCUS_CHARGE_STRENGTH = -100;
const ANCHOR_STRENGTH = 0.06;
const COLLISION_PADDING = 6;
const RESTORE_DURATION = 500;

function cancelActiveLayout(controller) {
  controller.simulation?.stop();
  controller.simulation = null;

  if (controller.animationFrame !== null) {
    cancelAnimationFrame(controller.animationFrame);
    controller.animationFrame = null;
  }
}

function getRelatedLinks(link, nodeIds) {
  return link.filter(d =>
    nodeIds.has(d.source.id) || nodeIds.has(d.target.id)
  );
}

function positionNodes(node, nodeIds) {
  node
    .filter(d => nodeIds.has(d.id))
    .attr("transform", d => `translate(${d.x},${d.y})`);
}

function moveNodesToBase(nodes, nodeIds) {
  nodes.forEach(node => {
    if (!nodeIds.has(node.id)) return;

    node.x = node.baseX;
    node.y = node.baseY;
    node.vx = 0;
    node.vy = 0;
    node.fx = null;
    node.fy = null;
  });
}

export function createFocusLayoutController() {
  return {
    simulation: null,
    animationFrame: null,
    movedNodeIds: new Set()
  };
}

export function startFocusLayout({
  controller,
  nodes,
  node,
  link,
  selectedNode
}) {
  cancelActiveLayout(controller);

  if (controller.movedNodeIds.size > 0) {
    const previousNodeIds = new Set(controller.movedNodeIds);
    moveNodesToBase(nodes, previousNodeIds);
    positionNodes(node, previousNodeIds);
    updateArrowPaths(getRelatedLinks(link, previousNodeIds));
  }

  const focusNodeIds = new Set(selectedNode.traversalNodeIds);
  focusNodeIds.add(selectedNode.id);

  const focusNodes = nodes.filter(item => focusNodeIds.has(item.id));
  if (focusNodes.length === 0) {
    controller.movedNodeIds = new Set();
    return;
  }

  const focusLinks = [...selectedNode.traversalLinks]
    .filter(item =>
      focusNodeIds.has(item.source.id) && focusNodeIds.has(item.target.id)
    )
    .map(item => ({ source: item.source, target: item.target }));
  const relatedLinks = getRelatedLinks(link, focusNodeIds);
  const anchorById = new Map(
    focusNodes.map(item => [item.id, { x: item.baseX, y: item.baseY }])
  );
  const centerNode = focusNodes.find(item => item.id === selectedNode.id);

  moveNodesToBase(nodes, focusNodeIds);
  centerNode.fx = centerNode.baseX;
  centerNode.fy = centerNode.baseY;
  controller.movedNodeIds = focusNodeIds;

  const simulation = d3.forceSimulation(focusNodes)
    .force(
      "link",
      d3.forceLink(focusLinks)
        .id(item => item.id)
        .distance(FOCUS_LINK_DISTANCE)
        .strength(0.7)
    )
    .force("charge", d3.forceManyBody().strength(FOCUS_CHARGE_STRENGTH))
    .force(
      "collision",
      d3.forceCollide(item => item.nodeRadius + COLLISION_PADDING)
        .strength(1)
        .iterations(2)
    )
    .force(
      "anchorX",
      d3.forceX(item => anchorById.get(item.id).x).strength(ANCHOR_STRENGTH)
    )
    .force(
      "anchorY",
      d3.forceY(item => anchorById.get(item.id).y).strength(ANCHOR_STRENGTH)
    )
    .on("tick", () => {
      positionNodes(node, focusNodeIds);
      updateArrowPaths(relatedLinks);
    })
    .on("end", () => {
      controller.simulation = null;
    });

  controller.simulation = simulation;
}

export function restoreFocusLayout({ controller, nodes, node, link }) {
  cancelActiveLayout(controller);

  const movedNodeIds = new Set(controller.movedNodeIds);
  if (movedNodeIds.size === 0) return;

  const movingNodes = nodes
    .filter(item => movedNodeIds.has(item.id))
    .map(item => ({
      node: item,
      startX: item.x,
      startY: item.y
    }));
  const relatedLinks = getRelatedLinks(link, movedNodeIds);
  const startTime = performance.now();

  function animate(currentTime) {
    const progress = Math.min((currentTime - startTime) / RESTORE_DURATION, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    movingNodes.forEach(({ node: item, startX, startY }) => {
      item.x = startX + (item.baseX - startX) * easedProgress;
      item.y = startY + (item.baseY - startY) * easedProgress;
    });

    positionNodes(node, movedNodeIds);
    updateArrowPaths(relatedLinks);

    if (progress < 1) {
      controller.animationFrame = requestAnimationFrame(animate);
      return;
    }

    moveNodesToBase(nodes, movedNodeIds);
    controller.movedNodeIds = new Set();
    controller.animationFrame = null;
  }

  controller.animationFrame = requestAnimationFrame(animate);
}

export function stopFocusLayout(controller) {
  cancelActiveLayout(controller);
}
