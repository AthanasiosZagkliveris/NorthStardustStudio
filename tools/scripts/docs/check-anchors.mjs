/**
 * THE ANCHORS OF THE DOCUMENTS: every link that points at a heading (`[text](#heading)` or `[text](other.md#heading)`) must find that heading in the file it points to. The slug of a heading is
 * the one GitHub and the Markdown preview of the editors write: lower case, the marks of the words taken out (code ticks, bold, links), anything that is not a letter, a number, a space,
 * a hyphen or an underscore taken out, each space a hyphen; a heading that repeats gets -1, -2.
 *
 *   node tools/scripts/docs/check-anchors.mjs          (lists the broken anchors; exit 1 if any)
 *
 * It is part of `npm run docs:standard` (check-standard.mjs imports `brokenAnchors`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..") + path.sep;

export function slugs(text) {
    const seen = new Map(), out = new Set();
    let fenced = false;
    for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
        if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
        if (fenced) continue;
        const a = /^<a id="([^"]+)"><\/a>\s*$/.exec(line);
        if (a) { out.add(a[1]); continue; }
        const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
        if (!m) continue;
        let h = m[2].replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "").replace(/[`*~]/g, "").toLowerCase();
        h = h.replace(/[^\p{L}\p{N}\s\-_]/gu, "").trim().replace(/\s/g, "-");
        const n = seen.get(h) ?? 0;
        seen.set(h, n + 1);
        out.add(n === 0 ? h : h + "-" + n);
    }
    return out;
}

function walk(dir, found = []) {
    for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) walk(p, found);
        else if (name.endsWith(".md")) found.push(p);
    }
    return found;
}

export function brokenAnchors(root = ROOT) {
    const files = walk(root + "docs");
    const cache = new Map();
    const headingsOf = file => { if (!cache.has(file)) cache.set(file, slugs(readFileSync(file, "utf8"))); return cache.get(file); };
    const problems = [];
    for (const file of files) {
        const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
        let fenced = false;
        for (const line of text.split("\n")) {
            if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
            if (fenced) continue;
            for (const m of line.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]*?)#([^)\s]+)\)/g)) {
                const target = m[1] ? path.resolve(path.dirname(file), decodeURI(m[1])) : file;
                if (m[1] && /^[a-z]+:/i.test(m[1])) continue;
                let heads;
                try { heads = headingsOf(target); } catch { continue; }
                if (!heads.has(decodeURIComponent(m[2]).toLowerCase())) problems.push(path.relative(root, file).replace(/\\/g, "/") + ": broken anchor #" + m[2] + (m[1] ? " in " + m[1] : ""));
            }
        }
    }
    return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const problems = brokenAnchors();
    console.log(problems.length ? problems.join("\n") + "\n" + problems.length + " broken anchors" : "Every anchor finds its heading.");
    process.exit(problems.length ? 1 : 0);
}
