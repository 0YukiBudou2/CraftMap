const fs = require("fs");
const path = require("path");

const edgePath = path.join(__dirname, "../public/edges.csv");

const itemPath = path.join(__dirname, "../wiki/List_of_items_by_version.txt");
const blockPath = path.join(__dirname, "../wiki/List_of_blocks_by_version.txt");

const versionMap = new Map();

// ==============================
// スナップショット → 正式版 変換
// ==============================
const snapshotMap = [
    { year: 11, week: 47, release: "1.1" },
    { year: 12, week: 3, release: "1.2.1" },
    { year: 12, week: 15, release: "1.3.1" },
    { year: 12, week: 32, release: "1.4.2" },
    { year: 12, week: 49, release: "1.4.6" },
    { year: 13, week: 1, release: "1.5" },
    { year: 13, week: 16, release: "1.6.1" },
    { year: 13, week: 38, release: "1.7.2" },
    { year: 13, week: 47, release: "1.7.4" },
    { year: 14, week: 5, release: "1.8" },
    { year: 15, week: 31, release: "1.9" },
    { year: 16, week: 14, release: "1.9.3" },
    { year: 16, week: 20, release: "1.10" },
    { year: 16, week: 32, release: "1.11" },
    { year: 17, week: 6, release: "1.12" },
    { year: 17, week: 31, release: "1.12.1"},
    { year: 17, week: 43, release: "1.13" },
    { year: 18, week: 30, release: "1.13.1" },
    { year: 18, week: 43, release: "1.14"},
    { year: 19, week: 34, release: "1.15" },
    { year: 20, week: 6, release: "1.16" },
    { year: 20, week: 45, release: "1.17" },
    { year: 21, week: 37, release: "1.18" },
    { year: 22, week: 3, release: "1.18.2"},
    { year: 22, week: 11, release: "1.19" },
    { year: 22, week: 42, release: "1.19.3"},
    { year: 23, week: 3, release: "1.19.4"},
    { year: 23, week: 12, release: "1.20" },
    { year: 23, week: 31, release: "1.20.2" },
    { year: 23, week: 40, release: "1.20.3" },
    { year: 23, week: 51, release: "1.20.5" },
    { year: 24, week: 18, release: "1.21" },
    { year: 24, week: 33, release: "1.21.2" },
    { year: 25, week: 2, release: "1.21.5" },
    { year: 25, week: 31, release: "1.21.9" }
];

function snapshotToRelease(version) {

    const match = version.match(/^(\d{2})w(\d{2})[a-z]$/i);

    if (!match) return null;

    const year = Number(match[1]);
    const week = Number(match[2]);

    let release = null;

    for (const entry of snapshotMap) {
        if (
            year > entry.year ||
            (year === entry.year && week >= entry.week)
        ) {
            release = entry.release;
        } else {
            break;
        }
    }

    return release;
}

// ==============================
// バージョン表記を正規化する
// ==============================
function normalizeVersion(rawLabel) {

    if (!rawLabel) return rawLabel;

    // Alpha/Beta/Indev/Infdev/Classic等 → 正式版が存在しないため 1.0.0 に統一
    if (
        rawLabel.includes("Classic") ||
        rawLabel.includes("Pre-Classic") ||
        rawLabel.includes("Indev") ||
        rawLabel.includes("Infdev") ||
        rawLabel.includes("Alpha") ||
        rawLabel.includes("Beta")
    ) {
        return "1.0.0";
    }

    // スナップショットなら正式版へ変換
    if (/^\d{2}w\d{2}[a-z]$/i.test(rawLabel)) {
        return snapshotToRelease(rawLabel) ?? rawLabel;
    }

    // 先頭が数値バージョンで始まる場合、その部分だけ抽出
    const numMatch = rawLabel.match(/^(\d+(?:\.\d+){1,2})/);
    if (numMatch) {
        return numMatch[1];
    }

    return rawLabel;
}

// ==============================
// wiki読み込み
// ==============================
function loadWiki(filePath) {

    let text = fs.readFileSync(filePath, "utf8");
    text = text.replace(/\\n/g, "\n");

    const lines = text.split(/\r?\n/);

    let inJavaSection = false;

    for (const line of lines) {

        const headerMatch = line.match(/^==\s*'{0,2}([^=']+)'{0,2}\s*==\s*$/);

        if (headerMatch) {
            const title = headerMatch[1].trim();
            inJavaSection = (title === "Java Edition");
            continue;
        }

        if (!inJavaSection) continue;

        const match = line.match(
            /^\|.*?\|\|\s*([^|]+?)\s*\|\|\s*(\[\[[^\]]+\]\])/
        );

        if (!match) continue;

        const id = match[1];

        const rawVersion = match[2]
            .replace(/^\[\[/, "")
            .replace(/\]\]$/, "");

        const rawLabel = rawVersion.split("|").pop();

        const version = normalizeVersion(rawLabel);

        versionMap.set(id, version);
    }
}

loadWiki(itemPath);
loadWiki(blockPath);


const edgeLines = fs.readFileSync(edgePath, "utf8").split(/\r?\n/);

const nodeSet = new Set();

for (let i = 1; i < edgeLines.length; i++) {

    if (!edgeLines[i]) continue;

    const [source, target] = edgeLines[i].split(",");

    nodeSet.add(source);
    nodeSet.add(target);
}

// ==============================
// colorGroup の分類
// ==============================
function colorGroup(version) {

    if (!version) return "";

    const match = version.match(/(\d+)\.(\d+)/);

    if (!match)
        return "pre_1_8";

    const major = Number(match[1]);
    const minor = Number(match[2]);

    if (major === 1 && minor <= 8)
        return "pre_1_8";

    if (major === 1 && minor <= 12)
        return "1.9-1.12";

    if (major === 1 && minor <= 15)
        return "1.13-1.15";

    if (major === 1 && minor <= 18)
        return "1.16-1.18";

    return "1.19+";
}

let csv = "id,version,colorGroup\n";

let found = 0;
let notFound = 0;

for (const id of [...nodeSet].sort()) {

    const version = versionMap.get(id);

    if (version) {
        found++;
    } else {
        notFound++;
        console.log("Not Found:", id);
    }

    csv += `${id},${version ?? ""},${colorGroup(version)}\n`;
}

fs.writeFileSync("versions.csv", csv);

console.log();
console.log("========== Result ==========");
console.log("Nodes     :", nodeSet.size);
console.log("Found     :", found);
console.log("Not Found :", notFound);
console.log("versions.csv created");