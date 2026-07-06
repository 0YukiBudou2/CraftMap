import json

with open("public/ja_jp.json", encoding="utf-8") as f:
    data = json.load(f)

filtered = {
    key: value
    for key, value in data.items()
    if key.startswith("item.minecraft.") or key.startswith("block.minecraft.")
}

with open("labels.json", "w", encoding="utf-8") as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print(f"{len(filtered)}件抽出しました。")