/**
 * The owner's decisions of 2026-10-15, fourth set, applied to the library once (a migration, kept as the
 * record; the changes are then logged with npm run library:log):
 *
 *   - Dates: the Strategic Period, the Objective cards of a Theme and the Revenue card (Begins) take the date
 *     cell with a calendar, which lets the person choose a day or only a month (the variable date precision).
 *   - The calendar popup has rounded corners (a new asset, DAT.002).
 *   - The wide add buttons look like cells, so they are 44px high.
 *   - Activity cards: a divider line stands above Completed, and the Links ("Linked to") come last, after
 *     Completed (a new asset, DIV.001, the divider).
 *
 *   node tools/scripts/library/apply-decisions-4.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const variables = structuredClone(library.variables);
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = (a, code) => a.variants.find(v => v.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

// The new variable: date precision
variables.push({
    code: "VAR010", name: "date precision", description: "What the person chooses in a calendar: a day, or only a month.",
    values: [{ name: "day", description: "A day, month and year." }, { name: "month", description: "Only a month and a year (the day is not asked)." }]
});

// Dates: one calendar, with a day or month choice
const date = asset("DAT.001");
date.variables = [...date.variables, "VAR010"];
date.summary = "A cell that holds a date, with a calendar button that opens a calendar. The calendar lets the person choose a day, or only a month (the variable date precision). 44px high.";
const calendar = variant(date, "DAT.CAL.001.001");
calendar.name = "Day calendar";
calendar.description = "A day, month and year chosen in a calendar.";
calendar.values = { VAR010: "day" };
const month = variant(date, "DAT.MON.001.002");
month.name = "Month calendar";
month.description = "The same calendar, set to choose only a month and a year.";
month.edits = "The calendar asks for a month and a year; the day is not asked.";
month.values = { VAR010: "month" };
note(date, "dates in the Strategic Period, the Objective cards of a Theme and the Revenue card (Begins): by the owner's decision (" + DATE + ") they are this date cell with a calendar and the choice of a day or only a month; they are month pickers with their own look today (bold, wide-spaced type that cuts the year off: 'September 202').");

// The calendar popup
const popup = {
    code: "DAT.002", name: "calendar popup", category: "component",
    summary: "The window that opens under a date cell: the calendar of days, or the months and years. Rounded corners, the corners of a card (8px).",
    variables: ["VAR001", "VAR003", "VAR004", "VAR010"], catalogue: [],
    variants: [
        { code: "DAT.DAY.002.001", name: "Day popup", description: "The calendar of days with Clear and Today.", edits: "A grid of days.", values: { VAR010: "day" } },
        { code: "DAT.MON.002.002", name: "Month popup", description: "The months of a year, with a Month and Year switch.", edits: "A grid of months and a Month and Year switch.", values: { VAR010: "month" } }
    ],
    requires: [],
    look: { height: null, fontSize: 18, fontWeight: "400", corners: "8px", paddingLeft: 12, paddingTop: 12, border: 1, scale: "body 18", found: 0 },
    lookNotes: ["rounded corners: by the owner's decision (" + DATE + ") the popup window has rounded corners, the 8px of a card. The day popup is the browser's own picker today (square corners, and it cannot be styled), so the app needs its own day calendar to give it rounded corners; the month popup has rounded corners already."]
};
assets.splice(assets.findIndex(a => a.code === "DAT.001") + 1, 0, popup);
date.requires = [{ asset: "DAT.002", role: "the calendar that opens under the cell" }];

// The wide add button: a cell's height
const wide = asset("BTN.004");
wide.look = { ...wide.look, height: 44 };
note(wide, "height: by the owner's decision (" + DATE + ") it looks like a cell, so it is 44px high like every cell (it measured 39px). The size and place of its plus, and whether it follows the text size, are not decided yet.");

// The divider
const divider = {
    code: "DIV.001", name: "divider", category: "component",
    summary: "A thin line that divides two groups of rows inside a card, with 12px of space above and below it.",
    variables: ["VAR003"], catalogue: [], variants: [], requires: [],
    look: { height: 1, fontSize: 0, fontWeight: "400", corners: "0px", paddingLeft: 0, paddingTop: 0, border: 1, scale: "symbol, no text", found: 0 },
    lookNotes: ["from the card rules (two groups divided by a rule, 12px either side); not a separate element in the scan."]
};
assets.splice(assets.findIndex(a => a.code === "LST.001") + 1, 0, divider);

// Activity cards: a divider above Completed; the Links last
const reorder = code => {
    const card = asset(code);
    const done = card.requires.find(r => r.asset === "FLD.049");
    const links = card.requires.find(r => r.asset === "FLD.054");
    const rest = card.requires.filter(r => r !== done && r !== links);
    card.requires = [...rest, { asset: "DIV.001", role: "divides Completed from the fields above it" }, done, ...(links ? [links] : [])];
    note(card, "order, by the owner's decision (" + DATE + "): a divider line above Completed, and the Links (Linked to) last, after Completed.");
};
reorder("CRD.003");
reorder("CRD.007");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
