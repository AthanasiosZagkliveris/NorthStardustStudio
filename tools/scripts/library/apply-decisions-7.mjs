/**
 * The owner's decisions and corrections of 2026-10-15, seventh set, applied to the library once (a migration,
 * kept as the record; the changes are then logged with npm run library:log):
 *
 *   - The calendar popup has 6px corners (the corners of the other cells), not 8px.
 *   - A months box exists (Target operating reserve, in months): a square, 44 by 44px, like the percent and
 *     years boxes.
 *   - The rail is not a component. The bullet stays a component; the bullets with their names, arrow and Back
 *     button are the page tag, a field (FLD) with four variants.
 *   - A label does not vary by its position: the position belongs to the field. The label keeps one variant,
 *     the heading, which differs in style, not in position.
 *   - The tiles that floating cards generate (the Resources tiles) show their title on one line; a title that is
 *     too long moves horizontally.
 *   - The counts are of the app's UI: each look also carries the number of places it stands in (distinct pages
 *     and classes), not only the number of instances in the example organisation.
 *
 *   node tools/scripts/library/apply-decisions-7.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";
import { looks } from "../../../src/library/inventory/looks.generated.ts";

const DATE = "owner, 2026-10-15";
const variables = structuredClone(library.variables);
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

// ---- the calendar popup: 6px
const popup = asset("DAT.002");
popup.summary = "The window that opens under a date cell: the calendar of days, or the months and years. Rounded corners, 6px like the cells.";
popup.look = { ...popup.look, corners: "6px" };
popup.lookNotes = ["rounded corners: by the owner's decision (" + DATE + ") the popup window has rounded corners of 6px, like the cells. The day popup is the browser's own picker today (square corners, and it cannot be styled), so the app needs its own day calendar to give it rounded corners; the month popup has rounded corners already."];

// ---- the months box
const number = asset("NUM.001");
number.variants.push({
    code: "NUM.MON.001.005", name: "Months", description: "A number of months (Target operating reserve: 3 months).",
    edits: "A square box, 44 by 44px, with the word months beside it.", values: {},
    look: { height: 44, width: 44, fontSize: 18, fontWeight: "400", corners: "6px", paddingLeft: 4, paddingTop: 8, border: 1, scale: "body 18", found: 1, places: 1 }
});
note(number, "months box: by the owner's decision (" + DATE + ") months boxes are squares, 44 by 44px, like the percent and years boxes (Target operating reserve in Business, Financial Foundation: the catalogue has no scan of that field, so 1 is the one named by the owner).");

// ---- the rail is a field, the page tag
const nextField = "FLD." + String(Math.max(...assets.filter(a => a.code.startsWith("FLD.")).map(a => Number(a.code.split(".")[1]))) + 1).padStart(3, "0");
const railIndex = assets.findIndex(a => a.code === "RAL.001");
const rail = assets[railIndex];
assets.splice(railIndex, 1);
const n = nextField.split(".")[1];
const pageTag = {
    code: nextField, name: "page tag", category: "field",
    summary: "The page tag: the bullets that move between the pages, the sections of a page, the views or cards of a dialog or a floating card, or the Objectives of a nested card, with their names, the arrow and the Back button. It shows bullets only or the names too (the variable rail display); its height follows the number of items and the elements it holds, and its width the length of the names.",
    variables: ["VAR001", "VAR003", "VAR004", "VAR011"], catalogue: [],
    variants: rail.variants.map((v, i) => ({ ...v, code: v.code.replace(/\.001\.(\d{3})$/, "." + n + ".$1").replace(/^RAL\./, "FLD.") })),
    requires: [
        { asset: "BUL.001", role: "one bullet per item; the bullet colour follows the card's colour and the reaction" },
        { asset: "ARW.001", variant: "ARW.PAG.001.001", role: "the arrow placed in the tag" },
        { asset: "BTN.003", role: "the Back button, where the tag has one" },
        { asset: "LBL.001", role: "the names of the items; the title of the tag" }
    ]
};
pageTag.lookNotes = ["moved from the components (" + DATE + "): the rail is not a component. The bullet (BUL.001) is the component; the page tag is a field made of bullets, names, the arrow and the Back button."];
assets.push(pageTag);
const tag = name => pageTag.variants.find(v => v.name === name).code;
asset("FRM.002").requires = asset("FRM.002").requires.map(r => (r.asset === "RAL.001" ? { asset: pageTag.code, variant: tag("Pages rail"), role: "moves between the pages" } : r));
asset("FRM.003").requires = asset("FRM.003").requires.map(r => (r.asset === "RAL.001" ? { asset: pageTag.code, variant: tag("Card rail"), role: "moves between the views or cards" } : r));
const bullet = asset("BUL.001");
note(bullet, "the one bullet of every page tag (the owner, " + DATE + "): there is one type of bullet.");

// ---- the label: no position variants
const label = asset("LBL.001");
label.variables = label.variables.filter(c => c !== "VAR008");
label.variants = [{ ...label.variants.find(v => v.code === "LBL.HEA.001.003"), code: "LBL.HEA.001.001", description: "A bold heading over a group of fields (Description, SWOT Analysis); it differs in style, not in position.", edits: "Bold, with the group's rule." }];
label.summary = "The words that name a field or a group, in a muted colour. Where it stands against its control (above it, or in a column at the side) belongs to the field, not to the label.";
note(label, "position: by the owner's decision (" + DATE + ") a label has no variants for its position (above, at the side); that information belongs to the field (the variable label position of the field assets).");
for (const a of assets) for (const r of a.requires) if (r.variant === "LBL.HEA.001.003") r.variant = "LBL.HEA.001.001";

// ---- tile titles that move
const open = asset("TIL.002");
open.summary += " A tile that a floating card generates (a Resource) shows its title on one line, and a title that is too long moves horizontally.";
note(open, "title: by the owner's decision (" + DATE + ") the tiles that floating cards generate (the Resources tiles) show the title on one line, and a title that is too long moves horizontally instead of being cut off.");

// ---- places: the number of distinct places each look stands in
const same = (l, look) => look.font === l.fontSize && look.radius === l.corners && look.padL === l.paddingLeft && look.padT === l.paddingTop && look.border === l.border;
const withPlaces = look => {
    if (!look || look.places) return look;
    const hit = looks.find(l => same(l, look) && l.count === look.found);
    return hit ? { ...look, places: hit.placeCount } : look;
};
for (const a of assets) {
    a.look = withPlaces(a.look);
    for (const v of a.variants) v.look = withPlaces(v.look);
    if (!a.look) delete a.look;
    for (const v of a.variants) if (!v.look) delete v.look;
}

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied; the page tag is " + nextField + " with the variants " + pageTag.variants.map(v => v.code).join(", "));
