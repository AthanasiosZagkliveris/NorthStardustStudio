/**
 * The style lint (see styles.ts for the rules).
 *
 *   npm run lint:styles             fail on any literal colour, corner, gap or breakpoint beyond the baseline
 *   npm run lint:styles:baseline    record what the stylesheets hold now as the baseline (do this only when the
 *                                   owner has decided that a literal stays, or after a codemod removed some)
 *   node tools/scripts/lint/lint-styles.mjs --all     list every finding, baseline or not
 *
 * Needs Node 22.18 or later (it reads the TypeScript source directly).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { compareWithBaseline, lintStyles, toBaseline } from "./styles.ts";
import { expandImports } from "./css-imports.ts";

const styles = new URL("../../../src/styles/", import.meta.url);
const baselineUrl = new URL("./styles-baseline.json", import.meta.url);

const files = readdirSync(styles)
    .filter(name => name.endsWith(".css"))
    .sort()
    .map(name => ({ name, text: expandImports(readFileSync(new URL(name, styles), "utf8").replace(/\r\n/g, "\n"), path => readFileSync(new URL(path, styles), "utf8")) }));
const findings = lintStyles(files);

if (process.argv.includes("--write-baseline")) {
    writeFileSync(baselineUrl, JSON.stringify(toBaseline(findings), null, 2) + "\n");
    console.log("Baseline written: " + findings.length + " findings in " + new Set(findings.map(f => f.file)).size + " files.");
    process.exit(0);
}

if (process.argv.includes("--all")) {
    for (const f of findings) console.log(f.rule.padEnd(10) + " " + f.file + ":" + f.line + "  " + f.value);
    console.log(findings.length + " findings.");
    process.exit(0);
}

let baseline = {};
try { baseline = JSON.parse(readFileSync(baselineUrl, "utf8")); } catch { /* none yet */ }
const { newer, gone } = compareWithBaseline(findings, baseline);
for (const f of newer) console.error("NEW " + f.rule + ": " + f.file + ":" + f.line + "  " + f.value);
if (gone.length) console.log(gone.length + " baseline entr" + (gone.length === 1 ? "y is" : "ies are") + " no longer needed (run npm run lint:styles:baseline to tighten it).");
console.log(findings.length + " findings, " + newer.length + " beyond the baseline.");
if (newer.length) {
    console.error("Use a token (colors.generated.css, sizes.generated.css, or a var() the stylesheet already defines), or ask the owner to decide the value (docs/archive/plans/2026-10-14-cleanup-and-library-plans.md, 5.14).");
    process.exit(1);
}
