/**
 * The owner's decisions of 2026-10-16, fourth set, applied to the library once (a migration, kept as the record;
 * the changes are then logged with npm run library:log):
 *
 *   - A default IS the main asset: the text box is TXT.001, the brand image is IMG.001, the delete x is BTN.001, and
 *     so on. The default is no longer a variant; the variants are what changes it (the codes are renumbered).
 *   - The calendar popup is back: the date cell opens it like a dropdown's list, and the person chooses the day or
 *     the month in it.
 *   - No weight 600: the looks that had it take 700.
 *   - The add buttons are brought up to date: the widths measured (196 to 310px hugging, 668 and 1304px across a
 *     column), the notes panel's small text buttons (Add Date, Link a field), the add tile of the profile cards, and
 *     the two plus boxes (32 and 36px).
 *   - The bullets: the contrast against the rail's ground was measured and the rule is recorded.
 *
 *   node tools/scripts/library/apply-decisions-18.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-16";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const plain = { corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0 };

// ---- the add buttons, before the defaults are merged
const add = asset("BTN.004");
add.summary = "A text button that adds a row, a card or an entry (+ ADD CHANNEL, + ADD OFFERING, + ADD REGISTRATION NUMBER, + ADD JOURNEY STAGE): 44px high, the words in capitals (18px, weight 500, spaced 0.1em), centred in the button; a 1px solid line in the colour family of the place, 6px corners, a ground of that family. It hugs its words and stands at the left of its column (196 to 310px wide today). Under the pointer the ground takes its hover tone and a 4px glow (18%) appears; on the focus only the glow (28%), no outline; disabled it is faint, with the card's line and the not-allowed cursor. Its variants: the add button across a whole column, and the small text buttons of the notes panel.";
add.variants = [
    add.variants.find(v => v.code === "BTN.HUG.004.001"),
    { code: "BTN.ROW.004.002", name: "Full-row add", description: "The add button across a whole column (width 100%), the words centred: 668px in the list of the Legal Entity card, 1304px across a chapter (card-list-add and legal-entity-list-add).", edits: "Fills its column; the words are centred.", values: {}, look: { height: 44, fontSize: 18, fontWeight: "500", corners: "6px", paddingLeft: 14, paddingTop: 8, border: 1, scale: "body 18", found: 7 }, kind: "Button, wide with words: adds", belongs: "Identity: Legal Entity card (lists); a chapter's lists" },
    { code: "BTN.SML.004.003", name: "Small add", description: "The small text buttons of a note in the notes panel: Add Date and Link a field, side by side, 14px, padding 4px by 10px (notepad-add).", edits: "14px text, smaller padding.", values: {}, look: { height: 32, fontSize: 14, fontWeight: "500", corners: "6px", paddingLeft: 10, paddingTop: 4, border: 1, scale: "small 14", found: 2 }, kind: "Button, small with words: adds a date or links a field", belongs: "The notes panel: Add Date, Link a field" }
];
add.variants[0].description = "The add button that hugs its words and stands at the left of its column: + Add Channel (196.95px), + Add Offering and the like (up to 310px). Its ground follows the place: plain grey, or the tint of the Theme it sits in.";
add.variants[0].look = { ...add.variants[0].look, found: 12 };
note(add, "measured 2026-10-16: 39px high today (the 44px is the owner's decision); widths 196.95, 199.94, 287.53, 310.02 (hugging), 668 (the Legal Entity list) and 1304 (a chapter); the notes panel's Add Date and Link a field are 14px with padding 4/10; also found: the option + Add at the end of a dropdown list (an option, not a button) and the plus boxes of the rows.");
const tile = asset("BTN.005");
tile.variants = [{
    code: "BTN.PLS.005.001", name: "Plus tile", description: "The add tile of the profile cards (Identity and Brand): 180px wide, at least 120px high, a dashed 1px line, 10px corners, only a plus in the size of a column title (28px, weight 400); hover: the ground and the line take the colour family's hover tone and the plus its ink.", edits: "Only a plus, wider and with 10px corners.",
    values: {}, look: { height: 120, width: 180, fontSize: 28, fontWeight: "400", corners: "10px", paddingLeft: 0, paddingTop: 0, border: 1, scale: "h2 28", found: 1 }, kind: "Button, a tile: adds a card", belongs: "Identity and Brand pages that list profile cards"
}];
tile.summary = tile.summary.replace("weight 600", "weight 700");
note(tile, "second version found 2026-10-16: the add tile of the profile cards (profile-card-add-tile): 180px wide, 120px high at least, 1px dashed, 10px corners, a single plus of 28px.");
note(asset("BTN.001"), "plus boxes measured 2026-10-16: 32px in cards and rows (107 found) and 36px on the tiles (55, and one of 39px), 8px corners and a 2px line today; the owner's decision is one size, 32px with 6px corners.");

delete asset("BTN.006").defaultVariant;

// ---- the defaults are the main assets
const MERGE = { "TXT.001": "TXT.BOX.001.001", "IMG.001": "IMG.BRD.001.003", "BTN.001": "BTN.DLT.001.001", "BTN.003": "BTN.MAN.003.001", "BTN.004": "BTN.HUG.004.001", "DAT.001": "DAT.CAL.001.001", "ARW.001": "ARW.PAG.001.001", "ARW.002": "ARW.LAB.002.001", "DIV.001": "DIV.HOR.001.001", "TXS.001": "TXS.BDY.001.001" };
const SUMMARY = {
    "TXT.001": ["text box", "The default holder: a one-line cell for text, in the body size, 44px high, 6px corners, a border and an inset edge, fixed space. Its variants change what can be typed and how it grows: free text that grows down, the name cell, whole numbers, decimals and the square number. A text that is only read is not a holder (see the text)."],
    "IMG.001": [null, "The picture of a brand: by default the brand image, 448 by 252px in a card of 492px, with the x at its corner, its name and note under it. Its variants are the logo and the icon, which are other sizes."],
    "BTN.001": [null, "The box button: a square of 32px with a symbol in it, outlined with no fill at rest, which fills with its colour under the pointer. By default it is the x that removes a card or a field; its variants are the plus that adds and the shrink that shows the nested cards as tiles."],
    "BTN.003": [null, "The button that goes back: a word with an arrow or a triangle. By default it is the main Back of the footer of every page (an arrow, BACK in capitals, 18px, weight 500, 83 by 22px); its variant is the section Back of a dialog or a description."],
    "BTN.004": [null, null],
    "DAT.001": [null, null],
    "ARW.001": [null, "A triangle button that moves to the next or the previous one, 24px wide and 44px high; it grows 1.2 times on hover. By default it is the page arrow at the sides of a page; its variant is the carousel arrow of a dialog or a card."],
    "ARW.002": [null, "A small triangle that folds and unfolds a card, a list or a label. By default it is the frameless label arrow beside a label, 6px from it; its variant is the title arrow beside a chapter or column title."],
    "DIV.001": [null, "A thin line that divides two groups. By default it is the horizontal line (the page rule, 2px high, and the rule between two groups of rows in a card, 1px, with 12px of space either side); its variant is the vertical line between two columns."],
    "TXS.001": [null, null]
};
const codeMap = new Map();
for (const [code, defaultCode] of Object.entries(MERGE)) {
    const a = asset(code);
    const d = a.variants.find(v => v.code === defaultCode);
    if (!d) throw new Error("no default " + defaultCode);
    if (d.look) a.look = d.look;
    a.kind = d.kind ?? a.kind;
    a.belongs = d.belongs ?? a.belongs;
    const [name, summary] = SUMMARY[code];
    if (name) a.name = name;
    if (summary) a.summary = summary;
    a.variants = a.variants.filter(v => v !== d);
    codeMap.set(defaultCode, code);
    a.variants.forEach((v, i) => {
        const next = v.code.replace(/\d{3}$/, String(i + 1).padStart(3, "0"));
        if (next !== v.code) { codeMap.set(v.code, next); v.code = next; }
    });
    delete a.defaultVariant;
}
const date = asset("DAT.001");
date.summary = "A date cell: one long cell that holds the date, with the calendar symbol inside the cell at its right (a button 32px high, like the box buttons), not in a separate square. The cell works as a dropdown: the calendar symbol takes the place of the arrow and the calendar list opens under the cell, where the person chooses. By default it asks for a day, a month and a year; its variant asks only for a month and a year.";
asset("TXS.001").summary = asset("TXS.001").summary.replace("Every text that is only read", "By default the body text (18px, regular). Every text that is only read") + "";
asset("BTN.004").summary = add.summary;
for (const a of assets) {
    const swap = r => {
        if (!r.variant || !codeMap.has(r.variant)) return;
        const to = codeMap.get(r.variant);
        if (to === r.asset) delete r.variant; else r.variant = to;
    };
    a.requires.forEach(swap);
    for (const v of a.variants) (v.requires ?? []).forEach(swap);
}

// ---- the calendar popup is back, as the list of the date cell
const old = JSON.parse(execFileSync("git", ["show", "HEAD~2:src/library/data/library.ts"], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").join("\n").replace(/^[\s\S]*?export const library: Library = /, "").replace(/;\s*$/, ""));
const popup = old.assets.find(a => a.code === "DAT.002");
popup.name = "calendar list";
popup.summary = "The list a date cell opens, like the list of a dropdown: the person chooses the day (a calendar of days, with Clear and Today) or the month (a calendar of months with a Month and Year switch). It opens under the cell and has rounded corners, 6px like the cells. Today the day list is the browser's own calendar, so its text size and corners are the browser's and cannot be measured or styled; only the month list is the app's own.";
popup.kind = "List of a date cell: where the day or the month is chosen";
popup.belongs = "Under a date cell";
popup.variants = popup.variants.map(v => ({ ...v, name: v.name === "Day popup" ? "Days" : v.name === "Month popup" ? "Months" : v.name, kind: "List of a date cell: " + (v.code.includes("DAY") ? "a calendar of days" : "a calendar of months") }));
assets.splice(assets.findIndex(a => a.code === "DAT.001") + 1, 0, popup);
date.requires = [...date.requires, { asset: "DAT.002", role: "the list that opens under the cell, where the day or the month is chosen" }];

// ---- no weight 600
let weights = 0;
for (const a of assets) for (const l of [a.look, ...a.variants.map(v => v.look)]) if (l && l.fontWeight === "600") { l.fontWeight = "700"; weights++; }

// ---- the bullets: the contrast, measured against the rail's ground
const bullet = asset("BUL.001");
bullet.summary = bullet.summary + " Contrast (WCAG 1.4.11, 3:1): the plain dot, used for the Introduction and for every bullet of a card stack, has only 1.7:1 in light, 1.85:1 in dark and 1.7:1 in sepia against the rail, so it fails; the status dot has 5.2, 4.9 and 4.9:1, the hovered dot 7.3, 6.6 and 6.6:1 and the selected dot 5.2, 4.9 and 4.9:1. The rule: every bullet takes at least the status ink at rest.";
note(bullet, "contrast measured 2026-10-16 against the rail's own ground (Business page tag, light, dark and sepia): plain 1.70, 1.85, 1.67; status 5.17, 4.87, 4.94; hover 7.28, 6.55, 6.61; selected 5.17, 4.87, 4.94. The plain dot (--rail-dot, the ice blue) fails 3:1: the owner asks that no bullet has a contrast problem, so the rest ink of every bullet becomes the status ink; to be applied in the app.");

writeFileSync("tmp-codemap.json", JSON.stringify([...codeMap]));
writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied: " + assets.length + " assets, " + codeMap.size + " codes changed, " + weights + " weights 600 -> 700");
