const fs = require("fs");
const path = require("path");

const edgePath = path.join(__dirname, "../public/edges.csv");

const itemPath = path.join(__dirname, "../wiki/List_of_items_by_version.txt");
const blockPath = path.join(__dirname, "../wiki/List_of_blocks_by_version.txt");

const versionMap = new Map();

function loadWiki(filePath) {

    let text = fs.readFileSync(filePath, "utf8");
    text = text.replace(/\\n/g, "\n");

    const lines = text.split(/\r?\n/);

    let inJavaSection = false;

    for (const line of lines) {

        // セクション見出し判定: "== ''Java Edition'' ==" のような行
        const headerMatch = line.match(/^==\s*'{0,2}([^=']+)'{0,2}\s*==\s*$/);

        if (headerMatch) {
            const title = headerMatch[1].trim();
            inJavaSection = (title === "Java Edition");
            continue;
        }

        // Java Edition セクション以外は無視
        if (!inJavaSection) continue;

        const match = line.match(
            /^\|.*?\|\|\s*([^|]+?)\s*\|\|\s*(\[\[[^\]]+\]\])/
        );

        if (!match) continue;

        const id = match[1];

        // [[Java Edition 1.20|1.20]] → Java Edition 1.20|1.20
        const rawVersion = match[2]
            .replace(/^\[\[/, "")
            .replace(/\]\]$/, "");

        const version = rawVersion.split("|").pop();

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

// スナップショット開始週（ここは手入力で管理）
const snapshotMap = [
    { year: 15, week: 31, release: "1.9" },
    { year: 16, week: 14, release: "1.9.3"},
    { year: 16, week: 20, release: "1.10" },
    { year: 16, week: 32, release: "1.11" },
    { year: 17, week: 6, release: "1.12" },
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

function colorGroup(version) {

    if (!version) return "";

    // 古いバージョン
    if (
        version.includes("Classic") ||
        version.includes("Pre-Classic") ||
        version.includes("Indev") ||
        version.includes("Infdev") ||
        version.includes("Alpha") ||
        version.includes("Beta")
    ) {
        return "pre_1_8";
    }

    let v = version;

    // スナップショットなら正式版へ変換
    if (/^\d{2}w\d{2}[a-z]$/i.test(v)) {
        v = snapshotToRelease(v) ?? v;
    }

    const match = v.match(/(\d+)\.(\d+)/);

    if (!match)
        return "pre_1_8";

    const major = Number(match[1]);
    const minor = Number(match[2]);

    // 1.7以前
    if (major === 1 && minor <= 8)
        return "pre_1_8";

    // 1.9 ～ 1.12
    if (major === 1 && minor <= 12)
        return "1.9-1.12";

    // 1.13 ～ 1.15
    if (major === 1 && minor <= 15)
        return "1.13-1.15";

    // 1.16 ～ 1.18
    if (major === 1 && minor <= 18)
        return "1.16-1.18";

    // 1.19以降
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