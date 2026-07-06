const fs = require("fs");
const path = require("path");

const recipeDir = path.join(__dirname, "../recipe");

const edges = [];
const edgeSet = new Set();

function cleanName(name) {
  if (typeof name !== "string") {
    console.log("Unexpected:", JSON.stringify(name, null, 2));
    return "UNKNOWN";
  }

  return name
    .replace("#minecraft:", "")
    .replace("minecraft:", "");
}

function addEdge(source, target, type) {

  if (typeof source !== "string") {
    console.log("SOURCE");
    console.log(type);
    console.log(JSON.stringify(source, null, 2));
    process.exit(1);
  }

  if (typeof target !== "string") {
    console.log("TARGET");
    console.log(type);
    console.log(JSON.stringify(target, null, 2));
    process.exit(1);
  }

  const cleanSource = cleanName(source);
  const cleanTarget = cleanName(target);

  const key = `${cleanSource}|${cleanTarget}|${type}`;

  if (!edgeSet.has(key)) {
    edgeSet.add(key);

    edges.push({
      source: cleanSource,
      target: cleanTarget,
      type,
    });
  }
}

for (const file of fs.readdirSync(recipeDir)) {
  if (!file.endsWith(".json")) continue;

  const recipe = JSON.parse(
    fs.readFileSync(path.join(recipeDir, file), "utf8")
  );

  const type = recipe.type;
  const target = recipe.result?.id;

  if (!target) continue;

  // crafting_shaped
  if (type === "minecraft:crafting_shaped") {
    for (const value of Object.values(recipe.key || {})) {

      if (typeof value === "string") {
        addEdge(value, target, type);
      }

      else if (Array.isArray(value)) {
        for (const item of value) {
          addEdge(item, target, type);
        }
      }
    }
  }

  // crafting_shapeless
  else if (type === "minecraft:crafting_shapeless") {
    for (const ingredient of recipe.ingredients || []) {
      addSource(ingredient, target, type);
    }
  }

  // stonecutting, smelting, smoking...
  else if (
    [
      "minecraft:stonecutting",
      "minecraft:smelting",
      "minecraft:blasting",
      "minecraft:smoking",
      "minecraft:campfire_cooking",
    ].includes(type)
  ) {

    const ingredient = recipe.ingredient;

    if (typeof ingredient === "string") {
      addSource(recipe.ingredient, target, type);
    }

    else if (Array.isArray(ingredient)) {
      for (const item of ingredient) {
        addSource(recipe.ingredient, target, type);
      }
    }
  }

  // smithing_transform
  else if (type === "minecraft:smithing_transform") {

    if (recipe.base)
      addSource(recipe.base, target, type);

    if (recipe.addition)
      addSource(recipe.addition, target, type);

    if (recipe.template)
      addSource(recipe.template, target, type);
  }
}

function addSource(source, target, type) {

  if (!source) return;

  // 文字列
  if (typeof source === "string") {
    addEdge(source, target, type);
    return;
  }

  // 配列
  if (Array.isArray(source)) {
    for (const item of source) {
      addSource(item, target, type);
    }
    return;
  }

  console.log("Unknown source format:");
  console.log(JSON.stringify(source, null, 2));
}

const nodeSet = new Set();

for (const edge of edges) {
  nodeSet.add(edge.source);
  nodeSet.add(edge.target);
}

console.log(`Nodes: ${nodeSet.size}`);
console.log(`Edges: ${edges.length}`);


// CSV作成
let csv = "source,target,type\n";

for (const edge of edges) {
  csv += `${edge.source},${edge.target},${edge.type}\n`;
}

fs.writeFileSync("edges.csv", csv);

console.log(`Edges: ${edges.length}`);
console.log("edges.csv created");
