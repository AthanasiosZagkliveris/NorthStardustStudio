/**
 * Writes the list of the fields (docs/design/library/15-fields-list.md), with the field names (tools/scripts/library/field-names.mjs) as its last part: for every field, the components it uses, its words,
 * its reaction and its effect, and, under it, its variants (the forms it takes in the cards, from the card tables of
 * docs/design/records/07-structure-tables.md). With --export it also writes the Excel and CSV versions into exports/, where the
 * variants are folded under their field. The first part lists the ADD buttons that exist in the four systems, with
 * their words, their place and their component.
 *
 *   node tools/scripts/library/fields-list.mjs [--check] [--export]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "../catalogue/build.mjs";
import { library } from "../../../src/library/data/library.ts";
import { REACTION, SOURCE, DETAIL } from "./specs.mjs";
import { writeXlsx } from "./xlsx.mjs";
import { fieldNamesSection } from "./field-names.mjs";

const file = "docs/design/library/15-fields-list.md";
const db = await build(".");
const byCode = new Map(library.assets.map(a => [a.code, a]));
const variantByCode = new Map(library.assets.flatMap(a => a.variants.map(v => [v.code, { v, a }])));
const nameOf = code => {
    if (byCode.has(code)) return byCode.get(code).name + " (" + code + ")";
    const hit = variantByCode.get(code);
    if (!hit) throw new Error("no component " + code);
    return hit.a.name + ", " + hit.v.name + " (" + code + ")";
};
const assetOf = code => (code.split(".").length === 4 ? code.split(".")[0] + "." + code.split(".")[2] : code);
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
const short = (t, n = 260) => (t.length > n ? t.slice(0, n - 1) + "…" : t);

// ---- the add buttons found by the walk of the running app (tools/scripts/catalogue/app-crawl.mjs, 2026-10-16)
const crawl = existsSync("tools/catalogue/measures/crawl-quillfield-1920.json") ? JSON.parse(readFileSync("tools/catalogue/measures/crawl-quillfield-1920.json", "utf8")) : { scenes: [] };
const ADD_CLASSES = [
    [/legal-entity-list-add/, "BTN.ROW.004.001", "wide add button across the column"],
    [/strategy-add-button/, "BTN.004", "wide add button, hugging"],
    [/plus-box.*section-tile-plus/, "BTN.ADD.001.001", "plus box on a tile"],
    [/plus-box-small/, "BTN.ADD.001.001", "plus box in a card row"],
    [/strategy-box-add/, "BTN.ADD.001.001", "plus in a nested head"],
    [/profile-card-add-tile/, "BTN.PLS.005.001", "plus tile of the profile pages"],
    [/add-card-tile/, "BTN.005", "add tile of words and a plus"]
];
const found = new Map();
for (const scene of crawl.scenes) {
    for (const item of scene.items) {
        const hit = ADD_CLASSES.find(([re]) => re.test(item.cls));
        if (!hit) continue;
        const key = hit[2];
        if (!found.has(key)) found.set(key, { code: hit[1], sizes: new Set(), words: new Set(), views: new Set(), n: new Set() });
        const e = found.get(key);
        e.sizes.add(item.w + " by " + item.h + " px");
        e.words.add(item.aria && /^Add /.test(item.aria) ? item.aria : item.text.replace(/^\+\s*/, "+ "));
        e.views.add(scene.where);
        e.n.add(scene.where + "|" + item.cls + "|" + item.aria + "|" + item.text);
    }
}
const ADDS = [...found].map(([label, e]) => [label, nameOf(e.code), [...e.sizes].slice(0, 4).join("; "), e.words.size + " different words, for example: " + [...e.words].slice(0, 8).join("; "), "seen in " + e.views.size + " views of the walk"]);
const IN_SOURCE = "In the source of the app, but not reached by the walk (a deeper card, or built from a label): + Add Offering, + Add Relationship Type, + Add resource, + Add Colour, + Add Typeface, + Add expense and + Add expenses (opens a menu), + Add with the kind of nested card in Strategy, + Add note, Add Date and Link a field (the notes panel), the option + Add at the end of a dropdown list (it makes an ordinary activity, chooses it and asks its name). Outside the four systems: + Add Organization (the landing page), + Add channel (Global Settings), + Add Process and + Add SOP (the Process Library).";
const WALK = "The walk opened every page of the four systems, every master tile, and the first two cards of each view (" + crawl.scenes.length + " views); a card deeper than that was not opened.";

