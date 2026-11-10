/**
 * WHERE IS IT STYLED (owner, 2026-11-10: "optimise the app and the folders, to make them easier to work and avoid any mistakes"): every rule of the
 * stylesheets that names a class (or several), with its file, its line, its selector and what it sets, and the media or container it stands in.
 * Read-only: it changes nothing.
 *
 *   npm run css:where section-tile              every rule that names .section-tile
 *   npm run css:where section-tile info-note    the rules that name both
 *   npm run css:where section-tile -- --props   with each rule's declarations
 *
 * A class matches as a whole name: .section-tile does not match .section-tile-slot.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";

const args = process.argv.slice(2);
const withProps = args.includes("--props");
const names = args.filter(a => !a.startsWith("--")).map(a => a.replace(/^\./, ""));
if (names.length === 0) {
    console.log("usage: npm run css:where <class> [<class> ...] [-- --props]");
    process.exit(1);
}
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = names.map(n => new RegExp("\\." + escape(n) + "(?![\\w-])"));
const walk = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name).replace(/\\/g, "/"); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk("src/styles").filter(f => f.endsWith(".css")).sort();
const context = rule => { const parts = []; for (let p = rule.parent; p && p.type !== "root"; p = p.parent) if (p.type === "atrule") parts.push("@" + p.name + " " + p.params); return parts.join(" > "); };
let count = 0;
const byFile = new Map();
for (const file of files) {
    const root = postcss.parse(readFileSync(file, "utf8").split("\r").join(""), { from: file });
    root.walkRules(rule => {
        if (!patterns.every(p => p.test(rule.selector))) return;
        const line = rule.source?.start?.line ?? 0;
        const where = context(rule);
        const decls = [];
        rule.each(node => { if (node.type === "decl") decls.push(node.prop + ": " + node.value + (node.important ? " !important" : "")); });
        const entry = "  " + line + ": " + rule.selector.replace(/\s+/g, " ") + (where ? "   [" + where + "]" : "") + (withProps ? "\n      " + decls.join("; ") : "  (" + decls.map(d => d.split(":")[0]).join(", ") + ")");
        if (!byFile.has(file)) byFile.set(file, []);
        byFile.get(file).push(entry);
        count++;
    });
}
for (const [file, entries] of byFile) {
    console.log(file + " (" + entries.length + ")");
    for (const e of entries) console.log(e);
}
console.log(count + " rule" + (count === 1 ? "" : "s") + " in " + byFile.size + " file" + (byFile.size === 1 ? "" : "s") + " name ." + names.join(" and ."));
