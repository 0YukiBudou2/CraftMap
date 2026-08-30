export function getNode(nodeId, allNodes) {
  return allNodes.find(node => node.id === nodeId);
}

export function getIngredients(nodeId, allLinks, nodeMap) {

  return allLinks
    .filter(link => {

      const target =
        typeof link.target === "object"
          ? link.target.id
          : link.target;

      return target === nodeId;

    })
    .map(link => {

      const source =
        typeof link.source === "object"
          ? link.source.id
          : link.source;

      return {
        id: source,
        label: nodeMap.get(source)?.label
      };

    });

}

export function getProducts(nodeId, allLinks, nodeMap) {

  return allLinks
    .filter(link => {

      const source =
        typeof link.source === "object"
          ? link.source.id
          : link.source;

      return source === nodeId;

    })
    .map(link => {

      const target =
        typeof link.target === "object"
          ? link.target.id
          : link.target;

      return {
        id: target,
        label: nodeMap.get(target)?.label
      };

    });

}

function getEndpointId(endpoint) {
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

function isTagNode(nodeId) {
  return nodeId.startsWith("#");
}

export function getTraversal(nodeId, allLinks, mode) {
  const traversalNodeIds = new Set([nodeId]);
  const traversalLinks = new Set();

  if (mode === "products") {
    allLinks.forEach(link => {
      const source = getEndpointId(link.source);

      if (source !== nodeId) return;

      traversalLinks.add(link);
      traversalNodeIds.add(getEndpointId(link.target));
    });

    return { traversalNodeIds, traversalLinks };
  }

  const ingredientsByProduct = new Map();
  allLinks.forEach(link => {
    const target = getEndpointId(link.target);
    const ingredients = ingredientsByProduct.get(target) ?? [];

    ingredients.push({ nodeId: getEndpointId(link.source), link });
    ingredientsByProduct.set(target, ingredients);
  });

  const pendingNodeIds = [nodeId];
  let queueIndex = 0;

  while (queueIndex < pendingNodeIds.length) {
    const currentNodeId = pendingNodeIds[queueIndex];
    queueIndex += 1;

    (ingredientsByProduct.get(currentNodeId) ?? []).forEach(({
      nodeId: ingredientId,
      link
    }) => {
      if (isTagNode(ingredientId) || traversalNodeIds.has(ingredientId)) {
        return;
      }

      traversalNodeIds.add(ingredientId);
      traversalLinks.add(link);
      pendingNodeIds.push(ingredientId);
    });
  }

  return { traversalNodeIds, traversalLinks };
}
