/**
 * Keeps the numbers in the rulebook's token tables equal to the code.
 *
 *   npm run docs:values          rewrite a differing number to what the stylesheets give
 *   npm run docs:values:check    write nothing; fail when a table differs from the code
 *
 * Only a table row whose first cell holds custom properties and whose value
 * cell holds a plain number is touched (see values.ts). A row the code cannot
 * answer (the property is not defined, or its value cannot be worked out) is
 * listed and left. Needs Node 22.18 or later.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { collectDefinitions, sync } from "./values.ts";
import { expandImports } from "../lint/css-imports.ts";

const root = new URL("../../", import.meta.url);
const styles = new URL("src/styles/", root);
const readSheet = path => readFileSync(new URL(path, styles), "utf8");
const sheets = readdirSync(styles).filter(name => name.endsWith(".css")).map(name => ({ name, text: expandImports(readSheet(name).replace(/\r\n/g, "\n"), readSheet) }));
const defs = collectDefinitions(sheets);

const DOCUMENTS = ["docs/ai/layout-rules.md"];
const check = process.argv.includes("--check");
let failed = false;
for (const path of DOCUMENTS) {
    const url = new URL(path, root);
    const raw = readFileSync(url, "utf8");
    const crlf = raw.includes("\r\n");
    const text = raw.replace(/\r\n/g, "\n");
    const result = sync(text, defs);
    for (const d of result.changed) console.log((check ? "DIFFERS " : "changed ") + path + ":" + d.line + "  " + d.name + "  " + d.documented + " -> " + d.code[0]);
    for (const d of result.unresolved) console.log("left    " + path + ":" + d.line + "  " + d.name + "  documented " + d.documented + ", code " + (d.code.length ? d.code.join(" | ") : "(not defined)"));
    if (check && result.changed.length) failed = true;
    if (!check && result.changed.length) writeFileSync(url, crlf ? result.text.replace(/\n/g, "\r\n") : result.text);
}
if (failed) {
    console.error("A table differs from the code. Run `npm run docs:values` and commit the result.");
    process.exit(1);
}
