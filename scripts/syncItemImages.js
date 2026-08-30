const fs = require("fs");
const path = require("path");

const sourceDir = path.resolve(__dirname, "../public/item-images");
const destinationDir = path.resolve(__dirname, "../public/item-images");
const manifestPath = path.resolve(__dirname, "../public/item-images.json");

function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Image directory was not found: ${sourceDir}`);
  }

  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.mkdirSync(destinationDir, { recursive: true });

  const images = {};
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".png") {
      continue;
    }

    const id = path.basename(entry.name, ".png");
    const inputPath = path.join(sourceDir, entry.name);
    const outputPath = path.join(destinationDir, entry.name);

    fs.copyFileSync(inputPath, outputPath);

    images[id] = `/item-images/${entry.name}`;
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(images, null, 2)}\n`);
  console.log(`Synced ${Object.keys(images).length} Minecraft item images.`);
}

main();
