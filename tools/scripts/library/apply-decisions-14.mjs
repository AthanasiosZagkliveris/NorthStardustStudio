/**
 * The owner's corrections of 2026-10-16, applied to the library once (a migration, kept as the record; the changes
 * are then logged with npm run library:log):
 *
 *   - The master tile and the nested tile have 12px of padding (measured 13px; the app will follow).
 *   - The page tag hugs its content: it has no standard size, so it is adjustable.
 *   - The colour picker and the tick box are components; with their label or text holder they make a field.
 *   - "With Other" is not a variant: an option can have a reaction (Other opens a text box). The variant is the
 *     generated list: a dropdown whose list comes from what the user entered (Registrations, Expenses, Activities).
 *   - The indicator is named Unit word (the word beside a number that says what it is in).
 *   - The link symbol is 24px.
 *   - The image holder has three variants of different sizes: the logo, the icon and the brand image.
 *   - The date cell and its calendar: the owner's proposal is recorded (not applied).
 *
 *   node tools/scripts/library/apply-decisions-14.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-16";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = code => assets.flatMap(a => a.variants).find(v => v.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };
const plain = { corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0, fontSize: 0, fontWeight: "400", scale: "symbol, no text" };

// ---- the tiles: 12px of padding
for (const code of ["FRM.MTL.001.002", "FRM.NTL.001.003"]) {
    const v = variant(code);
    v.look = { ...v.look, paddingLeft: 12, paddingTop: 12 };
}
note(asset("FRM.001"), "the master tile and the nested tile have 12px of padding, by the owner's decision (" + DATE + "); measured 13px on every side.");

// ---- the page tag hugs its content
const tag = variant("FRM.TAG.001.006");
tag.description = "The surface of the page tag (the tab behind the bullets of a page tag). It hugs its content, so it has no standard size and is adjustable: 37px wide with the bullets only (the pages of a system, measured on the Business pages), and as wide as its longest page name when the names are shown (the name box of 3. Infrastructure & Capability is 360px).";
tag.edits = "Hugs its content: width and height follow the bullets and the names.";
tag.belongs = "The side of a page or a card; a single card (a Resource card) has no tag of its own";
note(asset("FRM.001"), "the tag hugs its content (the owner, " + DATE + "): measured 37px wide with bullets only (Business pages, 230px high for 5 pages), 360px for the longest name box; a card stack's tag is 12px wide and 16px per card.");

// ---- the colour picker and the tick box are components, not fields
const tick = asset("TIK.001");
tick.summary = "A square box with a tick, 24px. Only the box is the component; the words beside it are a label, and the box with its label is a field.";
tick.kind = "Tick box: yes or no";
note(tick, "the box with its words is a field, not a component (the owner, " + DATE + "): the words are a label.");
const picker = asset("PCK.001");
picker.summary = "A square swatch that opens the colour picker of the browser, 44 by 44px, dashed while empty. The hex cell beside it is a holder (a text box that takes #000000); the swatch, the hex cell and their label make the Colour field.";
picker.kind = "Colour chooser: a swatch";
note(picker, "the swatch with its hex holder and label is a field, not a component (the owner, " + DATE + ").");

// ---- the dropdown: Other is a reaction, the generated list is a variant
const drop = asset("DRP.001");
if (!drop.variables.includes("VAR012")) drop.variables = [...drop.variables, "VAR012"];
drop.variants = drop.variants.filter(v => v.code !== "DRP.OTH.001.002");
drop.variants.push({
    code: "DRP.GEN.001.002", name: "Generated list",
    description: "A dropdown whose list is made from what the user entered elsewhere, not prefilled: the Registrations and Expenses of the page, and the Activities, Resources, Performers and Responsibilities of a place (Activity, Resource, Performer, Linked registration, Rent).",
    edits: "The options come from the user's own entries.", values: { VAR012: "generated" }, kind: "Cell you choose in; the list is generated from the user's entries",
    belongs: "Cards that link to what the user entered"
});
drop.summary = "A cell that opens a list to choose one value from. 44px high, 6px corners, a border, an inset edge. The plain dropdown has a prefilled list (Status, Group, Category, Frequency). Its variants change the list: a search box for a long list (Currency), or a list generated from what the user entered. Any option may have a reaction: choosing Other opens a text box under the cell. That reaction belongs to the option, not to a variant.";
note(drop, "Other is a reaction of an option, not a variant (the owner, " + DATE + "); the generated list (Registrations, Expenses) is the variant.");
for (const a of assets) {
    const own = a.code;
    const re = r => { if (r.variant === "DRP.OTH.001.002") r.variant = own === "FLD.002" ? undefined : "DRP.GEN.001.002"; if (r.variant === undefined) delete r.variant; };
    a.requires.forEach(re);
    for (const v of a.variants) (v.requires ?? []).forEach(re);
}

// ---- the unit word
const unit = variant("MSG.IND.001.002");
unit.name = "Unit word";
unit.description = "The word that says what a number is in, written after the number cell: %, years, months, month, a currency (Deposit %, Useful life, Target operating reserve, Fixed costs $5,231 / month). Read, not filled in.";
unit.edits = "A word after a number; plain text.";
unit.kind = "Message, a unit word beside a number";

// ---- the link symbol: 24px
const symbol = variant("LNK.SYM.001.003");
symbol.look = { height: 24, width: 24, ...plain, found: 72 };
symbol.edits = "A symbol, no words; 24px.";
note(asset("LNK.001"), "the link symbol is 24px (the owner, " + DATE + "); its place was cut off in the message and is not recorded yet.");

// ---- the image holder: three sizes
const image = asset("IMG.001");
const V = (code, name, description, edits, look, belongs) => ({ code, name, description, edits, values: {}, look: { ...plain, corners: "0px", ...look }, kind: "Image holder: a picture", belongs });
image.variants = [
    V("IMG.LOG.001.001", "Logo", "The logo of the brand: a wide picture in a slot as wide as the card (668px by 216px); the picture is 650px wide and keeps its own proportions (about 122px high).", "A wide slot; the x at its corner.", { height: 216, width: 668, found: 1 }, "Brand: Icon & Logo card"),
    V("IMG.ICO.001.002", "Icon", "The icon of the brand: a square picture, about 249px by 249px, in a slot 300px high with the description cell beside it.", "A square picture; the description beside it.", { height: 249, width: 249, found: 1 }, "Brand: Icon & Logo card"),
    V("IMG.BRD.001.003", "Brand image", "A picture of the brand (a product, a pattern): 448px by 252px in a card of 492px, with its name and note under it.", "A 16 by 9 picture; the name and the note stand under it.", { height: 252, width: 448, found: 3 }, "Brand: Images card")
];
note(image, "three sizes measured 2026-10-16 (Lumen & Loom, 1920px): the logo slot 668 by 216px (picture 650 by 122px), the icon 249 by 249px in a slot 668 by 300px, the brand image 448 by 252px (Quillfield). They differ because the cards differ; the sizes are not yet one rule.");

asset("BTN.006").look.found = 62;
note(asset("BTN.006"), "found 62 header tool words on 11 pages, measured 2026-10-16.");

// ---- the date cell: the owner's proposal, recorded
const date = asset("DAT.001");
note(date, "proposal (the owner, " + DATE + "), not applied: the calendar sits inside the cell, not in a separate square; its button is 32px high, like the box buttons; the cell works exactly as a dropdown, with the picture of a calendar in place of the arrow, and the list has two choices, days or months of a year.");
note(asset("DAT.002"), "measured 2026-10-16: the day popup is the browser's own calendar (a date input), so its text size and corners are the browser's and cannot be measured or styled; only the month popup of the Strategy pages is the app's own.");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied: " + assets.length + " assets");
