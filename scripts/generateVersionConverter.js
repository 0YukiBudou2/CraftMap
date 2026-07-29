const fs = require("fs");
const url =
"https://minecraft.wiki/api.php?action=parse&page=Java_Edition_version_history&prop=text&format=json";
const res = await fetch(url);
const json = await res.json();
const wikiText =
json.parse.wikitext["*"];
const cheerio =
require("cheerio");
const $
=
cheerio.load(html);