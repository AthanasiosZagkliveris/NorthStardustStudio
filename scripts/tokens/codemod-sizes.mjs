/**
 * Codemod, step 2 of the library automation: replace a literal corner
 * or gap in the stylesheets by the token that holds exactly that value.
 *
 *   node scripts/tokens/codemod-sizes.mjs                 dry run: prints what it would change, edits nothing
 *   node scripts/tokens/codemod-sizes.mjs --write         edits the stylesheets
 *   node scripts/tokens/codemod-sizes.mjs --report FILE   also writes the list of what it leaves, as Markdown
 *
 * Only identical values are replaced, so no page changes:
 *   border-radius (and the four corner properties): 4px, 6px, 8px  ->  var(--radius-sm | -md | -lg)
 *   gap, row-gap, column-gap: 2, 4, 6, 8, 12, 16, 24px            ->  var(--gap-<n>)
 * A shorthand of several values is replaced value by value
 * (`8px 8px 0 0` becomes `var(--radius-lg) var(--radius-lg) 0 0`).
 * Everything else is left as written and listed: shapes and zero
 * (50%, 999px, 0), values that are not on a step (10px, 12px corners,
 * 10px gaps ...), values in em or vw, and any value that already uses
 * var() or calc().
 *
 * Comments are never touched. Generated files (*.generated.css) are skipped.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { corners, gaps, containerBreakpoints, viewportBreakpoints } from "../../src/styles/tokens/tokens.ts";

const write = process.argv.includes("--write");
const reportAt = process.argv.includes("--report") ? process.argv[process.argv.indexOf("--report") + 1] : null;
const dir = new URL("../../src/styles/", import.meta.url);

const radiusToken = new Map(Object.entries(corners).map(([name, px]) => [px, "var(--" + name + ")"]));
const gapToken = new Map(gaps.map(px => [px, "var(--gap-" + px + ")"]));

const property = /(^|[;{\s])(border-(?:top|bottom)-(?:left|right)-radius|border-radius|row-gap|column-gap|gap)(\s*:\s*)([^;}]+)/g;

/** Character ranges that are comments, so a declaration shown in a comment is not touched. */
function commentRanges(text) {
    const ranges = [];
    for (const match of text.matchAll(/\/\*[\s\S]*?\*\//g)) ranges.push([match.index, match.index + match[0].length]);
    return ranges;
}

const replaced = new Map(); // "radius 8px" -> { count, files: Map }
const left = new Map();     // "radius|value|why" -> { count, files: Map }
const bump = (map, key, file) => {
    const entry = map.get(key) ?? { count: 0, files: new Map() };
    entry.count++;
    entry.files.set(file, (entry.files.get(file) ?? 0) + 1);
    map.set(key, entry);
};

let filesChanged = 0;
let declarationsChanged = 0;
for (const file of readdirSync(dir).filter(name => name.endsWith(".css") && !name.endsWith(".generated.css")).sort()) {
    const url = new URL(file, dir);
    const original = readFileSync(url, "utf8");
    const comments = commentRanges(original);
    const inComment = at => comments.some(([from, to]) => at >= from && at < to);
    let changed = 0;
    const next = original.replace(property, (whole, before, name, colon, value, at) => {
        if (inComment(at)) return whole;
        const kind = name.endsWith("radius") ? "radius" : "gap";
        const table = kind === "radius" ? radiusToken : gapToken;
        const important = /\s*!important\s*$/.exec(value);
        const body = important ? value.slice(0, important.index) : value;
        const trailing = body.match(/\s*$/)[0];
        const tokens = body.trim().split(/\s+/);
        if (body.includes("(") || body.includes("/")) {
            bump(left, kind + "|" + body.trim() + "|already a token or a calculation", file);
            return whole;
        }
        let touched = false;
        const out = tokens.map(token => {
            const match = /^(\d+(?:\.\d+)?)px$/.exec(token);
            if (match && table.has(Number(match[1]))) {
                touched = true;
                bump(replaced, kind + " " + token, file);
                return table.get(Number(match[1]));
            }
            let why = "off the scale";
            if (kind === "radius" && (token === "0" || token === "50%" || token === "999px")) why = "a shape or zero, kept";
            else if (kind === "gap" && (token === "0" || token === "normal")) why = "zero or normal, kept";
            else if (/(em|vw|%)$/.test(token)) why = "not px, kept";
            bump(left, kind + "|" + token + "|" + why, file);
            return token;
        });
        if (!touched) return whole;
        changed++;
        return before + name + colon + out.join(" ") + trailing + (important ? important[0] : "");
    });
    if (changed) {
        filesChanged++;
        declarationsChanged += changed;
        if (write) writeFileSync(url, next);
    }
    if (changed) console.log((write ? "changed " : "would change ") + file + ": " + changed + " declaration(s)");
}

const sum = map => [...map.values()].reduce((total, entry) => total + entry.count, 0);
console.log("");
console.log((write ? "Changed " : "Dry run: would change ") + declarationsChanged + " declarations in " + filesChanged + " files (" + sum(replaced) + " values).");
console.log("");
console.log("Replaced, by value:");
for (const [key, entry] of [...replaced].sort((a, b) => b[1].count - a[1].count)) console.log("  " + String(entry.count).padStart(4) + "  " + key);

const lines = [];
lines.push("| Property | Value | Why it is left | Uses | Main files |", "|---|---|---|---|---|");
for (const [key, entry] of [...left].sort((a, b) => a[0].split("|")[0].localeCompare(b[0].split("|")[0]) || b[1].count - a[1].count)) {
    const [kind, value, why] = key.split("|");
    const files = [...entry.files].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => name + " " + count).join(", ");
    lines.push("| " + (kind === "radius" ? "corner" : "gap") + " | `" + value + "` | " + why + " | " + entry.count + " | " + files + " |");
}

/* Breakpoints: places within 2 px of each other, which are one place drawn twice. Nothing is changed. */
const close = [];
for (const [name, list] of [["window", viewportBreakpoints], ["container", containerBreakpoints]]) {
    const sorted = list.filter(b => b.axis === "width").sort((a, b) => a.wideFrom - b.wideFrom);
    let run = [];
    const flush = () => { if (run.length > 1) close.push([name, run]); run = []; };
    for (const boundary of sorted) {
        if (run.length && boundary.wideFrom - run[run.length - 1].wideFrom > 2) flush();
        run.push(boundary);
    }
    flush();
}
const breakpointLines = ["| Kind | Wide from | Spellings (uses) |", "|---|---|---|"];
for (const [name, run] of close) {
    breakpointLines.push("| " + name + " | " + run.map(b => b.wideFrom).join(" / ") + " | " + run.map(b => Object.entries(b.queries).map(([q, n]) => q + " (" + n + ")").join(", ")).join(" ; ") + " |");
}

console.log("");
console.log("Left as written, by value (" + [...left.values()].reduce((t, e) => t + e.count, 0) + " values):");
for (const line of lines.slice(2)) console.log("  " + line);
console.log("");
console.log("Window and container breakpoints within 2 px of each other (not changed):");
for (const line of breakpointLines.slice(2)) console.log("  " + line);

if (reportAt) {
    writeFileSync(reportAt, ["## Corners and gaps left as written", "", ...lines, "", "## Breakpoints within 2 px of each other", "", ...breakpointLines, ""].join("\n"));
    console.log("\nWrote " + reportAt);
}
