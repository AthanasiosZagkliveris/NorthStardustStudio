/**
 * Writes docs/ai/layout-assets.md, the rulebook's section on the assets, from the contracts in src/library.
 *
 *   npm run docs:assets          rewrite the generated block between its markers
 *   npm run docs:assets:check    write nothing; fail when the block differs from the contracts
 *
 * Needs Node 22.18 or later (it reads the TypeScript source directly).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { assets } from "../../../src/library/index.ts";
import { BEGIN, END, renderAssets } from "./assets.ts";

const url = new URL("../../../docs/ai/layout-assets.md", import.meta.url);
const raw = readFileSync(url, "utf8");
const crlf = raw.includes("\r\n");
let text = raw.replace(/\r\n/g, "\n");
const block = renderAssets(assets);

let next;
const from = text.indexOf(BEGIN);
const to = text.indexOf(END);
if (from >= 0 && to > from) {
    next = text.slice(0, from) + block + text.slice(to + END.length);
} else {
    throw new Error("docs/ai/layout-assets.md has no generated:assets markers");
}

if (process.argv.includes("--check")) {
    if (next !== text) {
        console.error("The assets section (docs/ai/layout-assets.md) differs from the contracts. Run `npm run docs:assets` and commit the result.");
        process.exit(1);
    }
    console.log("The assets section is up to date.");
} else if (next !== text) {
    writeFileSync(url, crlf ? next.replace(/\n/g, "\r\n") : next);
    console.log("Wrote the assets section (" + assets.length + " assets).");
} else {
    console.log("Unchanged.");
}