// ---- the components of a form of a field, from the control the card tables name
const componentsOf = r => {
    const c = r.control, f = r.function ?? "";
    if (c === "dropdown") return [f.includes("Searchable") ? "DRP.SRC.001.001" : "DRP.001"];
    if (c === "text box") return [r.field === "Name" ? "TXT.NAM.001.002" : "TXT.001"];
    if (c === "optional note") return ["TXT.ARE.001.001"];
    if (c === "number box") return [/whole/i.test(f) ? "TXT.WHL.001.003" : /decimal/i.test(f) ? "TXT.DEC.001.004" : /\(%\)|\(years\)/.test(f) ? "TXT.SQR.001.005" : "TXT.WHL.001.003"];
    if (c === "date cell") return ["DAT.001"];
    if (c === "tick box") return ["TIK.001"];
    if (c === "tick list (+ number)") return ["TIK.001", "TXT.SQR.001.005"];
    if (c === "extra (tick + number)") return ["TIK.001", "TXT.WHL.001.003"];
    if (c === "tick + dropdown") return ["TIK.001", "DRP.001"];
    if (c === "link symbol") return ["BTN.007"];
    if (c === "x") return ["BTN.001"];
    if (c === "plus") return ["BTN.ADD.001.001"];
    if (c === "button") return ["BTN.SML.004.002"];
    if (c === "read-only") return ["TXS.001"];
    return [];
};

// ---- the card tables
const rows = db.prepare("select r.variant, r.row, r.position, r.field, r.label, r.action, r.function, r.status, r.control, r.what, v.place, v.section, v.category, v.grp from variant_rows r join variants v on v.id = r.variant order by r.variant, r.row, r.position").all();
const namesOfRow = new Map();
for (const r of rows) { const k = r.variant + "|" + r.row; if (!namesOfRow.has(k)) namesOfRow.set(k, []); if (!namesOfRow.get(k).includes(r.field)) namesOfRow.get(k).push(r.field); }
const segment = (r) => {
    const names = namesOfRow.get(r.variant + "|" + r.row);
    const pos = names.map(n => ({ n, i: r.what.indexOf(n + ": ") })).filter(p => p.i >= 0).sort((a, b) => a.i - b.i);
    const at = pos.findIndex(p => p.n === r.field);
    if (at < 0) return null;
    const start = pos[at].i + r.field.length + 2;
    const end = at + 1 < pos.length ? pos[at + 1].i : r.what.length;
    return r.what.slice(start, end).trim() || null;
};
const probeFile = JSON.parse(readFileSync("tools/catalogue/probes/add-probe-quillfield-1920-light.json", "utf8")).records;
const optionsOf = new Map();
for (const card of probeFile.filter(r => r.choice === "(new)" && r.card)) {
    const labels = card.card.fields.filter(f => f.startsWith("dropdown:")).map(f => f.slice(9).replace(/i$/, ""));
    for (const rec of probeFile.filter(r => r.plus === card.plus && r.page === card.page && /^dropdown \d+ options$/.test(r.choice ?? ""))) {
        const label = labels[Number(rec.choice.split(" ")[1])];
        if (label) optionsOf.set(label, [...new Set([...(optionsOf.get(label) ?? []), ...rec.options])]);
    }
}
const mode = list => { const c = new Map(); for (const x of list.filter(Boolean)) c.set(x, (c.get(x) ?? 0) + 1); return [...c].sort((a, b) => b[1] - a[1]).map(([x]) => x); };

const fields = library.assets.filter(a => a.category === "field");
const reactionOf = codes => codes.filter(c => c !== "TXS.001").map(c => REACTION[assetOf(c)]).filter(Boolean)[0] ?? "";
const out = [];
const say = (...l) => out.push(...l);
const sheet = [];
const flat = [["Code", "Field", "Kind", "Components", "Words", "Reaction", "Effect", "Where"]];

say("# The fields", "",
    "Generated by `node tools/scripts/library/fields-list.mjs` from the library and the card tables (docs/design/records/07-structure-tables.md, " + rows.length + " rows). Do not edit by hand. The last part, The field names, says how each name was made and flags the names that need a look. For each of the " + fields.length + " fields: the components it uses, its words (the label and the shown values; the options of a dropdown), its reaction (what the person does, and what the component does under the pointer and the keyboard) and its effect (what it does to the card). Under a field stand its variants: the forms it takes in the cards, each with its own components, words and the card kinds that show it. A field that no card table names (found only by a probe) has no variants. The reactions are those measured on 2026-10-15 and 2026-10-16.", "",
    "## The ADD buttons that exist", "",
    "Found by walking the running app on 2026-10-16. " + WALK + " The plus box (BTN.001, Add) stands in rows, heads of tiles and nested boxes; the wide add button (BTN.004) carries words and has the full-row and the small versions; the add tile (BTN.005) has the plus tile.", "",
    "| Kind of control | Library component | Size | Words | Seen |", "|---|---|---|---|---|");
for (const row of ADDS) say("| " + row.join(" | ") + " |");
say("", IN_SOURCE, "", "## The fields", "",
    "| Code | Field | Components | Words | Reaction | Effect |", "|---|---|---|---|---|---|");

