/**
 * What the walk of the running app found on 2026-10-16 (scripts/catalogue/app-crawl.mjs: every page of the four
 * systems, every master tile opened, the first two cards of each view) and the library did not have. A migration kept as
 * the record; the changes are then logged with npm run library:log:
 *
 *   - the unit word px (Brand: Typography & Text Hierarchy, after the number cells);
 *   - a small bold text style (the buttons that open a linked resource in a channel's table: 14px, weight 600 -> 700);
 *   - the text toggle (Expand all / Collapse all) and the card symbol (a 12px dot on a card tile that opens the linked
 *     resource or activity);
 *   - the words and sizes of the add buttons as found.
 *
 *   node scripts/library/apply-decisions-20.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const plain = { corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0 };

// ---- the text component: the unit word px, the small bold style
const text = asset("TXS.001");
text.variants.push({
    code: "TXS.SBD.001.018", name: "Small bold", values: { VAR012: "generated" },
    description: "A small bold text that opens something: the names of the linked resources in a channel's table (Squarespace Core, Calendly Standard) and their numbers (#12). Weight 600 today, 700 in the library.",
    edits: "Bold, 14px; pressed.",
    look: { height: null, fontSize: 14, fontWeight: "700", ...plain, scale: "small 14", found: 290 },
    kind: "Text you read, pressed", belongs: "Used as: the linked resources of a channel (channel-resource-open, channel-resource-action). Seen on: Business, Customer Engagement; 290 found by the walk."
});
note(text, "walk of the running app 2026-10-16: the unit word px stands after the number cells of Brand: Typography & Text Hierarchy (brand-hierarchy-unit, 18px, weight 400, 15 found); the dropdown values of currencies and periods (USD, Per unit) are body text; the channel table's resource buttons are 14px, weight 600 (the library: 700) and are pressed.");

// ---- the text toggle
const toggle = {
    code: "BTN.008", name: "text toggle", category: "component", group: "CTRL.ACT",
    summary: "A small text button that folds or unfolds every card of a place at once: Expand all and Collapse all, 14px, weight 400, 95 by 20px, no frame. The words change with its state. (The help toggle, Hide Help, is a toggle too: 18px, weight 500.)",
    variables: ["VAR001", "VAR003", "VAR004"], catalogue: [], variants: [], requires: [],
    look: { height: 20, width: 95, ...plain, fontSize: 14, fontWeight: "400", scale: "small 14", found: 59 },
    kind: "Button, small text: toggles all the folds", belongs: "Business: the pages with folding cards (Expand all, Collapse all); the help toggle of the pages",
    lookNotes: ["found 59 times by the walk of the running app (fold-all-toggle, Expand all, 95.39 by 20px, 14px, weight 400); its reactions are not read yet."]
};
assets.splice(assets.findIndex(a => a.code === "BTN.007") + 1, 0, toggle);

// ---- the card symbol
const symbol = {
    code: "SYM.001", name: "card symbol", category: "component", group: "MARK.ICN",
    summary: "A round dot of 12px on a card tile that stands for a linked resource or activity (its aria name says which: Activity: Set up bookkeeping, Resource: Domain). It is pressed and opens the linked card. Its colour is the kind's.",
    variables: ["VAR001", "VAR003", "VAR004"], catalogue: [], variants: [], requires: [],
    look: { height: 12, width: 12, ...plain, corners: "50%", fontSize: 0, fontWeight: "400", scale: "symbol, no text", found: 63 },
    kind: "Symbol on a tile, pressed: opens the linked card", belongs: "The card tiles of Business: Infrastructure (activities and resources) and Customer Engagement",
    lookNotes: ["found 63 times by the walk of the running app 2026-10-16 (card-tile-symbol: 33 activity, 30 resource), 12 by 12px, round; its reactions are not read yet."]
};
assets.splice(assets.findIndex(a => a.code === "ICN.001") + 1, 0, symbol);

// ---- the add buttons and the other buttons as found
note(asset("BTN.004"), "walk of the running app 2026-10-16: the text add buttons found are + Add Channel (196.95px, 29 pages and cards), + Add Segment (199.94px, Business: Foundation), + Add Funding Source (287.53px, Financial Foundation), and + Add founder, + Add registration number, + Add tax registration (668px, across the column, Identity: Organization); all 39px high, 18px, weight 500, capitals. Words found only in the source, not reached by the walk: + Add Offering, + Add Relationship Type, + Add resource, + Add Colour, + Add Typeface, + Add expense(s).");
note(asset("BTN.001"), "walk of the running app 2026-10-16: the plus box on a tile is 36px (about 2,000 found; 39.6px in a few); the plus of a nested head (strategy-box-add) and of a card row (plus-box-small) 32px (the owner's decision: one size, 32px); the x of a nested head 32px (strategy-box-remove) and the x of a list 32px (numbered-list-remove).");
note(asset("BTN.003"), "walk of the running app 2026-10-16: the Back of the carousel (carousel-rail-back) is 75.69 by 25px, the Back of a tile view (section-tile-back) 66.56 by 33px, both 18px, weight 400; the main Back 83 by 22px.");
note(asset("BTN.002"), "walk of the running app 2026-10-16: the info button (info-note-button) is 22 by 22px today (816 found); the owner's decision is 24px.");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("walk findings recorded: " + assets.length + " assets");
