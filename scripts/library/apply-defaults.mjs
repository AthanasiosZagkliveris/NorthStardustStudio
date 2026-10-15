/**
 * The owner's criteria of 2026-10-15, applied to the library once (a migration, kept as the record
 * of how the defaults were chosen; the changes are then logged with npm run library:log):
 *
 *   - Text holders are separated by purpose: free text (a note), a list line (one entry of a numbered
 *     list), the name cell (a card's name, with its number inside), the text box (one line), read-only
 *     text. Each has its own default look. A new asset LST.001 holds the lists.
 *   - Where one look is used far more than the others (the others fewer than 5 uses or 5 percent, within
 *     2px) the most used look is the default and the others are merged into it. A look that is more
 *     than 5 percent of the uses, or that differs by more than 2px, is kept and left to the owner.
 *   - The x takes the look with the most uses; the plus takes the plus that matches that x (the same size).
 *   - Every default is checked against the text hierarchy of the app: 14 small, 18 body, 24 h3, 28 h2, 36 h1.
 *
 *   node scripts/library/apply-defaults.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";
import { looks } from "../../src/library/inventory/looks.generated.ts";

const SCALE = { 14: "small 14", 18: "body 18", 24: "h3 24", 28: "h2 28", 36: "h1 36" };
const scaleOf = font => (font === 0 ? "symbol, no text" : SCALE[font] ?? "off the scale: " + font);
const num = v => parseFloat(v) || 0;
const lookOf = l => ({ height: l.height, fontSize: l.font, fontWeight: String(l.weight), corners: l.radius, paddingLeft: l.padL, paddingTop: l.padT, border: l.border, scale: scaleOf(l.font), found: l.count });
const describe = l => (l.height !== null ? "height " + l.height + ", " : "") + "type " + l.font + ", corners " + l.radius + ", padding " + l.padL + "/" + l.padT + ", border " + l.border;
const byType = t => looks.filter(l => l.type === t).sort((a, b) => b.count - a.count);

/** The most used look and the notes on the others. */
function decide(list, label) {
    const [d, ...others] = list;
    const notes = [];
    for (const o of others) {
        const diffs = [Math.abs((o.height ?? 0) - (d.height ?? 0)), Math.abs(o.font - d.font), Math.abs(num(o.radius) - num(d.radius)), Math.abs(o.padL - d.padL), Math.abs(o.padT - d.padT), Math.abs(o.border - d.border)];
        const share = o.count / d.count;
        const within = Math.max(...diffs) <= 2;
        const merge = (o.count < 5 || share <= 0.05) && within;
        notes.push((merge ? "merged into the default: " : "kept, the owner decides: ") + label + " " + describe(o) + "; found " + o.count + " times (" + (share * 100).toFixed(1) + "% of the default's " + d.count + "); largest difference " + Math.max(...diffs).toFixed(1) + "px");
    }
    return { look: lookOf(d), notes };
}

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = (a, code) => a.variants.find(v => v.code === code);

// ---- the text holders, separated by purpose (the text areas by the class they carry)
const areas = byType("text area");
const has = (l, word) => l.classes.some(c => c.includes(word));
const freeText = areas.filter(l => has(l, "business-foundation-note") || has(l, "legal-entity-note") || has(l, "brand-image-note") || (!has(l, "numbered-list-input") && !has(l, "card-name-input") && !has(l, "suggested-input")));
const listLines = areas.filter(l => has(l, "numbered-list-input"));
const nameCells = areas.filter(l => has(l, "card-name-input") || has(l, "suggested-input"));

const txt = asset("TXT.001");
const area = variant(txt, "TXT.ARE.001.002");
area.name = "Free text";
area.description = "A note: several lines of free words that grow with what is written (Description, Offerings, Strengths).";
area.edits = "Several lines; it grows to fit; Enter adds a line inside it.";
txt.variants.push({
    code: "TXT.LST.001.005", name: "List line", description: "One entry of a numbered list: a sentence that wraps, with its number outside the cell. Enter opens the next line.",
    edits: "One sentence per line; Enter opens the next line; the lines are numbered and can be moved.", values: {}
});
// The variants keep their codes (a code is an id); the new variant takes the next number.
txt.summary = "A cell the person types text in: one line (text box), free text (a note), one line of a numbered list (list line), or the name of a card (name cell). Each has its own look; a read-only text is shown, not edited.";

