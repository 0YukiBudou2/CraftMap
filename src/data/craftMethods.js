const craftMethodLabels = {
  "minecraft:crafting_shaped": "作業台（定型）",
  "minecraft:crafting_shapeless": "作業台（不定形）",
  "minecraft:smelting": "かまど",
  "minecraft:blasting": "溶鉱炉",
  "minecraft:smoking": "燻製器",
  "minecraft:campfire_cooking": "焚き火",
  "minecraft:stonecutting": "石切台",
  "minecraft:smithing_transform": "鍛冶台",
  unknown: "不明"
};

export function getCraftMethodLabel(type) {
  return craftMethodLabels[type] ?? type.replace(/^minecraft:/, "");
}
