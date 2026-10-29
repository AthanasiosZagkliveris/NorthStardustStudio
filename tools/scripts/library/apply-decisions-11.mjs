/**
 * The owner's corrections of 2026-10-15, eleventh set, applied to the library once (a migration, kept as the
 * record; the changes are then logged with npm run library:log):
 *
 *   - A holder is ONE asset with variants: its size can change and it takes different features (only numbers, the
 *     amount of digits, growing down, growing under conditions). The number box therefore is not an asset of its
 *     own: the whole number, the decimal, the percent, the years and the months are variants of the holder.
 *   - A link is an asset whose variants differ in style, size and function. The tile link, the card name link, the
 *     page link and the link symbol are places where a link is used, not variants: the variants are the underlined
 *     text link, the blue text link and the symbol link, and the places are recorded as uses.
 *
 *   node tools/scripts/library/apply-decisions-11.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const variables = structuredClone(library.variables);
const assets = structuredClone(library.assets);
const families = structuredClone(library.families);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

// ---- the variables of a holder
const growth = variables.find(v => v.code === "VAR014");
growth.description = "How a holder takes more room as the person writes.";
growth.values = [
    { name: "fixed space", description: "The cell keeps the space it has." },
    { name: "grows down", description: "The cell gets bigger downwards as you type or press Enter." },
    { name: "grows under conditions", description: "The cell appears or grows only when a condition is met (a tick opens it, a status shows it)." }
];
variables.push({
    code: "VAR017", name: "input", description: "What the person can type in a holder.",
    values: [{ name: "text", description: "Letters, numbers and signs." }, { name: "numbers only", description: "Only digits can be typed (a decimal also takes the point)." }]
});
const fix = a => { a.variants = a.variants.map(v => ({ ...v, values: Object.fromEntries(Object.entries(v.values ?? {}).map(([k, x]) => [k, k === "VAR014" && x === "grows" ? "grows down" : x])) })); };
for (const a of assets) fix(a);

// ---- the holder: text and numbers, one asset
const holder = asset("TXT.001");
const number = asset("NUM.001");
holder.name = "holder";
holder.group = "HOLD.CEL";
holder.variables = ["VAR001", "VAR002", "VAR003", "VAR004", "VAR006", "VAR014", "VAR015", "VAR017"];
holder.summary = "The cell a person fills in with text or numbers, in the body size. Its size can change and it takes different features: what can be typed (text, or numbers only), how many digits are accepted, and whether it keeps its space, grows down as you write, or grows under conditions. A text that is only read is not a holder (see the help text, label, title and link).";
for (const v of holder.variants) v.values = { VAR017: "text", ...v.values };
const moved = [
    ["NUM.WHL.001.001", "TXT.WHL.001.004", "Whole number", "Whole numbers only; no more digits than the field requires.", "Numbers only; the digit limit is set by the field.", undefined],
    ["NUM.DEC.001.002", "TXT.DEC.001.005", "Decimal", "A number with decimals; no more digits than the field requires.", "Numbers and the decimal point.", undefined],
    ["NUM.PCT.001.003", "TXT.PCT.001.006", "Percent", "A number from 0 to 100 with a percent sign beside it; a square box, 44 by 44px.", "A square box with a percent sign beside it.", true],
    ["NUM.YRS.001.004", "TXT.YRS.001.007", "Years", "A number of years; a square box, 44 by 44px.", "A square box with the word years beside it.", true],
    ["NUM.MON.001.005", "TXT.MON.001.008", "Months", "A number of months (Target operating reserve: 3 months); a square box, 44 by 44px.", "A square box with the word months beside it.", true]
];
const codeMap = {};
for (const [from, to, name, description, edits] of moved) {
    const v = number.variants.find(x => x.code === from);
    codeMap[from] = to;
    holder.variants.push({ code: to, name, description, edits, values: { VAR017: "numbers only", VAR015: "as required", VAR014: "fixed space" }, ...(v.look ? { look: v.look } : {}) });
}
holder.lookNotes = [...(holder.lookNotes ?? []), "a holder is one asset with variants (" + DATE + "): its size can change and it takes features (only numbers, the amount of digits, growing down, growing under conditions); the number box is therefore a set of variants of the holder. Measured defaults of the number box: 44px high, 6px corners, padding 10/8 (166 found in 11 places); the percent, years and months boxes are squares of 44 by 44px.", ...(number.lookNotes ?? [])];
assets.splice(assets.findIndex(a => a.code === "NUM.001"), 1);
for (const a of assets) {
    const swap = r => { if (r.asset === "NUM.001") { r.asset = "TXT.001"; r.variant = codeMap[r.variant] ?? "TXT.WHL.001.004"; } };
    a.requires.forEach(swap);
    for (const v of a.variants) (v.requires ?? []).forEach(swap);
}

// ---- the link: variants by style, and the uses
const link = asset("LNK.001");
const V = (code, name, description, edits, look, values) => ({ code, name, description, edits, values, look });
const base = { height: null, fontWeight: "400", corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0 };
link.variants = [
    V("LNK.UND.001.001", "Underlined text link", "A text that opens something, underlined, in the muted text colour, 18px (the links inside a master tile; a card's name that links to the card that generates it, bolder under the pointer and the focus).", "Underlined, muted colour.", { ...base, fontSize: 18, scale: "body 18", found: 12 }, { VAR012: "prefilled" }),
    V("LNK.BLU.001.002", "Blue text link", "A text that opens something, underlined, in blue, 18px (the page links of an introduction).", "Underlined, blue.", { ...base, fontSize: 18, scale: "body 18", found: 9 }, { VAR012: "prefilled" }),
    V("LNK.SYM.001.003", "Symbol link", "A symbol with no words that shows a choice is a link to another card (beside a dropdown choice).", "A symbol, no words.", undefined, { VAR012: "generated" })
];
delete link.variants[2].look;
link.lookNotes = [...(link.lookNotes ?? []).filter(n => !n.includes("TIL.004")), "variants and uses (" + DATE + "): a place where a link is used is not a variant. The variants differ in style and function (underlined text, blue text, a symbol). The uses: the tile link (inside a master tile, opens a view or a card), the card name link (a child's name links to its parent card), the page link (the list of pages of an introduction), the link symbol (beside a dropdown choice)."];
const master = asset("TIL.001");
master.requires = master.requires.map(r => (r.variant === "LNK.TIL.001.001" ? { ...r, variant: "LNK.UND.001.001" } : r));

// ---- the family text names the holders
const hold = families.find(f => f.code === "HOLD");
hold.groups.find(g => g.code === "HOLD.CEL").description = "The cells the person writes or chooses in: the holder (text and numbers), the list, the date cell, the dropdown.";

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables, families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied: " + assets.length + " assets");
