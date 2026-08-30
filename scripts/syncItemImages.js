const fs = require("fs");
const path = require("path");

const imageDir = path.resolve(__dirname, "../public/item-images");
const manifestPath = path.resolve(__dirname, "../public/item-images.json");

function main() {
  if (!fs.existsSync(imageDir)) {
    throw new Error(`Image directory was not found: ${imageDir}`);
  }

  const images = {};
  const entries = fs.readdirSync(imageDir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      !entry.isFile() ||
      path.extname(entry.name).toLowerCase() !== ".png"
    ) {
      continue;
    }

    const id = path.basename(entry.name, ".png");

    images[id] = `/item-images/${entry.name}`;
  }

  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(images, null, 2)}\n`
  );

  console.log(
    `Generated ${Object.keys(images).length} Minecraft item images.`
  );
}

main();