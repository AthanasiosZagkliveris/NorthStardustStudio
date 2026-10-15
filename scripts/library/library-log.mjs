/**
 * The library checker and the two logs (docs/design/08-library-system.md, sections 5 and 6).
 *
 *   node scripts/library/library-check.mjs          npm run library:check
 *       checks the library (codes, uniqueness, variables, variants, requirements, placements),
 *       lists every change not yet in a log, and lists the drift (components placed without the
 *       library). Fails when the library has problems or a change has no log entry.
 *
 *   node scripts/library/library-log.mjs log [--note "why"]     npm run library:log
 *       writes the entries of every unlogged change to the library log (docs/design/10-library-log.md)
 *       and the app structure log (docs/design/11-app-structure-log.md), then stores the state as
 *       the last logged one (src/library/logs/snapshot.json).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";
import { placements } from "../../src/library/data/placements.ts";
import { tables } from "../../src/library/tables/index.ts";
import { checkLibrary, driftOf } from "../../src/library/model/check.ts";
import { diffState, emptyState, stateOf } from "../../src/library/logs/diff.ts";

const snapshotFile = "src/library/logs/snapshot.json";
const libraryLog = "docs/design/10-library-log.md";
const appLog = "docs/design/11-app-structure-log.md";
const mode = process.argv[2] === "log" ? "log" : "check";
const note = process.argv.includes("--note") ? process.argv[process.argv.indexOf("--note") + 1] : "";
const today = new Date().toISOString().slice(0, 10);

const now = stateOf(library, placements, tables);
const baseline = !existsSync(snapshotFile);
const before = baseline ? emptyState() : JSON.parse(readFileSync(snapshotFile, "utf8"));
const names = new Map(library.assets.map(a => [a.code, a.name]));
let { library: libraryEntries, app: appEntries } = diffState(before, now, today, names);
if (baseline) {
    // The first record: every asset is logged; the tables and the placements are logged as one entry each.
    const rows = Object.keys(now.rows).reduce((m, k) => m.set(k.split("|")[0], (m.get(k.split("|")[0]) ?? 0) + 1), new Map());
    appEntries = [...rows].map(([code, n]) => ({ date: today, change: "placed", where: "table " + code, notInLibrary: false, what: "initial record: " + n + " rows from the catalogue" }));
    appEntries.push({ date: today, change: "placed", where: "all cards, chapters, pages", notInLibrary: false, what: "initial record: " + Object.keys(now.placements).length + " placements of library assets" });
    libraryEntries = libraryEntries.filter(e => e.change === "added");
}

const problems = checkLibrary(library, placements);
const drift = driftOf(placements);
const unlogged = libraryEntries.length + appEntries.length;

const cell = value => String(value ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
function append(file, title, intro, header, prefix, rows) {
    const text = existsSync(file) ? readFileSync(file, "utf8").split("\r").join("") : "# " + title + "\n\n" + intro + "\n\n" + header + "\n";
    const last = [...text.matchAll(new RegExp("^\\| " + prefix + "(\\d{4}) ", "gm"))].map(m => Number(m[1])).pop() ?? 0;
    const lines = rows.map((row, i) => "| " + prefix + String(last + i + 1).padStart(4, "0") + " | " + row.map(cell).join(" | ") + " |");
    writeFileSync(file, text.replace(/\n*$/, "\n") + lines.join("\n") + "\n");
}

if (mode === "log") {
    if (problems.length) { console.error(problems.length + " problems in the library; fix them before logging:\n" + problems.slice(0, 20).join("\n")); process.exit(1); }
    append(libraryLog, "The library log",
        "Every change to an asset of the library: added, edited, placed (and where), moved (from where to where), removed. Written by `npm run library:log` from the difference between the library and its last logged state; do not edit by hand.",
        "| Id | Date | Asset | Change | What | Where | Note |\n|---|---|---|---|---|---|---|", "L",
        libraryEntries.map(e => [e.date, e.asset, e.change, e.what, e.where ?? "", note]));
    append(appLog, "The app structure log",
        "Every change of the tables, that is, of the structure of the app: a placement placed, moved or removed (and where), a row of a table added, changed or removed. A placement of a component that is not in the library is marked. Written by `npm run library:log`; do not edit by hand.",
        "| Id | Date | Change | Where | Asset | Not in the library | What | Note |\n|---|---|---|---|---|---|---|---|", "A",
        appEntries.map(e => [e.date, e.change, e.where, e.asset ?? "", e.notInLibrary ? "yes" : "", e.what, note]));
    writeFileSync(snapshotFile, JSON.stringify(now));
    console.log("logged " + libraryEntries.length + " library entries and " + appEntries.length + " app entries; snapshot written");
    process.exit(0);
}

console.log("library: " + library.assets.length + " assets, " + library.assets.reduce((n, a) => n + a.variants.length, 0) + " variants, " + library.variables.length + " variables, " + placements.length + " placements");
if (problems.length) console.error(problems.length + " problems:\n" + problems.slice(0, 30).map(p => "  " + p).join("\n"));
if (drift.length) console.log("drift: " + drift.length + " components placed without the library:\n" + drift.map(p => "  " + p.asset + " in " + [p.system, p.page, p.chapter, p.tile, p.card].filter(Boolean).join(" / ")).join("\n"));
if (unlogged) {
    console.error(unlogged + " changes are not in a log (" + libraryEntries.length + " library, " + appEntries.length + " app):");
    for (const e of libraryEntries.slice(0, 10)) console.error("  library: " + e.change + " " + e.asset + " " + (e.where ?? ""));
    for (const e of appEntries.slice(0, 10)) console.error("  app: " + e.change + " " + e.where + (e.notInLibrary ? " (not in the library)" : ""));
    console.error("run npm run library:log");
}
if (problems.length || unlogged) process.exit(1);
console.log("the library is sound and every change is logged");
