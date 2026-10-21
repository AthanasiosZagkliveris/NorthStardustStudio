/**
 * Declarations that can never apply: the same selector, in the same file and the same media context, declares the same
 * property again later, so the earlier declaration is always overridden (an !important earlier one is kept, and a property
 * declared twice in ONE rule is a fallback chain, so it is left alone). Reports per file; with --check it exits 1 when any is
 * left; with --remove FILE it deletes the
 * shadowed declarations (and the rules left empty) of that file.
 *
 *   node tools/scripts/lint/css-shadowed.mjs [--remove src/styles/conversation.css | --check]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";

const remove = process.argv.includes("--remove");
const walk = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name).replace(/\\/g, "/"); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = remove ? [process.argv[process.argv.indexOf("--remove") + 1]] : walk("src/styles").filter(f => f.endsWith(".css") && !f.includes("generated"));
const context = rule => { const parts = []; for (let p = rule.parent; p && p.type !== "root"; p = p.parent) if (p.type === "atrule") parts.push("@" + p.name + " " + p.params); return parts.join(" > "); };
const norm = s => s.replace(/\s+/g, " ").trim();
let total = 0;
for (const file of files) {
    const root = postcss.parse(readFileSync(file, "utf8").split("\r").join(""));
    const seen = new Map();   // context | selector | property -> the last declaration
    const shadowed = [];
    root.walkRules(rule => {
        if (rule.parent && rule.parent.type === "atrule" && /keyframes|font-face/.test(rule.parent.name)) return;
        const key = context(rule) + " | " + norm(rule.selector);
        const own = new Set();
        rule.each(node => {
            if (node.type !== "decl") return;
            const k = key + " | " + node.prop;
            if (own.has(node.prop)) return;   // a fallback chain inside one rule
            own.add(node.prop);
            const earlier = seen.get(k);
            if (earlier && !earlier.important && earlier.rule !== rule) shadowed.push(earlier);
            seen.set(k, { decl: node, rule, important: node.important });
        });
    });
    // a declaration is shadowed only if a later declaration of the same property is not weaker (an !important later one still wins)
    const real = shadowed.filter(e => true);
    total += real.length;
    console.log(file.replace("src/styles/", "").padEnd(44) + String(real.length).padStart(5) + " shadowed declarations" + (real.length && !remove ? "  e.g. " + real.slice(0, 2).map(e => norm(e.rule.selector).slice(0, 50) + " { " + e.decl.prop + " }").join("; ") : ""));
    if (remove) {
        for (const e of real) e.decl.remove();
        // a rule left with no declaration (only a comment about what was removed) draws nothing: it goes too
        let empty = 0;
        root.walkRules(rule => { if (!rule.nodes.some(n => n.type === "decl" || n.type === "rule" || n.type === "atrule")) { rule.remove(); empty++; } });
        if (real.length || empty) writeFileSync(file, root.toString());
        if (empty) console.log("  " + empty + " empty rules removed");
    }
}
console.log("total " + total);
if (process.argv.includes("--check") && total) { console.error("shadowed declarations left: run node tools/scripts/lint/css-shadowed.mjs --remove FILE on the files above"); process.exit(1); }
