/**
 * Writes the list of the fields (docs/design/16-fields-list.md): for every field, the components it uses, its words,
 * its reaction and its effect, and, under it, its variants (the forms it takes in the cards, from the card tables of
 * docs/design/07-structure-tables.md). With --export it also writes the Excel and CSV versions into exports/, where the
 * variants are folded under their field. The first part lists the ADD buttons that exist in the four systems, with
 * their words, their place and their component.
 *
 *   node scripts/library/fields-list.mjs [--check] [--export]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "../catalogue/build.mjs";
import { library } from "../../src/library/data/library.ts";
import { REACTION, SOURCE, DETAIL } from "./specs.mjs";
import { writeXlsx } from "./xlsx.mjs";

const file = "docs/design/16-fields-list.md";
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

// ---- the add buttons that exist in the four systems (scanned in the source on 2026-10-16)
const ADDS = [
    ["+ Add legal requirement; + Add registration number; + Add tax registration", "Identity: the Legal Entity card (the lists)", "BTN.ROW.004.001", "Adds a row to the list; the lists run the whole width of the column."],
    ["+ Add founder; + Add expense", "Identity: the Legal Entity card", "BTN.004", "Adds a founder or an expense."],
    ["+ Add Colour; + Add Typeface", "Brand: the Colours and the Typefaces", "BTN.004", "Opens the first free role."],
    ["+ Add Profile (the plus tile)", "Brand and Identity: the pages that list profile cards", "BTN.PLS.005.001", "Adds a profile card; a tile with only a plus."],
    ["+ Add Offering; + Add Journey Stage; + Add Relationship Type; + Add resource", "Business: Customer Engagement and its cards", "BTN.004", "Adds an offering, a stage, a relationship type or a resource."],
    ["+ Add channel", "Business: Customer Engagement", "BTN.004", "Adds a channel."],
    ["+ Add expense; + Add expenses", "Business: the cards of a channel and of a place", "BTN.004", "Opens a menu: a blank expense, all the typical costs, one of them, or a card to link."],
    ["+ Add (with the name of what is added: Goal, Objective, Metric, Initiative)", "Strategy: the Theme, Goal, Objective and Metric boxes", "BTN.004", "Adds the next nested card; the words are made from the kind of card."],
    ["Add {card} to {tile} (a plus box, 36px on the tile today)", "Every master tile and every tile view", "BTN.ADD.001.001", "Adds a card of that kind and opens it."],
    ["Add {status} to {card} (a plus box, 32px)", "The rows inside a card (a new status row, a new line)", "BTN.ADD.001.001", "Adds a row."],
    ["Add row; Add item; Add entry; Add another {column}", "The tables of the pages", "BTN.ADD.001.001", "Adds a row to the table."],
    ["+ Add Card (a tile of words and a plus)", "The end of the grid in an opened tile view", "BTN.005", "Adds a card of any kind the view holds."],
    ["+ Add (an option at the end of a dropdown list, not a button)", "The dropdowns of cards (Activity, Performer ...)", "DRP.001", "An option with a reaction: it makes an ordinary activity, chooses it and asks its name."],
    ["+ Add note; Add Date; Link a field", "The notes panel", "BTN.SML.004.002", "Adds a note, a date to the note, or a link to a field."]
];
const NOT_FOUNDATION = "Outside the four systems (not in the library): + Add Organization (the landing page), + Add channel (Global Settings), + Add Process and + Add SOP (the Process Library).";

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
const probeFile = JSON.parse(readFileSync("catalogue/probes/add-probe-quillfield-1920-light.json", "utf8")).records;
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
    "Generated by `node scripts/library/fields-list.mjs` from the library and the card tables (docs/design/07-structure-tables.md, " + rows.length + " rows). Do not edit by hand. For each of the " + fields.length + " fields: the components it uses, its words (the label and the shown values; the options of a dropdown), its reaction (what the person does, and what the component does under the pointer and the keyboard) and its effect (what it does to the card). Under a field stand its variants: the forms it takes in the cards, each with its own components, words and the card kinds that show it. A field that no card table names (found only by a probe) has no variants. The reactions are those measured on 2026-10-15 and 2026-10-16.", "",
    "## The ADD buttons that exist", "",
    "Scanned in the source of the app on 2026-10-16; every form is already a component. The plus box (BTN.001, Add) stands in rows, heads of tiles and tables; the wide add button (BTN.004) carries words and has the full-row and the small versions; the add tile (BTN.005) has the plus tile; the option + Add of a dropdown is a reaction of an option, not a button.", "",
    "| Words | Where | Component | What it does |", "|---|---|---|---|");
for (const [words, where, code, does] of ADDS) say("| " + words + " | " + where + " | " + nameOf(code) + " | " + does + " |");
say("", NOT_FOUNDATION, "", "## The fields", "",
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
say("");
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
        const addRows = [["Words", "Where", "Component", "What it does"], ...ADDS.map(([w, wh, c, d]) => [w, wh, nameOf(c), d])];
        writeXlsx("exports/The-add-buttons.xlsx", { name: "Add buttons", header: addRows[0], rows: addRows.slice(1).map(cells => ({ cells })), widths: [60, 48, 36, 70] });
        console.log("wrote exports/The-fields.xlsx, The-fields.csv and The-add-buttons.xlsx");
    }
}
