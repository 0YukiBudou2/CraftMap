const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const edgesPath = path.resolve(__dirname, "../public/edges.csv");
const outputPath = path.resolve(__dirname, "../public/node-positions.json");

const layoutConfig = {
  version: 3,
  legacy: {
    linkDistance: 50,
    chargeStrength: -100,
    ticks: 300
  },
  collisionRadius: 11,
  collisionStrength: 1,
  collisionIterations: 2,
  anchorStrength: 0.15,
  relaxationTicks: 80
};

function parseEdges(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(line => {
      const [source, target] = line.split(",");
      return { source, target };
    })
    .filter(edge => edge.source && edge.target);
}

function getSourceHash(csv) {
  return crypto
    .createHash("sha256")
    .update(csv)
    .update(JSON.stringify(layoutConfig))
    .digest("hex");
}

function hasCurrentLayout(sourceHash) {
  if (process.argv.includes("--force")) return false;
  if (!fs.existsSync(outputPath)) return false;

  try {
    const current = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    return current.metadata?.sourceHash === sourceHash;
  } catch {
    return false;
  }
}

async function main() {
  const d3 = await import("d3");
  const csv = fs.readFileSync(edgesPath, "utf8");
  const sourceHash = getSourceHash(csv);

  if (hasCurrentLayout(sourceHash)) {
    console.log("Node positions are already up to date.");
    return;
  }

  const links = parseEdges(csv);
  // 旧ランタイムと同じく、edges.csv に最初に現れた順を維持する。
  const nodeIds = [...new Set(
    links.flatMap(link => [link.source, link.target])
  )];
  const nodes = nodeIds.map(id => ({ id }));

  const legacySimulation = d3.forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links)
        .id(node => node.id)
        .distance(layoutConfig.legacy.linkDistance)
    )
    .force("charge", d3.forceManyBody().strength(layoutConfig.legacy.chargeStrength))
    .force("center", d3.forceCenter(0, 0))
    .stop();

  for (let index = 0; index < layoutConfig.legacy.ticks; index += 1) {
    legacySimulation.tick();
  }

  const anchors = new Map(
    nodes.map(node => [node.id, { x: node.x, y: node.y }])
  );

  // 拡大したノードの重なりだけを、旧配置から離れすぎないように補正する。
  const relaxationSimulation = d3.forceSimulation(nodes)
    .force(
      "collision",
      d3.forceCollide(layoutConfig.collisionRadius)
        .strength(layoutConfig.collisionStrength)
        .iterations(layoutConfig.collisionIterations)
    )
    .force(
      "anchorX",
      d3.forceX(node => anchors.get(node.id).x)
        .strength(layoutConfig.anchorStrength)
    )
    .force(
      "anchorY",
      d3.forceY(node => anchors.get(node.id).y)
        .strength(layoutConfig.anchorStrength)
    )
    .stop();

  for (let index = 0; index < layoutConfig.relaxationTicks; index += 1) {
    relaxationSimulation.tick();
  }

  const minX = Math.min(...nodes.map(node => node.x));
  const maxX = Math.max(...nodes.map(node => node.x));
  const minY = Math.min(...nodes.map(node => node.y));
  const maxY = Math.max(...nodes.map(node => node.y));
  const rangeX = Math.max(maxX - minX, 1);
  const rangeY = Math.max(maxY - minY, 1);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const maxAnchorDisplacement = Math.max(
    ...nodes.map(node => {
      const anchor = anchors.get(node.id);
      return Math.hypot(node.x - anchor.x, node.y - anchor.y);
    })
  );
  const positions = {};

  nodes.forEach(node => {
    positions[node.id] = {
      x: Number((node.x - centerX).toFixed(6)),
      y: Number((node.y - centerY).toFixed(6))
    };
  });

  const output = {
    metadata: {
      sourceHash,
      nodeCount: nodes.length,
      aspectRatio: Number((rangeX / rangeY).toFixed(6)),
      width: Number(rangeX.toFixed(3)),
      height: Number(rangeY.toFixed(3)),
      coordinateOrigin: "layout-center",
      maxAnchorDisplacement: Number(maxAnchorDisplacement.toFixed(3)),
      layoutConfig
    },
    positions
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Generated fixed positions for ${nodes.length} nodes.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
