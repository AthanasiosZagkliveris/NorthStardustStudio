/**
 * Which rules of the stylesheets can no longer match anything: a rule is dead when every selector it has names a class
 * that appears nowhere in the source of the app (src, tests left out), neither whole nor as the start of a class built
 * in code ("card-tile-symbol-" + type). Reports per file; with --remove FILE it deletes the dead rules of that file.
 *
 *   node tools/scripts/lint/css-usage.mjs [--remove src/styles/global.css | --check]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";

const walk = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; });
const sources = walk("src").filter(f => /\.(tsx?|jsx?|html|json|md)$/.test(f) && !/\.test\./.test(f) && !/\/test\//.test(f.replace(/\\/g, "/"))).concat(["index.html"]);
const corpus = sources.map(f => { try { return readFileSync(f, "utf8"); } catch { return ""; } }).join("\n");
const literals = [...new Set([...corpus.matchAll(/["'`]\s*([A-Za-z][A-Za-z0-9_ -]*-)["'`]/g), ...corpus.matchAll(/([A-Za-z][A-Za-z0-9_-]*-)\$\{/g), ...corpus.matchAll(/["'`]\s*([A-Za-z][A-Za-z0-9_ -]*-)["'`]\s*\+/g)].map(m => m[1].split(" ").pop()))];
const used = new Map();
const isUsed = name => {
    if (used.has(name)) return used.get(name);
    let ok = corpus.includes(name) || literals.some(prefix => name.startsWith(prefix));
    used.set(name, ok);
    return ok;
};
const stripGroups = selector => { let out = selector, before; do { before = out; out = out.replace(/:(?:not|is|where|has)\([^()]*\)/g, ""); } while (out !== before); return out; };
const classesOf = selector => [...stripGroups(selector).matchAll(/\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g)].map(m => m[1]);

const DIR = process.argv.includes("--dir") ? process.argv[process.argv.indexOf("--dir") + 1] : "src/styles";
const files = process.argv.includes("--remove") ? [process.argv[process.argv.indexOf("--remove") + 1]] : walk(DIR).filter(f => f.endsWith(".css"));
const remove = process.argv.includes("--remove");
let totalRules = 0, totalDead = 0, pruned = 0;
for (const file of files) {
    const css = readFileSync(file, "utf8").split("\r").join("");
    const root = postcss.parse(css);
    let rules = 0, dead = 0, deadLines = 0;
    const deadClasses = new Set();
    root.walkRules(rule => {
        if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
        rules++;
        const selectors = rule.selectors ?? [rule.selector];
        const alive = selectors.some(sel => { const cls = classesOf(sel); return cls.length === 0 || cls.every(isUsed); });
        if (alive && selectors.length > 1) {
            const keep = selectors.filter(sel => { const cls = classesOf(sel); return cls.length === 0 || cls.every(isUsed); });
            if (keep.length < selectors.length) { pruned += selectors.length - keep.length; if (remove) rule.selectors = keep; }
        }
        if (!alive) {
            dead++;
            deadLines += (rule.source?.end?.line ?? 0) - (rule.source?.start?.line ?? 0) + 1;
            for (const sel of selectors) for (const c of classesOf(sel)) if (!isUsed(c)) deadClasses.add(c);
            if (remove) { const parent = rule.parent; rule.remove(); if (parent && parent.type === "atrule" && parent.nodes.length === 0) parent.remove(); }
        }
    });
    totalRules += rules; totalDead += dead;
    console.log(file.replace(DIR + "/", "").replace(/^src\/styles\//, "").padEnd(44) + String(rules).padStart(6) + " rules, " + String(dead).padStart(4) + " dead (" + deadLines + " lines)" + (dead && !remove ? "  e.g. ." + [...deadClasses].slice(0, 4).join(" .") : ""));
    if (remove && (dead || pruned)) writeFileSync(file, root.toString());
}
console.log("total " + totalRules + " rules, " + totalDead + " dead, " + pruned + " dead alternatives in rules that stay");
if (process.argv.includes("--check") && (totalDead || pruned)) { console.error("dead CSS left: run node tools/scripts/lint/css-usage.mjs --remove FILE on the files above"); process.exit(1); }
