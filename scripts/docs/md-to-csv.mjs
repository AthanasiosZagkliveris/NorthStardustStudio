/**
 * Writes the FIRST table of a Markdown document as a CSV for Excel (an export in exports/).
 *
 *   node scripts/docs/md-to-csv.mjs docs/design/23-shared-components.md exports/The-shared-components.csv
 */
import { readFileSync, writeFileSync } from "node:fs";

const [source, output] = process.argv.slice(2);
if (!source || !output) { console.error("usage: node scripts/docs/md-to-csv.mjs SOURCE.md OUTPUT.csv"); process.exit(1); }
const out = [];
let started = false;
for (const line of readFileSync(source, "utf8").split(/\r?\n/)) {
    if (line.startsWith("|")) {
        started = true;
        if (/^\|[-| ]+\|$/.test(line)) continue;
        out.push(line.slice(1, -1).split("|").map(c => '"' + c.trim().replace(/\*\*/g, "").replace(/`/g, "").replace(/"/g, '""') + '"').join(","));
    } else if (started) break;
}
writeFileSync(output, "﻿" + out.join("\r\n"));
console.log("wrote " + output + " (" + out.length + " rows)");
