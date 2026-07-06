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

export function getConnectedNodes(nodeId, allLinks) {

  const connectedNodes = new Set();

  connectedNodes.add(nodeId);

  allLinks.forEach(link => {

    const source =
      typeof link.source === "object"
        ? link.source.id
        : link.source;

    const target =
      typeof link.target === "object"
        ? link.target.id
        : link.target;

    if (source === nodeId) {
      connectedNodes.add(target);
    }

    if (target === nodeId) {
      connectedNodes.add(source);
    }

  });

  return connectedNodes;

}