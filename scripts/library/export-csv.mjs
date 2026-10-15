/**
 * Writes files that open in Excel: one row per asset and, directly under it, one row per variant (the Excel file
 * folds the variants under their asset with the little minus at the left) (UTF-8 with a byte order mark, comma separated, every cell quoted):
 *
 *   catalogue/exports/components.csv   one row per component (and frame): family, group, code, name, what it is,
 *                                      its default size, text, shape and spacing, where it is found, its variables,
 *                                      its variants collapsed, what it is built from, the notes
 *   catalogue/exports/dropdowns.csv    one row per dropdown cell: where its options come from (prefilled, dependent,
 *                                      generated, with Other), the cards that hold it and its options
 *
 *   node scripts/library/export-csv.mjs [--check]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "../catalogue/build.mjs";
import { library } from "../../src/library/data/library.ts";
import { sizeOf, variantSizeOf } from "./specs.mjs";
import { writeXlsx } from "./xlsx.mjs";

const check = process.argv.includes("--check");
mkdirSync("catalogue/exports", { recursive: true });
const cell = v => '"' + String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ") + '"';
const csv = rows => "﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n") + "\r\n";
let stale = 0;
const put = (file, text) => {
    if (!check) { writeFileSync(file, text); return; }
    const now = existsSync(file) ? readFileSync(file, "utf8") : "";
    if (now !== text) { stale++; console.error("out of date: " + file); }
};
const db = await build(".");
const px = n => (n === null || n === undefined ? "" : n + " px");
const byCode = new Map(library.assets.map(a => [a.code, a]));
const variableName = new Map(library.variables.map(v => [v.code, v.name]));
const groupOf = new Map(library.families.flatMap(f => f.groups.map(g => [g.code, { family: f, group: g }])));

const lookCells = l => l ? [l.height === null ? "follows the words" + (l.minHeight ? ", at least " + l.minHeight + " px" : "") : px(l.height), l.width ? px(l.width) : "", l.fontSize ? l.fontSize + " px (" + l.scale + ")" : "no text", l.fontWeight, parseFloat(l.corners) ? l.corners.replace("px", " px") : "", l.border ? l.border + " px" : "", l.paddingLeft + " / " + l.paddingTop + " px", l.found || "", l.places ?? ""] : ["", "", "", "", "", "", "", "", ""];
const variantText = v => v.code + " " + v.name + (v.look ? " [" + [v.look.height === null ? "words" : v.look.height + (v.look.width ? " x " + v.look.width : "") + " px", parseFloat(v.look.corners) ? v.look.corners : ""].filter(Boolean).join(", ") + "]" : "") + ": " + v.description;
const FOUND = {
    "BTN.001": "type = 'x' or (type = 'plus' and cls like '%plus-box%')", "BTN.002": "type = 'info'", "BTN.004": "type = 'plus' and cls like '%strategy-add-button%'", "DRP.001": "type = 'dropdown'", "TIK.001": "type = 'tick box'",
    "TXT.001": "type in ('text box', 'text area') and cls not like '%date-cell-input%' and cls not like '%numbered-list-input%'", "LST.001": "type = 'text area' and cls like '%numbered-list-input%'", "NUM.001": "type = 'number box'",
    "DAT.001": "type = 'text box' and cls like '%date-cell-input%'", "LBL.001": "type = 'label'", "ARW.002": "type in ('fold arrow', 'label arrow')"
};
const where = code => {
    if (!FOUND[code]) return "";
    const rows = db.prepare("select system, page, count(*) n from observations where kind = 'control' and " + FOUND[code] + " group by system, page order by n desc limit 5").all();
    return rows.map(r => r.system.replace(" System", "") + ", " + r.page + " " + r.n).join("; ");
};

const short = t => { const s = String(t ?? "").split(". ")[0]; return s.length > 140 ? s.slice(0, 137) + "..." : s; };
const head = ["Family / Group", "Code", "Name", "Height", "Width", "Text size", "Corners", "What it is", "Found (instances)", "Places in the app", "Where found (top pages)"];
const rows = [head];
const sheet = [];
for (const a of library.assets.filter(x => x.category === "component" || x.group)) {
    const home = groupOf.get(a.group);
    const s = sizeOf(a);
    const cells = [(home?.family.name ?? "") + " / " + (home?.group.name ?? ""), a.code, a.name, s.height, s.width, s.text, s.corners, short(a.summary), a.look?.found ?? "", a.look?.places ?? "", where(a.code)];
    rows.push(cells);
    sheet.push({ cells, bold: true });
    for (const v of a.variants) {
        const vs = variantSizeOf(a, v);
        const vc = ["", v.code, "   " + v.name, vs.height, vs.width, vs.text, vs.corners, short(v.description), v.look?.found ?? "", "", ""];
        rows.push(vc);
        sheet.push({ cells: vc, level: 1 });
    }
}
put("catalogue/exports/components.csv", csv(rows));

// ---- the dropdowns: where the options come from
const SOURCE = {
    Status: "prefilled", Frequency: "prefilled", Currency: "prefilled", Unit: "prefilled", Plan: "prefilled", "Cost option": "prefilled", "Cost options": "prefilled", Type: "prefilled", Category: "prefilled",
    Group: "dependent", Activity: "generated", Performer: "generated", Resource: "generated", Responsibility: "generated", "Linked registration": "generated", Name: "prefilled suggestions and free entry (With Other)", Rent: "generated, with free entry (With Other)"
};
const DETAIL = {
    Group: "The groups of the chosen Category in this place (the list depends on the Category).", Category: "The categories of this place.", Activity: "The activities that have not ended at the card's Start date, with their category (generated from the activities of the place).",
    Performer: "The founders first, then the partners and suppliers of the same place (generated from the founders and the partners).", Resource: "The resources of the place (generated from the Resources).", Responsibility: "The founders; shown when there is more than one founder.",
    "Linked registration": "The registrations and requirements already recorded on the page; only one can be chosen.", Rent: "The suppliers in Property, Vehicles & Facilities; opens or creates a card; Other adds a new one.", Name: "Suggested partners or suppliers of the chosen group; Other adds a name.",
    Status: "Exists / Free; Rent; Activity; Buy (the options follow the card).", Frequency: "Weekly, Monthly or Annually (a project: Per project).", Currency: "A searchable list of currencies.", Unit: "The units of a quantity.", Plan: "The payment plan options.", "Cost option": "The cost options of the group (Percentage, Fixed amount, Lump sum...).", Type: "Capital Expenditure; Start-up Expenses."
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
const fieldRows = db.prepare("select field, function, count(*) n, count(distinct variant) kinds, max(what) what from variant_rows where control = 'dropdown' group by field, function order by n desc").all();
const drop = [["Field", "Function in the card", "Rows", "Card kinds that hold it", "Options source", "Where the options come from", "Options (first 12 found)", "Part F, what it contains"]];
for (const r of fieldRows) {
    const label = r.field.trim();
    const opts = optionsOf.get(label) ?? [];
    drop.push([label, r.function, r.n, r.kinds, SOURCE[label] ?? "not classified", DETAIL[label] ?? "", opts.slice(0, 12).join("; "), (r.what ?? "").slice(0, 300)]);
}
put("catalogue/exports/dropdowns.csv", csv(drop));
if (!check) {
    mkdirSync("exports", { recursive: true });
    writeXlsx("exports/The-components.xlsx", { name: "Components", header: head, rows: sheet, widths: [28, 20, 26, 22, 26, 16, 10, 60, 12, 12, 50] });
    writeXlsx("exports/The-dropdowns.xlsx", { name: "Dropdowns", header: drop[0], rows: drop.slice(1).map(cells => ({ cells })), widths: [24, 24, 8, 12, 24, 60, 60, 60] });
}
if (check) { if (stale) { console.error("run npm run library:csv"); process.exit(1); } console.log("the CSV files are up to date"); }
else console.log("wrote catalogue/exports/components.csv (" + (rows.length - 1) + " components) and dropdowns.csv (" + (drop.length - 1) + " dropdown cells)");
