/**
 * Writes the generated colour files from src/styles/tokens/tokens.ts:
 *   src/styles/colors.generated.css
 *   src/styles/sizes.generated.css
 *   src/styles/tokens/tokens.dtcg.json
 *   src/styles/tokens/contrast-report.md
 * and fails (exit code 1, nothing written) when a pair of colours
 * that meet misses its contrast in any reading mode.
 *
 *   npm run tokens          write the files
 *   npm run tokens:check    write nothing; fail when the files on disk differ from the source
 *
 * Needs Node 22.18 or later (it reads the TypeScript source directly).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { generateCss, generateDtcg, generateReport, generateSizesCss, measureAll } from "./build.ts";

const root = new URL("../../../", import.meta.url);
const files = {
    "src/styles/colors.generated.css": generateCss(),
    "src/styles/sizes.generated.css": generateSizesCss(),
    "src/styles/tokens/tokens.dtcg.json": generateDtcg(),
    "src/styles/tokens/contrast-report.md": generateReport()
};

const measured = measureAll();
const misses = measured.filter(m => !m.pass);
console.log(measured.length + " contrast measurements, " + misses.length + " below their ratio.");
for (const miss of misses) {
    console.error("MISS " + miss.mode + ": " + miss.id + " is " + miss.ratio.toFixed(2) + ":1, needs " + miss.min + ":1 (" + miss.detail + ")");
}
if (misses.length) process.exit(1);

const check = process.argv.includes("--check");
let stale = 0;
for (const [path, text] of Object.entries(files)) {
    const url = new URL(path, root);
    let current = null;
    try { current = readFileSync(url, "utf8").replace(/\r\n/g, "\n"); } catch { /* not written yet */ }
    if (check) {
        if (current !== text) { console.error("DIFFERS from the source: " + path); stale++; }
    } else {
        writeFileSync(url, text);
        console.log((current === text ? "unchanged " : "wrote     ") + path);
    }
}
if (stale) {
    console.error("Run `npm run tokens` and commit the result.");
    process.exit(1);
}