const lst = {
    code: "LST.001", name: "numbered list", category: "component",
    summary: "A list of entries the person writes, one sentence each, numbered, in order, that can be moved and removed (Values, Principles, SWOT points, Initiatives, Responsibilities). Enter opens the next line.",
    variables: ["VAR001", "VAR002", "VAR003", "VAR004", "VAR006"], catalogue: [],
    variants: [
        { code: "LST.EDT.001.001", name: "Editable list", description: "The list the person writes.", edits: "Lines are list lines in cells.", values: {} },
        { code: "LST.NUM.001.002", name: "Read-only numbered list", description: "A numbered list that is shown (a founder's roles recalled from the profile).", edits: "No cells; the number and the text.", values: {} },
        { code: "LST.BUL.001.003", name: "Read-only bullet list", description: "A bulleted list that is shown (the list of what a tile includes).", edits: "Bullets instead of numbers; 14px.", values: {} }
    ],
    requires: [{ asset: "TXT.001", variant: "TXT.LST.001.005", role: "one list line per entry" }]
};
assets.splice(assets.findIndex(a => a.code === "TXT.001") + 1, 0, lst);

// ---- defaults
const notesFor = (a, lines) => { a.lookNotes = [...(a.lookNotes ?? []), ...lines]; };
const apply = (target, type, label) => { const r = decide(byType(type), label); target.look = r.look; return r; };
const textBox = apply(variant(txt, "TXT.BOX.001.001"), "text box", "text box");
const free = decide(freeText, "free text"); variant(txt, "TXT.ARE.001.002").look = free.look;
const list = decide(listLines, "list line"); variant(txt, "TXT.LST.001.005").look = list.look;
const name = decide(nameCells, "name cell"); variant(txt, "TXT.NAM.001.003").look = name.look;
txt.look = textBox.look;
notesFor(txt, [...textBox.notes, ...free.notes.map(n => "free text: " + n), ...list.notes.map(n => "list line: " + n), ...name.notes.map(n => "name cell: " + n)]);

// The x: the look with the most uses; the plus: the plus that matches that x (the same size).
const xs = byType("x"), plus = byType("plus");
const x = decide(xs, "x");
const matching = plus.filter(l => l.height === xs[0].height).sort((a, b) => b.count - a.count)[0];
const box = asset("BTN.001");
variant(box, "BTN.DLT.001.001").look = x.look;
variant(box, "BTN.ADD.001.002").look = lookOf(matching);
box.look = x.look;
notesFor(box, [...x.notes, "plus: chosen to match the x (the same " + xs[0].height + "px size): " + describe(matching) + "; found " + matching.count + " times; the plus is the one that matches the x in size, its corners are " + matching.radius + " against the x's " + xs[0].radius,
    ...plus.filter(l => l !== matching).map(l => "plus, kept or merged: " + describe(l) + "; found " + l.count + " times (" + (l.count / matching.count * 100).toFixed(1) + "% of the chosen plus)")]);

const setLook = (code, type, label) => { const a = asset(code); const r = apply(a, type, label); notesFor(a, r.notes); };
setLook("BTN.002", "info", "info");
setLook("DRP.001", "dropdown", "dropdown");
setLook("TIK.001", "tick box", "tick box");
setLook("NUM.001", "number box", "number box");
setLook("DAT.001", "date cell", "date cell");
setLook("LBL.001", "label", "label");
setLook("ARW.002", "fold arrow", "fold arrow");
variant(asset("ARW.002"), "ARW.LAB.002.001").look = lookOf(byType("label arrow")[0]);
notesFor(asset("ARW.002"), decide(byType("label arrow"), "label arrow").notes);

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("defaults applied: " + assets.filter(a => a.look).length + " assets and " + assets.reduce((n, a) => n + a.variants.filter(v => v.look).length, 0) + " variants have a look");
