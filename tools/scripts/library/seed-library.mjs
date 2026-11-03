/**
 * Seeds the assets library from the catalogue tables (src/library/tables): every asset once,
 * with its code, variables, variants and requirements (docs/design/library/08-library-system.md).
 *
 *   node tools/scripts/library/seed-library.mjs [--force]
 *
 * It writes src/library/data/library.ts and src/library/data/placements.ts ONCE. After that the
 * library is the source and is changed by the procedure of the specification (check, library,
 * library log, inventory, placement, app log), not by running this again: the script refuses to
 * overwrite an existing library unless --force is given.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { table } from "../../../src/library/tables/index.ts";

const force = process.argv.includes("--force");
const outDir = "src/library/data";
if (existsSync(outDir + "/library.ts") && !force) {
    console.error("src/library/data/library.ts exists: the library is the source now. Use --force only to start again.");
    process.exit(1);
}

// ------------------------------------------------------------------------------------------ variables
const V = (code, name, description, values) => ({ code, name, description, values: values.map(([n, d]) => ({ name: n, description: d })) });
const variables = [
    V("VAR001", "state", "How the asset looks and reacts at this moment.", [
        ["rest", "Nothing is touching it."], ["hover", "The pointer is over it."], ["focus", "It has the keyboard focus."],
        ["active", "It is being used (a press, or typing in it)."], ["selected", "It is the chosen one of its set (the lit bullet, the open tab)."], ["disabled", "It cannot be used now."]]),
    V("VAR002", "tint", "Whether the asset takes the colour tint of the card, tile or system it stands in.", [
        ["card tint", "It takes the tint of the card or tile it stands in."], ["neutral", "It keeps one colour whatever it stands in."]]),
    V("VAR003", "reading mode", "The colours of the reading mode the app is set to.", [
        ["light", "The light reading mode."], ["dark", "The dark reading mode."], ["sepia", "The sepia reading mode."]]),
    V("VAR004", "size class", "The size of the asset on the screen class (tablet 768 to 1199px wide, laptop 1200px wide and under 1250px high, desktop 1200px wide and 1250px high or more).", [
        ["tablet", "A window 768 to 1199px wide."], ["laptop", "A window 1200px wide or more and under 1250px high."], ["desktop", "A window 1200px wide or more and 1250px high or more."]]),
    V("VAR005", "requirement", "Whether the person must fill the asset in.", [
        ["required", "It must be filled in."], ["optional", "It may stay empty (an optional field is switched on by a tick)."], ["automatic", "The app fills it in."]]),
    V("VAR006", "content", "Whether the asset holds anything yet.", [
        ["empty", "Nothing is in it."], ["filled", "Something is in it."]]),
    V("VAR007", "place", "Where the asset stands.", [
        ["page", "On the page, in a chapter."], ["dialog view", "In a view that opens over the page."], ["floating card", "In a card that floats over the dimmed page."],
        ["nested card", "In a card inside another card."], ["header", "In the app header."]]),
    V("VAR008", "label position", "Where the label of a field stands against its control.", [
        ["above", "The label is above the control, 6px from it."], ["side", "The label is in a column at the side of the control."], ["none", "The control has no label."]]),
    V("VAR009", "head", "How a card names itself.", [
        ["name cell", "The card has a name cell the person fills in, with the order number inside it."], ["inherited name", "The name comes from elsewhere and is shown, not edited."]])
];

// --------------------------------------------------------------------------------------------- helpers
const used = new Map();
const FIXED = { "Text box": "BOX", "Text area": "ARE", "Name cell": "NAM", "Read-only text": "RDO", "With Other": "OTH", "Label above": "ABV", "Side label": "SID", "Heading": "HEA", "Page arrow": "PAG", "Carousel arrow": "CAR", "Label arrow": "LAB", "Calendar": "CAL", "Month": "MON", "Decimal": "DEC", "Whole number": "WHL", "Percent": "PCT", "Years": "YRS", "Pages rail": "PAG", "Sections rail": "SEC", "Named rail": "NAM", "Nested card rail": "NST" };
const letters = (name, taken) => {
    if (FIXED[name] && !taken.has(FIXED[name])) return FIXED[name];
    const words = name.toUpperCase().replace(/[^A-Z ]/g, " ").split(/\s+/).filter(Boolean);
    const pool = words.join("");
    const skeleton = (pool[0] ?? "X") + pool.slice(1).replace(/[AEIOU]/g, "");
    const candidates = [words.length === 1 && pool.length <= 3 ? pool : skeleton.slice(0, 3), pool.slice(0, 3), words.map(w => w[0]).join("").padEnd(3, pool).slice(0, 3)];
    for (const c of candidates) if (c.length === 3 && !taken.has(c)) return c;
    for (let a = 0; a < 26; a++) for (let b = 0; b < 26; b++) { const c = pool.slice(0, 1) + String.fromCharCode(65 + a) + String.fromCharCode(65 + b); if (!taken.has(c)) return c; }
    throw new Error("no letters for " + name);
};
const num = n => String(n).padStart(3, "0");
const assets = [];
const counters = {};
const nextCode = kind => { counters[kind] = (counters[kind] ?? 0) + 1; return kind + "." + num(counters[kind]); };
function asset(kind, category, name, summary, vars, catalogue, variants = [], requires = [], contracts) {
    const code = nextCode(kind);
    const [k, n] = code.split(".");
    const taken = new Set();
    const made = variants.map((v, i) => {
        const l = v.letters ?? letters(v.name, taken);
        taken.add(l);
        return { code: k + "." + l + "." + n + "." + num(i + 1), name: v.name, description: v.description, edits: v.edits, values: v.values ?? {}, ...(v.requires ? { requires: v.requires } : {}) };
    });
    const entry = { code, name, category, summary, variables: vars, variants: made, requires, catalogue, ...(contracts ? { contracts } : {}) };
    assets.push(entry);
    return entry;
}
const variantOf = (a, name) => a.variants.find(v => v.name === name)?.code;
const need = (a, variantName, role) => ({ asset: a.code, ...(variantName ? { variant: variantOf(a, variantName) } : {}), role });
const component = ["VAR001", "VAR002", "VAR003", "VAR004"];

// ------------------------------------------------------------------------------------------- components
const boxButton = asset("BTN", "component", "box button", "A square button with a symbol in it: the x that deletes and the plus that adds. Its look is outlined, with no fill at rest, and it fills with its colour on hover.", component, ["CO12", "CO08"], [
    { name: "Delete", description: "The x: removes the card or the field it stands in.", edits: "The symbol is an x and the colour is the red of the card tint." },
    { name: "Add", description: "The plus: adds a card, a row or an entry.", edits: "The symbol is a plus and the colour is the card tint." }
], [], ["Remove x", "Plus box"]);
const infoButton = asset("BTN", "component", "info button", "A round button with an i: it shows the note of the label or title beside it. It is not the box button: its function, shape and purpose differ. It shares only its hover reaction (fills with its colour).", component, ["CO04"], [], [], ["Info note"]);
const backButton = asset("BTN", "component", "back button", "The Back button of a dialog, a card stack or a rail: a small triangle and the word Back, placed at the end of the rail or at the bottom of the view.", component, ["CO13"], [], [], ["Back button"]);
const addButton = asset("BTN", "component", "wide add button", "A wide text button that adds a row to a list (+ ADD CHANNEL, + ADD REGISTRATION NUMBER). Measured size not recorded yet.", component, [], [], []);
const dropdown = asset("DRP", "component", "dropdown", "A cell that opens a list to choose one value from. 45px high, 6px corners, a border, an inset edge.", [...component, "VAR006"], ["CO02"], [
    { name: "Searchable", description: "A dropdown with a search box in its list (currency, long lists).", edits: "The list has a search box." },
    { name: "With Other", description: "A dropdown whose last choice is Other, which opens a text box.", edits: "The last choice is Other and it opens a text box under the cell." }
], [], ["Dropdown"]);
const tickBox = asset("TIK", "component", "tick box", "A square box with a tick, with its words beside it on one line. 18px.", component, ["CO11"], []);
const textInput = asset("TXT", "component", "text input", "A cell the person types text in: a cell with an inset edge and 6px corners.", [...component, "VAR006"], ["CO10", "CO09"], [
    { name: "Text box", description: "One line of text, 44px high.", edits: "A single line." },
    { name: "Text area", description: "Text that grows with its words and wraps.", edits: "Several lines; it grows to fit." },
    { name: "Name cell", description: "The name of a card in its head, with the order number inside the cell.", edits: "A text area with the order number inside the cell at its left." },
    { name: "Read-only text", description: "Text the person cannot edit (a number or a name the app fills in).", edits: "No cell edge; the text is plain." }
]);
const numberBox = asset("NUM", "component", "number box", "A cell for a number, right-aligned, 45px high.", [...component, "VAR006"], ["CO07"], [
    { name: "Whole number", description: "Whole numbers only.", edits: "No decimals." },
    { name: "Decimal", description: "A number with decimals.", edits: "Decimals allowed." },
    { name: "Percent", description: "A number from 0 to 100 with a percent sign.", edits: "Shows a percent sign after it." },
    { name: "Years", description: "A number of years.", edits: "Whole numbers with the unit years." }
]);
const dateCell = asset("DAT", "component", "date cell", "A cell that holds a date, with a calendar button that opens a calendar. 44px high.", [...component, "VAR006"], ["CO01"], [
    { name: "Calendar", description: "A day, month and year with a calendar button.", edits: "The calendar button opens a day calendar." },
    { name: "Month", description: "A month and year (January 2027) chosen from a month picker.", edits: "The list is a month picker with no days." }
]);
const label = asset("LBL", "component", "label", "The words that name a field or a group. Muted colour for a field, bold for a group heading.", ["VAR001", "VAR003", "VAR004", "VAR008"], ["CO05"], [
    { name: "Side label", description: "A label in a column at the left of its control.", edits: "It stands in the label column (177px) beside the control." },
    { name: "Label above", description: "A label above its control, 6px from it.", edits: "It stands above the control." },
    { name: "Heading", description: "A bold heading over a group of fields (Description, SWOT Analysis).", edits: "Bold, with the group's rule." }
]);
const arrow = asset("ARW", "component", "arrow", "A triangle button that moves to the next or the previous one. 24px wide and 44px high; it grows 1.2 times on hover.", component, ["CO14", "CO18"], [
    { name: "Page arrow", description: "Moves to the previous or the next page.", edits: "Sits at the sides of the page." },
    { name: "Carousel arrow", description: "Moves to the previous or the next card or view inside a dialog or card.", edits: "Sits at the sides of the dialog or the card." }
], [], ["Rails"]);
const foldArrow = asset("ARW", "component", "fold arrow", "A small triangle that folds and unfolds a card or a list.", component, ["CO03", "CO06"], [
    { name: "Label arrow", description: "A frameless arrow beside a label that opens a list under it.", edits: "No frame; sits 6px from the label." }
], [], ["Fold arrow", "Label arrow"]);
const bullet = asset("BUL", "component", "bullet", "The one dot of every rail: 12px, and 17.4px when it is the selected one. Its colour follows the tint of the card and its reaction (colour or opacity).", component, ["CO15", "CO19"], [], [], ["Rails"]);
const rail = asset("RAL", "component", "rail", "A column of bullets and names that moves between the pages, the sections or the cards. It holds the bullets, the arrow, and the Back button.", [...component, "VAR007"], ["CO15", "CO19"], [
    { name: "Pages rail", description: "The left rail of the page: one bullet per page, the page names inline from 1700px.", edits: "On the left of the page, with the page arrows." },
    { name: "Sections rail", description: "The rail beside a dialog or a floating card: a 37px tab below 1700px, the names shown as tooltips.", edits: "A 37px tab; the names appear on hover." },
    { name: "Named rail", description: "The rail beside a dialog or a card from 1700px: 217px wide with the names shown.", edits: "217px wide with the names inline." },
    { name: "Nested card rail", description: "The rail of a nested card (Goal, Objective, Metric): 88px square with two arrows and the bullets.", edits: "No tab; two arrows and the bullets." }
], [], ["Rails"]);
rail.requires = [need(bullet, undefined, "one bullet per item"), need(arrow, "Page arrow", "the page arrows"), need(backButton, undefined, "returns to the view before")];

// ---------------------------------------------------------------------------------------- tiles, frames
const masterTile = asset("TIL", "tile", "master tile", "The large tile of a chapter: a title, the list of what it holds, and often a plus. Opens a view or a card.", ["VAR001", "VAR002", "VAR003", "VAR004"], ["CO23"]);
masterTile.requires.push(need(boxButton, "Add", "adds to the list the tile holds"));
const openTile = asset("TIL", "tile", "open tile", "A tile inside a dialog view that opens a card or a view.", ["VAR001", "VAR002", "VAR003", "VAR004", "VAR006"], ["CO24"]);
const addTile = asset("TIL", "tile", "add card tile", "A dashed tile with a plus and the words ADD CARD at the end of a row of tiles.", ["VAR001", "VAR002", "VAR003"], []);
const tileLink = asset("TIL", "tile", "tile link", "A link inside a master tile that opens one of the things it lists.", ["VAR001", "VAR002", "VAR003"], ["CO17"]);
const chapter = asset("FRM", "frame", "chapter frame", "A frame on a page that holds master tiles, with a title and, often, a fold arrow and an i.", ["VAR003", "VAR004"], ["CO16"]);
chapter.requires.push(need(foldArrow, undefined, "folds the chapter"), need(infoButton, undefined, "the note of the chapter title"));
const page = asset("FRM", "frame", "page", "A page of a system: the header, the Pages rail, the page arrows and the chapters.", ["VAR003", "VAR004"], ["CO25"]);
page.requires.push(need(rail, "Pages rail", "moves between the pages"), need(arrow, "Page arrow", "moves to the next or previous page"));
const dialogView = asset("FRM", "frame", "dialog view", "A view of tiles that opens over the page, with its own rail, arrows and a Back button.", ["VAR003", "VAR004"], ["CO21"]);
dialogView.requires.push(need(rail, "Sections rail", "moves between the views"), need(backButton, undefined, "returns to the page"));
const caption = asset("FRM", "frame", "box name", "The name of the tile or box a card belongs to, centred above the floating card, 12px from it.", ["VAR003"], ["CO20"]);

// ------------------------------------------------------------------------------------------------ fields
const fnText = new Map(table("FN").rows.map(r => [r.id, String(r.function)]));
const requiresOf = (control, functions) => {
    const text = functions.join(" | ").toLowerCase();
    const list = [];
    const addNumber = () => list.push(need(numberBox, /\(%\)/.test(text) ? "Percent" : /years/.test(text) ? "Years" : /decimal/.test(text) ? "Decimal" : "Whole number", "number"));
    switch (control) {
        case "text box": list.push(need(textInput, "Text box", "text")); break;
        case "text area": list.push(need(textInput, "Text area", "text")); break;
        case "optional note": list.push(need(tickBox, undefined, "switches the note on"), need(textInput, "Text area", "the note")); break;
        case "number box": addNumber(); break;
        case "date cell": list.push(need(dateCell, /month/.test(text) ? "Month" : "Calendar", "date")); break;
        case "dropdown": list.push(need(dropdown, /searchable/.test(text) ? "Searchable" : /other/.test(text) ? "With Other" : undefined, "choice")); break;
        case "tick box": list.push(need(tickBox, undefined, "tick")); break;
        case "tick list (+ number)": list.push(need(tickBox, undefined, "one tick per entry"), need(numberBox, "Percent", "the share of each ticked entry")); break;
        case "extra (tick + number)": list.push(need(tickBox, undefined, "tick"), need(numberBox, undefined, "number")); break;
        case "tick + dropdown": list.push(need(tickBox, undefined, "tick"), need(dropdown, undefined, "choice")); break;
        case "read-only": list.push(need(textInput, "Read-only text", "shown, not edited")); break;
        default: return null;
    }
    return list;
};
const SKIP_CONTROLS = new Set(["x", "plus", "info", "button", "link symbol", "link"]);
const fieldCode = new Map();
const byName = new Map();
for (const f of table("F").rows) {
    if (SKIP_CONTROLS.has(String(f.component))) continue;
    // The probe's labels carry the info letter glued to the name ("Typei") and the number of the card ("Expense 4 name").
    const cleaned = String(f.name).trim().replace(/\b\d+\b/g, "").replace(/\s+,/g, ",").replace(/\s+/g, " ").replace(/\s+:/g, ":").trim().replace(/([a-z])i$/, "$1");
    const clean = cleaned.replace(/^Offerings of Subchannel.*$/, "Offerings").replace(/^Journey Stage for Subchannel.*$/, "Journey Stage").replace(/^Subchannel name.*$/, "Subchannel name");
    const key = clean.toLowerCase();
    if (/^(tick box|text box|text area|number box|dropdown|date cell)$/.test(key)) continue; // an unlabelled control is a part of a field, not a field
    const fns = String(f.functions).split(", ").filter(s => s && s !== "-").map(id => fnText.get(id) ?? "");
    const parts = requiresOf(String(f.component), fns);
    if (!parts) continue;
    if (!byName.has(key)) byName.set(key, { name: clean, ids: [], parts: [], controls: new Set() });
    const entry = byName.get(key);
    entry.ids.push(String(f.id));
    entry.controls.add(String(f.component));
    for (const p of parts) if (!entry.parts.some(q => q.asset === p.asset && q.variant === p.variant && q.role === p.role)) entry.parts.push(p);
}
for (const entry of byName.values()) {
    const a = asset("FLD", "field", entry.name, "The " + entry.name + " field: a label and " + [...entry.controls].join(", ") + ".", ["VAR005", "VAR006", "VAR008"], entry.ids, [], [need(label, undefined, "the label of the field"), ...entry.parts]);
    for (const id of entry.ids) fieldCode.set(id, a.code);
}

// -------------------------------------------------------------------------------------------------- cards
const base = asset("CRD", "card", "floating card", "The one surface every floating card stands on: 492px wide, 8px corners, 12px padding and 12px between everything, with the box name above it.", ["VAR002", "VAR003", "VAR004", "VAR007", "VAR009"], [], [
    { name: "Card", description: "A card of 492px.", edits: "492px wide." },
    { name: "Founder", description: "A founder's card of 297px.", edits: "297px wide." }
], [need(caption, undefined, "the box name above the card"), need(textInput, "Name cell", "the name of the card"), need(boxButton, "Delete", "removes the card")], ["Floating card"]);
const kinds = table("K").rows;
const types = [...new Set(kinds.map(k => String(k.card_type)))];
const placements = [];
const cardCodeOfKind = new Map();
for (const type of types) {
    const mine = kinds.filter(k => String(k.card_type) === type);
    const fieldLists = mine.map(k => String(k.fields_in_order).split(" ").map(id => fieldCode.get(id)).filter(Boolean));
    const common = fieldLists[0].filter(code => fieldLists.every(list => list.includes(code)));
    const taken = new Set();
    const variants = mine.length === 1 ? [] : mine.map((k, i) => {
        const list = fieldLists[i];
        const added = list.filter(c => !common.includes(c)), unique = [...new Set(added)];
        const name = String(k.group || k.name).replace(/ \(.*\)$/, "");
        const l = letters(name, taken);
        taken.add(l);
        return { letters: l, name, description: "The " + name + " kind of the " + type + " (" + String(k.category || "no category") + ").", edits: unique.length ? "Adds the fields " + unique.join(", ") + " to the common fields." : "Has the common fields only.", requires: unique.map(c => ({ asset: c, role: "field of this kind" })), kind: k.id };
    });
    const a = asset("CRD", "card", type.replace(/ card$/, ""), "The " + type + ": a floating card with " + common.length + " common fields in a fixed order" + (mine.length > 1 ? " and " + mine.length + " kinds that add their own." : "."), ["VAR002", "VAR003", "VAR004", "VAR005", "VAR007", "VAR009"], mine.map(k => String(k.id)), variants.map(({ kind, ...v }) => v), [need(base, "Card", "the surface it stands on"), ...common.map(c => ({ asset: c, role: "common field" }))]);
    mine.forEach((k, i) => cardCodeOfKind.set(String(k.id), { asset: a.code, variant: variants[i] ? a.variants[i].code : undefined }));
    placements.push(...mine.flatMap((k, i) => fieldLists[i].map((code, position) => ({ asset: code, ...(false ? {} : {}), system: String(k.card_type).startsWith("Legal") ? "Identity System" : "Business System", page: String(k.card_type).startsWith("Legal") ? "2. Organization" : "Infrastructure", card: a.code + (a.variants[i] ? "/" + a.variants[i].code : ""), position: position + 1 }))));
}

// ---------------------------------------------------------------- placements of frames and tiles
const systems = new Map(table("S").rows.map(r => [String(r.id), String(r.name)]));
const pages = new Map(table("P").rows.map(r => [String(r.id), { name: String(r.name), system: systems.get(String(r.system)) }]));
const chapters = new Map(table("C").rows.map(r => [String(r.id), { title: String(r.title), page: pages.get(String(r.page)) }]));
for (const [id, p] of pages) placements.push({ asset: page.code, system: p.system, page: p.name });
for (const [id, c] of chapters) placements.push({ asset: chapter.code, system: c.page.system, page: c.page.name, chapter: c.title });
for (const r of table("MT").rows) { const c = chapters.get(String(r.chapter)); placements.push({ asset: masterTile.code, system: c.page.system, page: c.page.name, chapter: c.title, tile: String(r.title) }); }

// ------------------------------------------------------------------------------------------------- write
mkdirSync(outDir, { recursive: true });
const header = [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    ""
].join("\n");
writeFileSync(outDir + "/library.ts", header + 'import type { Library } from "../model/types.ts";\n\nexport const library: Library = ' + JSON.stringify({ variables, assets }, null, 1) + ";\n");
writeFileSync(outDir + "/placements.ts", header + 'import type { Placement } from "../model/types.ts";\n\nexport const placements: readonly Placement[] = ' + JSON.stringify(placements, null, 1) + ";\n");
const byKind = {};
for (const a of assets) byKind[a.code.split(".")[0]] = (byKind[a.code.split(".")[0]] ?? 0) + 1;
console.log("assets " + assets.length + " " + JSON.stringify(byKind) + ", variants " + assets.reduce((n, a) => n + a.variants.length, 0) + ", variables " + variables.length + ", placements " + placements.length);