for (const f of fields) {
    const mine = rows.filter(r => r.field === f.name);
    const comps = [...new Set(f.requires.map(r => (r.variant ? nameOf(r.variant) : nameOf(r.asset)) + (r.role ? ": " + r.role : "")))];
    const opts = optionsOf.get(f.name) ?? [];
    const labels = mode(mine.map(r => r.label));
    const words = [f.name, ...labels.filter(l => l !== f.name).slice(0, 8)].join("; ") + (opts.length ? ". Options: " + opts.slice(0, 10).join("; ") + (opts.length > 10 ? "; …" : "") : "") + (SOURCE[f.name] ? " (" + SOURCE[f.name] + ")" : "");
    const actions = mode(mine.map(r => r.action));
    const mainComps = mode(mine.flatMap(r => componentsOf(r)));
    const reaction = (actions.length ? "Does: " + actions.join(", ") + ". " : "") + reactionOf(mainComps);
    const effect = mode(mine.map(r => segment(r)))[0] ?? DETAIL[f.name] ?? "";
    const kinds = new Set(mine.map(r => r.variant)).size;
    const cells = [f.code, f.name, comps.join("; "), short(words, 400), short(reaction, 400), short(effect, 400) + (kinds ? " (in " + plural(kinds, "card kind") + ")" : "")];
    say("| " + cells.map(c => c.replace(/\|/g, "/")).join(" | ") + " |");
    sheet.push({ cells: [cells[0], cells[1], "field", cells[2], cells[3], cells[4], cells[5], kinds ? plural(kinds, "card kind") : "found by a probe"], bold: true });
    flat.push([cells[0], cells[1], "field", cells[2], cells[3], cells[4], cells[5], kinds ? plural(kinds, "card kind") : "found by a probe"]);
    // the variants: the forms of the field in the cards
    const forms = new Map();
    for (const r of mine) {
        const key = [r.control, r.function, r.status].join("|");
        if (!forms.has(key)) forms.set(key, []);
        forms.get(key).push(r);
    }
    for (const [, list] of [...forms].sort((a, b) => b[1].length - a[1].length)) {
        const r = list[0];
        const cs = componentsOf(r);
        const fc = ["Body text (TXS.001): the label", ...cs.map(nameOf)];
        const w = mode(list.map(x => x.label)).slice(0, 6).join("; ") + (r.control === "dropdown" && opts.length ? ". Options: " + opts.slice(0, 8).join("; ") : "");
        const places = [...new Set(list.map(x => [x.category, x.grp].filter(Boolean).join(" > ")))];
        const vkinds = new Set(list.map(x => x.variant)).size;
        const reactionForm = (r.action ? "Does: " + r.action + ". " : "") + reactionOf(cs) + (/Other/.test(r.function ?? "") ? " The option Other opens a text box." : "");
        const eff = r.status + ". " + (mode(list.map(x => segment(x)))[0] ? short(mode(list.map(x => segment(x)))[0], 240) + " " : "") + "Shown in " + plural(vkinds, "card kind") + ": " + places.slice(0, 4).join("; ") + (places.length > 4 ? "; …" : "") + ".";
        const cells2 = ["↳", r.function, fc.join("; "), short(w, 300), short(reactionForm, 300), short(eff, 420)];
        say("| " + cells2.map(c => String(c).replace(/\|/g, "/")).join(" | ") + " |");
        sheet.push({ cells: ["", f.code, "variant: " + r.function, cells2[2], cells2[3], cells2[4], cells2[5], plural(vkinds, "card kind")], level: 1 });
        flat.push(["", f.code, "variant: " + r.function, cells2[2], cells2[3], cells2[4], cells2[5], plural(vkinds, "card kind")]);
    }
}
say("", ...fieldNamesSection(db));
const text = out.join("\n") + "\n";

const csv = rows2 => "﻿" + rows2.map(r => r.map(v => '"' + String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ") + '"').join(",")).join("\r\n") + "\r\n";
if (process.argv.includes("--check")) {
    const now = existsSync(file) ? readFileSync(file, "utf8").split("\r").join("") : "";
    if (now !== text) { console.error("out of date: " + file); process.exit(1); }
    console.log("the fields list is up to date");
} else {
    writeFileSync(file, text);
    console.log("wrote " + file + " (" + out.length + " lines)");
    if (process.argv.includes("--export")) {
        mkdirSync("exports", { recursive: true });
        writeFileSync("exports/The-fields.csv", csv(flat));
        writeXlsx("exports/The-fields.xlsx", { name: "Fields", header: flat[0], rows: sheet, widths: [10, 26, 18, 48, 48, 44, 60, 22] });
        const addRows = [["Kind of control", "Library component", "Size", "Words", "Seen"], ...ADDS];
        writeXlsx("exports/The-add-buttons.xlsx", { name: "Add buttons", header: addRows[0], rows: addRows.slice(1).map(cells => ({ cells })), widths: [36, 40, 30, 90, 24] });
        console.log("wrote exports/The-fields.xlsx, The-fields.csv and The-add-buttons.xlsx");
    }
}
