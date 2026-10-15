/**
 * The owner's corrections of 2026-10-15, twelfth set, applied to the library once (a migration, kept as the
 * record; the changes are then logged with npm run library:log):
 *
 *   - The main Back (the footer's "← BACK", measured 83 by 22px, 18px, weight 500, capitals) is a variant of the
 *     back button, with the Back of a dialog or a description (a triangle and the word, 18px, weight 400).
 *   - The percent, years and months boxes are one variant of the holder: the square number box (44 by 44px, the
 *     unit beside it).
 *   - The groups are re-cut: the date cell and its popup are the date cells; the buttons are action buttons, tool
 *     buttons and the Back with the arrows and bullets as navigation controls.
 *   - Every component has a kind (what sort of thing it is), and every variant that differs has its own; the frames,
 *     pages and cards each is placed in are recorded (the fields that use it are read from the catalogue).
 *   - Looks measured by the 2026-10-15 text probe (catalogue/measures): the messages, the vertical divider.
 *
 *   node scripts/library/apply-decisions-12.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const assets = structuredClone(library.assets);
const families = structuredClone(library.families);
const asset = code => assets.find(a => a.code === code);
const variant = code => assets.flatMap(a => a.variants).find(v => v.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const plain = { corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0 };

// ---- the back button: two variants
const back = asset("BTN.003");
back.summary = "The button that goes back: a word with an arrow or a triangle. The main Back is the one in the footer of every page; the section Back is the one of a dialog, a card stack or a description.";
back.variants = [
    { code: "BTN.MAN.003.001", name: "Main back", description: "The Back of the footer of every page: an arrow, the word BACK in capitals, 18px, weight 500, spaced 0.1em, 83 by 22px, at the left of the footer band. Goes to the page before.", edits: "An arrow and capitals; weight 500.", values: {}, look: { height: 22, width: 83, fontSize: 18, fontWeight: "500", ...plain, border: 0, scale: "body 18", found: 8 } },
    { code: "BTN.SEC.003.002", name: "Section back", description: "The Back of a dialog or a description: a small triangle and the word Back, 18px, weight 400, 25 by 76px. Goes back one view inside the dialog.", edits: "A triangle, the word in the body weight.", values: {}, look: { height: 25, width: 76, fontSize: 18, fontWeight: "400", ...plain, scale: "body 18", found: 6 } }
];
note(back, "two backs (the owner, " + DATE + "): the main Back of the footer, measured 83 by 22px, 18px, weight 500, capitals, tracking 0.1em; the Back of a dialog or a description, 25 by 76px, 18px, weight 400.");

// ---- the holder: one square number box instead of three
const holder = asset("TXT.001");
const pct = holder.variants.find(v => v.code === "TXT.PCT.001.006");
pct.code = "TXT.SQR.001.006";
pct.name = "Square number";
pct.description = "A number in a square box, 44 by 44px, with its unit beside it: % (Deposit %, Milestone %), years (Useful life, Amortisation period) or months (Target operating reserve). Numbers only; the digit limit is set by the field.";
pct.edits = "A square box; the unit (%, years, months) stands beside it.";
holder.variants = holder.variants.filter(v => !["TXT.YRS.001.007", "TXT.MON.001.008"].includes(v.code));
const swap = r => { if (r.asset === "TXT.001" && ["TXT.PCT.001.006", "TXT.YRS.001.007", "TXT.MON.001.008"].includes(r.variant)) r.variant = "TXT.SQR.001.006"; };
for (const a of assets) { a.requires.forEach(swap); for (const v of a.variants) (v.requires ?? []).forEach(swap); }
note(holder, "the percent, years and months boxes are one variant, the square number (the owner, " + DATE + "): 44 by 44px; the unit is beside it.");

// ---- the dropdown: what the two variants are
const drop = asset("DRP.001");
drop.summary = "A cell that opens a list to choose one value from. 44px high, 6px corners, a border, an inset edge. The plain dropdown is a short list of prefilled or generated choices (Status, Group, Category). Its two variants add one thing each: a search box for a long list, or a last choice Other.";
variant("DRP.SRC.001.001").description = "The same dropdown with a search box at the top of its list, for a long list: the person types and the list narrows (Currency).";
variant("DRP.OTH.001.002").description = "The same dropdown whose last choice is Other: choosing it opens a text box under the cell where the person writes a choice that is not in the list (Activity, Name, Rent).";

// ---- messages and the vertical divider, measured
variant("MSG.VER.001.001").look = { height: null, fontSize: 14, fontWeight: "400", ...plain, scale: "small 14", found: 0 };
note(asset("MSG.001"), "measured 2026-10-15: the verification is 14px, the danger colour, 4px under the cell (card-tile.css); it appears only after a missed fill, so none was found in the default pages. The reminder reads 18px (the Start and End of the Financial Plan, 18px, weight 400); the indicator (a unit word) was not found in the four systems.");
variant("MSG.REM.001.003").look = { height: 27, fontSize: 18, fontWeight: "400", ...plain, scale: "body 18", found: 2 };
variant("DIV.VER.001.002").look = { height: null, width: 1, fontSize: 0, fontWeight: "400", ...plain, scale: "symbol, no text", found: 0 };
variant("DIV.VER.001.002").edits = "Runs down, 1px wide. Found only in the handbook card, not in the four systems.";
note(asset("DIV.001"), "measured 2026-10-15: the page rule is 2px high and 1400px wide (.interview-divider); the vertical line (1px) exists only in the handbook card, not in the four systems.");

// ---- the groups
const hold = families.find(f => f.code === "HOLD");
hold.groups.find(g => g.code === "HOLD.CEL").description = "The cells the person writes or chooses in: the holder (text and numbers), the list and the dropdown.";
hold.groups.splice(1, 0, { code: "HOLD.DAT", name: "Date cells", description: "The cell that holds a date, with its calendar popup.", characteristics: ["A date, chosen in a calendar or written", "The calendar opens under the cell"] });
asset("DAT.001").group = "HOLD.DAT";
asset("DAT.002").group = "HOLD.DAT";
const ctrl = families.find(f => f.code === "CTRL");
ctrl.groups = [
    { code: "CTRL.ACT", name: "Action buttons", description: "The buttons that act on a card, a row or a list: the box button (delete, add, shrink), the info button, the wide add button and the Add Card tile.", characteristics: ["Pressed to do something to the content", "Fills with its colour under the pointer and the focus"] },
    { code: "CTRL.TOOL", name: "Tool buttons", description: "The buttons of the app header: an icon with a word.", characteristics: ["An icon and a word, in the header", "Tinted under the pointer and the focus"] },
    { code: "CTRL.NAV", name: "Navigation controls", description: "What moves a person between pages, sections, views and cards: the Back, the arrows and the bullets of the page tags.", characteristics: ["Shows where the person is and moves them on", "The arrow grows under the pointer; the bullet changes colour or opacity, and the selected bullet is larger"] },
    ctrl.groups.find(g => g.code === "CTRL.FLD")
];
for (const code of ["BTN.001", "BTN.002", "BTN.004", "BTN.005"]) asset(code).group = "CTRL.ACT";
asset("BTN.006").group = "CTRL.TOOL";
asset("BTN.003").group = "CTRL.NAV";

// ---- the kind of every component and variant
const K = {
    "BTN.001": "Button, a box with a symbol: acts on a card or a row", "BTN.DLT.001.001": "Button that removes", "BTN.ADD.001.002": "Button that adds", "BTN.SHR.001.003": "Button that changes a view (cards to tiles)",
    "BTN.002": "Button, round: shows a note", "BTN.003": "Button, a word: goes back", "BTN.004": "Button, wide with words: adds a row to a list", "BTN.005": "Button, a tile: adds a card", "BTN.006": "Button, an icon with a word: a tool of the app",
    "DRP.001": "Cell you choose in: one value from a list", "DRP.SRC.001.001": "Cell you choose in; the list has a search box", "DRP.OTH.001.002": "Cell you choose in; the last choice, Other, opens a text box",
    "TXT.001": "Cell you fill in: text or numbers", "TXT.BOX.001.001": "Text cell: one line, fixed space", "TXT.ARE.001.002": "Text cell: grows down as you type", "TXT.NAM.001.003": "Text cell: the name of a card, with its automatic number inside",
    "TXT.WHL.001.004": "Numbers-only cell: whole numbers, limited digits", "TXT.DEC.001.005": "Numbers-only cell: with decimals, limited digits", "TXT.SQR.001.006": "Numbers-only cell: square, with its unit beside it",
    "LST.001": "Text cell with numbered rows: grows down, the numbers inside", "DAT.001": "Date cell with a calendar button", "DAT.CAL.001.001": "Date cell: a day", "DAT.MON.001.002": "Date cell: a month",
    "DAT.002": "Popup of a date cell (not a cell you fill)", "TIK.001": "Tick box: yes or no, with words beside it", "PCK.001": "Colour chooser: a swatch and a hex cell", "IMG.001": "Image holder: a picture with a name and a note",
    "LBL.001": "Text you read: prefilled, names a field or a group", "TTL.001": "Text you read: prefilled or generated, names a page, chapter, tile or card",
    "TTL.TIL.001.006": "Title, generated by another input", "TTL.CRD.001.007": "Title, generated; a link to its input", "TTL.OPT.001.008": "Title, generated; one line",
    "LNK.001": "Text or symbol you read and press", "LNK.SYM.001.003": "Symbol you press; generated",
    "HLP.001": "Text you read: help, shown or hinted", "HLP.GEN.001.007": "Help text, generated by the app", "HLP.BGR.001.006": "Hint inside an empty cell; goes when you write", "HLP.BUL.001.002": "List you read: bullets", "HLP.NUM.001.003": "List you read: numbers", "HLP.LIN.001.008": "List you read: rows divided by lines",
    "MSG.001": "Text you read: a message about what was entered", "MSG.VER.001.001": "Message, generated: a total or a choice is not complete", "MSG.IND.001.002": "Message, a unit word beside a number", "MSG.REM.001.003": "Message, information always true on the page",
    "ARW.001": "Navigation control: a triangle that moves to the next or the previous", "ARW.002": "Fold control: a triangle that folds and unfolds", "BUL.001": "Navigation control: a dot that shows and moves to a page",
    "ICN.001": "Picture, not a button", "DIV.001": "Line that divides", "CAL.001": "Side panel: the calendar of the organisation",
    "FRM.001": "Surface that carries information and tools", "FRM.002": "Layout: a page of a system", "FRM.003": "Layout: a view that opens over the page"
};
const B = {
    "BTN.DLT.001.001": "Floating card, nested card, image holder (the x at the corner)", "BTN.ADD.001.002": "Master tile heads, nested card heads, rows of lists", "BTN.SHR.001.003": "Nested card heads (Goals, Objectives, Metrics)",
    "BTN.002": "Beside the labels and titles of cards, tiles and dialogs", "BTN.MAN.003.001": "The footer of every page", "BTN.SEC.003.002": "Dialogs and descriptions",
    "BTN.004": "Lists in cards (+ ADD CHANNEL, + ADD REGISTRATION NUMBER)", "BTN.005": "The end of the grid in an opened tile view", "BTN.006": "The app header",
    "LST.001": "Cards: Values, Principles, SWOT points, Initiatives", "PCK.001": "Brand: Colours card", "IMG.001": "Brand: Images card",
    "LBL.001": "In front of the fields of cards, tiles and chapters", "TTL.PAG.001.001": "The page header", "TTL.CHP.001.002": "The chapter frame", "TTL.DLG.001.003": "The dialog view and the section heading",
    "TTL.BOX.001.004": "Above a floating card", "TTL.MTL.001.005": "Master tile", "TTL.TIL.001.006": "Tiles of generated cards (Resource tiles)", "TTL.CRD.001.007": "Cards, in place of the name cell", "TTL.OPT.001.008": "Dropdown lists in cards",
    "TTL.SYS.001.009": "The page header, after the system icon", "TTL.INT.001.010": "Introduction pages",
    "LNK.UND.001.001": "Master tiles; cards (the link to the parent)", "LNK.BLU.001.002": "Introduction pages (the list of pages)", "LNK.SYM.001.003": "Beside a dropdown choice in a card",
    "HLP.INF.001.001": "The note of an info button", "HLP.BUL.001.002": "Tiles", "HLP.NUM.001.003": "Cards that recall a profile", "HLP.SUM.001.004": "Cards and tiles", "HLP.VAL.001.005": "Cards (the group, a total)",
    "HLP.BGR.001.006": "Inside the holder cells of cards", "HLP.GEN.001.007": "Business, Infrastructure (capacity)", "HLP.LIN.001.008": "Cards", "HLP.INT.001.009": "Introduction pages",
    "MSG.VER.001.001": "Under the cell, in a card, after a missed fill", "MSG.IND.001.002": "After a number cell", "MSG.REM.001.003": "Strategy: Strategic Period (Financial Plan)",
    "ARW.PAG.001.001": "The sides of a page", "ARW.CAR.001.002": "The sides of a dialog or a card", "ARW.LAB.002.001": "Beside a label", "ARW.TTL.002.002": "Beside a chapter or column title",
    "BUL.001": "The page tags of chapters, cards, nested cards and floating cards", "ICN.001": "The header, before the system's title", "DIV.HOR.001.001": "The page, and between two groups of rows in a card", "DIV.VER.001.002": "The handbook card only",
    "CAL.HND.001.001": "The left edge of the window", "CAL.PNL.001.002": "The side panel",
    "FRM.CHP.001.001": "A page", "FRM.MTL.001.002": "A chapter", "FRM.NTL.001.003": "A dialog view", "FRM.FLC.001.004": "Over the dimmed page", "FRM.NSC.001.005": "Inside a card (Strategy)", "FRM.TAG.001.006": "The side of a page or a card", "FRM.TIL.001.007": "A chapter or a dialog view", "FRM.CRD.001.008": "A page or a dialog view",
    "FRM.002": "Every system", "FRM.003": "Every master tile", "TIK.001": "Cards", "DAT.002": "Under a date cell", "DAT.001": "Cards: dates", "ARW.001": "Pages, dialogs, cards", "ARW.002": "Cards, lists, labels", "TXT.001": "Cards, chapters, the Workspace", "DRP.001": "Cards", "CAL.001": "The window"
};
for (const a of assets.filter(x => x.group)) {
    if (!K[a.code]) throw new Error("no kind for " + a.code);
    a.kind = K[a.code];
    if (B[a.code]) a.belongs = B[a.code];
    for (const v of a.variants) { if (K[v.code]) v.kind = K[v.code]; if (B[v.code]) v.belongs = B[v.code]; }
}

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied: " + assets.length + " assets");
