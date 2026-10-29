/**
 * The owner's decisions of 2026-10-16, third set, applied to the library once (a migration, kept as the record;
 * the changes are then logged with npm run library:log):
 *
 *   - A generic asset has a default variant that exists in the app with specific characteristics: the text box for
 *     the holder, the brand image for the image holder, and so on.
 *   - The date cell is one cell with the calendar symbol inside it, working as a dropdown; the separate calendar
 *     popup is part of it. Two forms: day, month and year (the default), and month and year.
 *   - The text styles are optimised: three weights (regular 400, medium 500, bold 700; semibold 600 is merged into
 *     bold), the financial-only styles are left out (the Financial sections will change), and a style is added for
 *     a completed responsibility (muted and struck through).
 *   - The link button records that its symbol is an emoji today.
 *
 *   node tools/scripts/library/apply-decisions-17.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-16";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const plain = { corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0 };

// ---- the default variants
const DEFAULTS = { "TXT.001": "TXT.BOX.001.001", "IMG.001": "IMG.BRD.001.003", "BTN.001": "BTN.DLT.001.001", "BTN.003": "BTN.MAN.003.001", "BTN.004": "BTN.HUG.004.001", "BTN.006": "BTN.RDM.006.001", "DAT.001": "DAT.CAL.001.001", "ARW.001": "ARW.PAG.001.001", "ARW.002": "ARW.LAB.002.001", "DIV.001": "DIV.HOR.001.001" };
for (const [code, variant] of Object.entries(DEFAULTS)) {
    const a = asset(code);
    if (!a.variants.some(v => v.code === variant)) throw new Error("no variant " + variant);
    a.defaultVariant = variant;
}
asset("TXT.001").summary = "The cell a person fills in with text or numbers, in the body size. The default is the text box (one line, fixed space); the other variants change what can be typed (free text that grows, the name cell, numbers only) and how the cell grows. A text that is only read is not a holder (see the text).";
note(asset("TXT.001"), "the default is the text box, which exists in the app with specific characteristics (the owner, " + DATE + "): 44px high, 6px corners, 1 line, fixed space.");
note(asset("IMG.001"), "the default is the brand image (448 by 252px), the one image holder measured in a card's own list of images (the owner, " + DATE + ").");

// ---- the date cell: one cell, the calendar inside it, working as a dropdown
const date = asset("DAT.001");
date.summary = "A date cell: one long cell that holds the date, with the calendar symbol inside the cell at its right (a button 32px high, like the box buttons), not in a separate square. The cell works as a dropdown: the calendar symbol takes the place of the arrow and the calendar opens under the cell. The default is day, month and year; the other form asks only for a month and a year. The popup is part of the cell.";
date.variants = [
    { ...date.variants.find(v => v.code === "DAT.CAL.001.001"), name: "Day, month and year", description: "The default: the calendar of days (with Clear and Today) chooses a day, a month and a year (Start date, End date, Balance date).", edits: "The calendar offers days." },
    { ...date.variants.find(v => v.code === "DAT.MON.001.002"), name: "Month and year", description: "Only a month and a year are asked, in a calendar of months with a Month and Year switch (the Strategic Period, the Financial Plan).", edits: "The calendar offers months; the day is not asked." }
];
date.requires = date.requires.filter(r => r.asset !== "DAT.002");
date.lookNotes = [...(date.lookNotes ?? []).filter(n => !n.startsWith("proposal")), "decided by the owner, " + DATE + ": the long cell and the square calendar symbol are unified (the symbol inside the cell, 32px high); one default for days, months and years, and one for months and years only; the cell works as a dropdown. The day popup today is the browser's own calendar and the symbol is the emoji 📅; both are to be replaced by the app's own."];
assets.splice(assets.findIndex(a => a.code === "DAT.002"), 1);
const hold = library.families.find(f => f.code === "HOLD");
const families = structuredClone(library.families);
families.find(f => f.code === "HOLD").groups.find(g => g.code === "HOLD.DAT").description = "The date cell, with its calendar inside it.";
void hold;

// ---- the link button: its symbol
note(asset("BTN.007"), "the symbol today is the emoji 🔗, which looks different on every platform; no proper icon exists in the app yet. To do: a 24px chain-link drawn in the text colour (an SVG), in place of the emoji; the calendar symbol 📅 of the date cell is an emoji in the same way.");

// ---- the text styles, optimised
const measured = JSON.parse(readFileSync("tools/catalogue/measures/measure-quillfield-1920.json", "utf8"));
const parts = JSON.parse(readFileSync("tools/catalogue/measures/parts-quillfield-1920.json", "utf8"));
const merge = w => (w === "600" ? "700" : w);
const keyOf = (size, weight, italic, underline, caps) => [size, merge(String(weight)), italic ? "i" : "", underline ? "u" : "", caps ? "c" : ""].join("|");
const notFinancial = t => !/financial/.test(t.cls);
const texts = measured.texts.filter(t => !t.holder && notFinancial(t));
const STYLES = [
    ["BDY", "Body", "18|400|||", "The reading text: the label of a field, an introduction sentence, an option, the hint inside an empty cell, a shown value, a unit word, the title of a generated card.", "Regular (400).", "Labels of every field, introduction text, options of a dropdown, the hint inside an empty cell, shown values, generated help text, unit words (the Global Settings page: %, USD, months)"],
    ["BMD", "Body medium", "18|500|||", "A touch heavier than the body: list numbers, the names in a page tag, the help toggle.", "Medium (500).", "List numbers, the names in a page tag, the help toggle"],
    ["BBD", "Body bold", "18|700|||", "Clearly heavy: table heads, a heading over a group of fields, the title of a generated tile or card, a strong word, an info note. (Semibold 600 is merged into it.)", "Bold (700).", "Table heads, headings of a group of fields, the title of a generated tile or card (a link to its input), strong words, info notes"],
    ["BUL", "Body underlined", "18|400||u|", "A text that opens a page or a view: underlined (the pages of an introduction, an engagement link).", "Regular, underlined.", "Page links of an introduction, engagement links"],
    ["BUC", "Body bold underlined capitals", "18|700||u|c", "A subtitle: bold, underlined, capitals (What it covers, Uses from earlier, the title of a page tag).", "Bold, underlined, capitals.", "Underlined subtitles of an introduction, the title of a rail"],
    ["BBC", "Body bold capitals", "18|700|||c", "The title of a master tile: bold capitals; a long title wraps. (Semibold 600 is merged into bold.)", "Bold, capitals.", "Master tile titles"],
    ["BMC", "Body medium capitals", "18|500|||c", "The words of a button or a rail: medium capitals, spaced 0.1em (Back, Start Interview, Add, the rail labels).", "Medium, capitals, tracking 0.1em.", "Back, Start Interview, the words of the add buttons, the rail labels"],
    ["BDN", "Body done", "", "A completed responsibility: the text is muted and struck through; a tag in the Completed fold's grey says so in words, because the strike-through alone reads as cancelled (the tag is not a text style).", "Regular, muted, struck through.", "A founder's completed responsibility (business-capability-responsibility-done)"],
    ["SML", "Small", "14|400|||", "The small text: a summary, a save status, a note, a bulleted list, the verification under a cell (danger colour).", "Regular, 14px.", "Summary lines, bulleted lists of a tile, the save status, notes, the verification message (danger colour, under the cell, after a missed fill)"],
    ["SCP", "Small capitals", "14|400||c", "The words of the header tools and their counts.", "Regular, capitals, 14px.", "Tool button words and counts"],
    ["SBI", "Small bold italic", "14|700|i||", "The i of the info button.", "Bold, italic, 14px.", "The i of the info button"],
    ["HTB", "Heading 3 bold", "24|700|||", "A section heading: a dialog title, a box name above a floating card.", "Bold, 24px.", "Dialog titles, box names above a floating card"],
    ["HTC", "Heading 3 bold capitals", "24|700|||c", "The name of the organisation in the header and the answer column labels. (Semibold 600 is merged into bold.)", "Bold, capitals, 24px.", "The organisation name in the header, answer column labels"],
    ["HTI", "Heading 3 medium italic", "24|500|i||", "The guiding question that opens an introduction.", "Medium, italic, 24px.", "The guiding question of an introduction"],
    ["HDC", "Heading 2 bold capitals", "28|700|||c", "A chapter or column title and the subhead of a card. (Semibold 600 is merged into bold.)", "Bold, capitals, 28px; a long title moves horizontally.", "Chapter titles, column titles, field group subheads"],
    ["HOB", "Heading 1 bold", "36|700|||", "The title of the system in the header.", "Bold, 36px.", "The system title (after the system icon)"],
    ["HOC", "Heading 1 capitals", "36|400|||c", "The page title in capitals.", "Regular, capitals, 36px.", "The page title"],
    ["HOR", "Heading 1", "36|400|||", "The page title in plain letters.", "Regular, 36px.", "The page title"]
];
const pressableOf = key => parts.pressable.filter(p => notFinancial(p) && keyOf(p.size, p.weight, p.italic, p.underline, p.transform === "uppercase") === key).length;
const variants = STYLES.map(([letters, name, spec, description, edits, was], i) => {
    const [size, weight, italic, underline, caps] = spec ? spec.split("|") : ["18", "400", "", "", ""];
    const key = spec ? keyOf(size, weight, italic, underline, caps) : "";
    const sample = spec ? texts.filter(t => keyOf(t.size, t.weight, t.italic, t.underline, t.transform === "uppercase") === key) : [];
    const classes = {};
    for (const t of sample) classes[t.cls || t.tag] = (classes[t.cls || t.tag] ?? 0) + 1;
    const top = Object.entries(classes).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, n]) => c + " " + n).join("; ");
    const systems = [...new Set(sample.map(t => t.where.split(" / ")[0].replace(" System", "")))].join(", ");
    const pressed = key ? pressableOf(key) : 0;
    return {
        code: "TXS." + letters + ".001." + String(i + 1).padStart(3, "0"), name, description, edits, values: { VAR012: "prefilled" },
        look: { height: null, fontSize: Number(size), fontWeight: weight, ...plain, scale: { 14: "small 14", 18: "body 18", 24: "h3 24", 28: "h2 28", 36: "h1 36" }[Number(size)], found: sample.length },
        kind: "Text you read" + (underline ? ", underlined" : "") + (italic ? ", italic" : "") + (caps ? ", capitals" : "") + (letters === "BDN" ? ", struck through" : ""),
        belongs: "Used as: " + was + ". Seen on: " + (systems || "not in the default pages") + (top ? "; classes " + top : "") + (pressed ? "; " + pressed + " of its texts can be pressed" : "") + "."
    };
});
const text = asset("TXS.001");
const oldLetters = new Map(text.variants.map(v => [v.code, v.code.split(".")[1]]));
const toLetters = { BSC: "BBC", BSM: "BBD", HDS: "HDC", HTS: "HTC", BRC: "BMC", SBD: "SML", HTB: "HTB", H1B: "HOB" };
const newCode = letters => variants.find(v => v.code.split(".")[1] === letters)?.code;
const codeMap = new Map([...oldLetters].map(([code, letters]) => [code, newCode(toLetters[letters] ?? letters)]));
text.variants = variants;
text.defaultVariant = "TXS.BDY.001.001";
text.summary = "Every text that is only read: a label, a title, a link, a help text, a message, a unit word. It is one component; its variants differ only in presentation: size (14, 18, 24, 28, 36), weight, capitals, italics, underline, struck through. The purpose of a text (label, title, help text, message) and its reaction (a link, a toggle) are given in the field or card that uses it. Weights: regular 400 is the ordinary reading weight; medium 500 is a touch heavier (numbers, buttons); bold 700 is clearly heavy (headings, emphasis). Semibold 600 was merged into bold, to keep three steps that can be told apart. Each variant records where its style was seen.";
note(text, "optimised (the owner, " + DATE + "): " + variants.length + " presentations; three weights (400, 500, 700; 600 merged into 700); the styles seen only in the Financial sections are left out because they will change (the data excludes the financial classes); a style was added for a completed responsibility; two rare styles (18px capitals, 14px bold) are merged into their neighbours.");
for (const a of assets) {
    const swap = r => { if (r.asset === "TXS.001" && r.variant) r.variant = codeMap.get(r.variant) ?? "TXS.BDY.001.001"; };
    a.requires.forEach(swap);
    for (const v of a.variants) (v.requires ?? []).forEach(swap);
}

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied: " + assets.length + " assets, " + variants.length + " text styles");
