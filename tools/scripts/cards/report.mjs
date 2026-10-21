/**
 * The scanner's variance tables (tools/scripts/cards/scan.mjs writes the input).
 *
 *   node tools/scripts/cards/report.mjs scan.json [--md out.md]
 *
 * For each control type and each kind of surface: the distinct sizes found, how
 * many times, and where (the first places). A type with more than one row is a
 * type whose size is not one. Then where the cards open (their width, and their
 * place against what opened them) and the navigation (rails, arrows, Back,
 * chapters, links).
 */
import { readFileSync, writeFileSync } from "node:fs";

const [file] = process.argv.slice(2).filter(item => !item.startsWith("--"));
const mdOut = process.argv.includes("--md") ? process.argv[process.argv.indexOf("--md") + 1] : null;
const data = JSON.parse(readFileSync(file, "utf8"));
const lines = [];
const say = text => lines.push(text);

const short = text => (text.length > 70 ? text.slice(0, 67) + "..." : text);
const where = record => record.system.replace(" System", "") + " / " + record.page + (record.path ? " / " + record.path : "");

function table(title, records, signatureOf, labelOf) {
    const groups = new Map();
    for (const record of records) {
        const key = signatureOf(record);
        const entry = groups.get(key) ?? { count: 0, places: new Map() };
        entry.count++;
        const place = where(record);
        if (!entry.places.has(place)) entry.places.set(place, labelOf ? labelOf(record) : "");
        groups.set(key, entry);
    }
    say("### " + title + " (" + records.length + " found, " + groups.size + " distinct)");
    say("");
    say("| Signature | Times | First places |");
    say("|---|---|---|");
    for (const [key, entry] of [...groups].sort((a, b) => b[1].count - a[1].count).slice(0, 12)) {
        say("| " + key + " | " + entry.count + " | " + [...entry.places].slice(0, 2).map(([place, label]) => short(place) + (label ? " (" + label + ")" : "")).join("; ") + " |");
    }
    say("");
}

say("# Card scan: " + data.example + ", " + data.width + "px wide, " + data.theme + " reading mode");
say("");
say(data.records.length + " records; " + data.problems.length + " problems.");
say("");

const controls = data.records.filter(record => record.kind === "control");
say("## Control types");
say("");
say("A signature is height x font size, corner radius, left padding, border. Width is listed apart because a control may fill its column (the signature shows fill or a fixed width).");
say("");
for (const type of [...new Set(controls.map(record => record.type))]) {
    const ofType = controls.filter(record => record.type === type);
    table(type, ofType, record => record.h + " high, " + record.font + "px, r " + record.radius + ", pad " + record.padL + ", border " + record.border + (record.fill ? ", fills" : ", w " + Math.round(record.w)), record => record.cls);
}

const surfaces = data.records.filter(record => record.kind === "surface");
say("## Surfaces");
say("");
for (const type of [...new Set(surfaces.map(record => record.type))]) {
    const ofType = surfaces.filter(record => record.type === type);
    table(type, ofType, record => "w " + Math.round(record.w) + ", r " + record.radius + ", pad " + record.padT + "/" + record.padL + "/" + record.padB + ", " + record.shadow, record => record.cls);
}

const placements = data.records.filter(record => record.kind === "placement");
say("## Where a card opens");
say("");
say(placements.length + " floating cards opened. Card width, and the card's place against what opened it (dx: the card's centre less the frame's centre; dTop: the card's top less the frame's top; dOpener: the card's top less the opener's top).");
say("");
table("Floating card width by kind", placements, record => (record.cls || "") + " w " + Math.round(record.host.w), record => "body " + (record.body ? Math.round(record.body.w) : "?"));
const place = placements.filter(record => record.frame).map(record => ({
    system: record.system, page: record.page, path: record.path,
    dx: Math.round(record.host.x + record.host.w / 2 - (record.frame.x + record.frame.w / 2)),
    dTop: Math.round(record.host.y - record.frame.y),
    dOpener: Math.round(record.host.y - record.opener.y),
    caption: record.caption && record.body ? Math.round(record.body.y - (record.caption.y + record.caption.h)) : null
}));
table("Place against the frame (dx, dTop)", place.map(item => ({ ...item })), item => "dx " + item.dx + ", dTop " + item.dTop, item => "dOpener " + item.dOpener);
table("Gap between a card's box name and the card", place.filter(item => item.caption !== null), item => "gap " + item.caption);
const withArrows = placements.filter(record => record.arrows.length);
say(withArrows.length + " of the cards have carousel arrows; " + placements.filter(record => record.rail).length + " have a carousel rail.");
say("");

const nav = data.records.filter(record => record.kind === "nav");
say("## Navigation");
say("");
for (const type of [...new Set(nav.map(record => record.type))]) {
    const ofType = nav.filter(record => record.type === type);
    table(type, ofType, record => "w " + Math.round(record.w) + " x h " + Math.round(record.h) + (record.bullet ? ", bullet " + record.bullet : "") + (record.tab ? ", " + record.tab : "") + (record.items !== undefined ? ", items " + record.items : ""), record => record.label);
}

if (data.problems.length) {
    say("## Problems of the scan");
    say("");
    for (const problem of data.problems) say("- " + problem);
}

const text = lines.join("\n") + "\n";
if (mdOut) writeFileSync(mdOut, text);
console.log(text);
