export function getNode(nodeId, allNodes) {
  return allNodes.find(node => node.id === nodeId);
}

function getRelatedItems(nodeId, allLinks, nodeMap, direction) {
  const relatedItems = new Map();

  allLinks.forEach(link => {
    const source = getEndpointId(link.source);
    const target = getEndpointId(link.target);
    const matches = direction === "ingredients"
      ? target === nodeId
      : source === nodeId;

    if (!matches) return;

    const relatedId = direction === "ingredients" ? source : target;
    const node = nodeMap.get(relatedId);
    const item = relatedItems.get(relatedId) ?? {
      id: relatedId,
      label: node?.label ?? relatedId,
      imageUrl: node?.imageUrl,
      craftMethods: new Set()
    };

    item.craftMethods.add(link.type || "unknown");
    relatedItems.set(relatedId, item);
  });

  return [...relatedItems.values()].map(item => ({
    ...item,
    craftMethods: [...item.craftMethods]
  }));
}

export function getIngredients(nodeId, allLinks, nodeMap) {
  return getRelatedItems(nodeId, allLinks, nodeMap, "ingredients");
}

export function getProducts(nodeId, allLinks, nodeMap) {
  return getRelatedItems(nodeId, allLinks, nodeMap, "products");
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
