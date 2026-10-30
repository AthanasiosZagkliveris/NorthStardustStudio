/**
 * The field names of the library with a description of each, as one part of the fields document
 * (docs/design/library/14-fields-list.md, written by tools/scripts/library/fields-list.mjs): the code, the name, the names it was
 * made from, what it contains (the words of document 01 Part F), the components it is built from, how many card
 * kinds hold it, and a flag where the name needs the owner's look. This module only returns the lines; it writes no file.
 */
import { library } from "../../../src/library/data/library.ts";
import { table } from "../../../src/library/tables/index.ts";

const cell = value => String(value ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();

const flagsOf = (asset, rawNames, fromPartF) => {
    const flags = [];
    if (!fromPartF) flags.push("found by a probe, not in Part F: the name may be the probe's");
    if (/^\d|\d$/.test(asset.name)) flags.push("has a number");
    if (/ i$| i /.test(asset.name)) flags.push("an info letter in the name");
    if (rawNames.length > 1) flags.push("made from " + rawNames.length + " names");
    if (asset.requires.filter(r => !r.asset.startsWith("TXS.")).length > 2) flags.push("more than two components");
    if (/^(tick box|text box|text area|number box|dropdown|date cell)$/i.test(asset.name)) flags.push("named after its control");
    return flags;
};

/** The lines of the section "The field names"; db is the catalogue database of tools/scripts/catalogue/build.mjs. */
export function fieldNamesSection(db) {
    const rows = db.prepare("select field, what, function, status from variant_rows").all();
    const fieldTable = new Map(table("F").rows.map(r => [String(r.id), r]));
    const used = new Map();
    for (const k of table("K").rows) for (const id of String(k.fields_in_order).split(" ")) used.set(id, (used.get(id) ?? 0) + 1);
    const byCode = new Map(library.assets.map(a => [a.code, a]));
    const out = [];
    out.push("## The field names", "",
        "One row per field asset (FLD), from the library and document 01 Part F: its name, what it contains in the words of Part F, the components it is built from, and how many card kinds hold it. A flag marks a name that needs a look.", "");
    const fields = library.assets.filter(a => a.category === "field");
    const flagged = [];
    out.push("| Code | Name | What it contains (Part F) | Built from | In card kinds | Made from the names | Flag |", "|---|---|---|---|---|---|---|");
    for (const a of fields) {
        const raw = a.catalogue.map(id => String(fieldTable.get(id)?.name ?? "")).filter(Boolean);
        const rawNames = [...new Set(raw)];
        const partF = rows.filter(r => rawNames.some(n => r.field.trim().toLowerCase() === n.trim().toLowerCase() || r.field.trim().toLowerCase().replace(/ \d+ /g, " ").replace(/([a-z])i$/, "$1") === a.name.toLowerCase()));
        const what = (partF.find(r => r.what) ?? { what: "" }).what.replace(/^[^:]*: /, "").slice(0, 160);
        const flags = flagsOf(a, rawNames, partF.length > 0);
        if (flags.length) flagged.push(a.code + " " + a.name + ": " + flags.join("; "));
        const built = a.requires.map(r => { const t = byCode.get(r.asset); const v = t?.variants.find(x => x.code === r.variant); return (v ? v.name : t?.name) + " (" + r.role + ")"; }).join("; ");
        const inKinds = a.catalogue.reduce((n, id) => n + (used.get(id) ?? 0), 0);
        out.push("| " + a.code + " | " + cell(a.name) + " | " + cell(what || "(found by a probe, not described in Part F)") + " | " + cell(built) + " | " + inKinds + " | " + cell(rawNames.join("; ")) + " | " + cell(flags.join("; ")) + " |");
    }
    out.push("", "### Names that need a look (" + flagged.length + ")", "", ...flagged.map(f => "- " + f), "");
    return out;
}
