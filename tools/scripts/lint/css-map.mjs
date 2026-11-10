/**
 * THE MAP OF THE STYLESHEETS (owner, 2026-11-10: "optimise the app and the folders, to make them easier to work and avoid any mistakes"): every
 * headed block of every stylesheet -- the comments written in capitals that open a topic ("/* THE CHANNEL CARD'S PARTS ...") and the banners
 * ("/* ===== ... ===== *\/") -- with its file and line, in the order the sheets load (the two big sheets, conversation.css and section-tiles.css,
 * as their parts are imported). Read-only.
 *
 *   npm run css:map                   the whole map
 *   npm run css:map channel card      only the headings that hold all those words
 *
 * With `npm run css:where <class>` (every rule that names a class) it answers "where is this styled?" without moving a rule: the stylesheets'
 * order decides which rule wins, so the rules stay where they are.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const words = process.argv.slice(2).map(w => w.toLowerCase());
const walk = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name).replace(/\\/g, "/"); return statSync(p).isDirectory() ? walk(p) : [p]; });
const all = walk("src/styles").filter(f => f.endsWith(".css") && !f.includes(".generated."));
// The parts of a big sheet in their import order, under the sheet's name.
const order = [];
const seen = new Set();
for (const file of all.filter(f => !/\/(conversation|section-tiles)\//.test(f)).sort()) {
    const text = readFileSync(file, "utf8");
    const parts = [...text.matchAll(/@import\s+"\.\/([^"]+)";/g)].map(m => "src/styles/" + m[1]);
    order.push(file);
    seen.add(file);
    for (const part of parts) { order.push(part); seen.add(part); }
}
for (const file of all) if (!seen.has(file)) order.push(file);

let shown = 0;
for (const file of order) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const heads = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let title = null;
        if (/^\/\*\s*=+/.test(line) && lines[i + 1]) title = lines[i + 1].trim();
        else { const m = line.match(/^\/\*\s+((?:[A-Z0-9][A-Z0-9'’"&,.()\-/:]*\s+){1,}[A-Z0-9'’"&.()\-/:]+)/); if (m && m[1].replace(/[^A-Z]/g, "").length >= 6) title = line.replace(/^\/\*\s*/, "").replace(/\*\/\s*$/, "").trim(); }
        if (!title) continue;
        const short = title.length > 150 ? title.slice(0, 147) + "..." : title;
        if (words.length && !words.every(w => short.toLowerCase().includes(w))) continue;
        heads.push("  " + (i + 1) + ": " + short);
    }
    if (!heads.length) continue;
    console.log(file);
    for (const h of heads) console.log(h);
    shown += heads.length;
}
console.log(shown + " headed block" + (shown === 1 ? "" : "s") + (words.length ? " about \"" + words.join(" ") + "\"" : ""));
