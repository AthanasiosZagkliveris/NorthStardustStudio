/**
 * The owner's decisions of 2026-10-17: the link symbol is drawn (a chain) in the tone of its card and grows 20% about its centre under the pointer (nothing
 * moves); the tick box is flat when ticked and has a field's glow under the pointer; the colour picker opens a card of the app's own; the Offerings field
 * of a card is named Offerings (it was Linked to) and counts in Units or %. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-27.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const add = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

add(asset("BTN.007"), "decided 2026-10-17 (owner): the symbol is a drawn chain (an SVG, 24px), not an emoji, in the tone of the card it stands in (the + box's tone); under the pointer or the keyboard it is 20% larger about its centre, and the box it stands in does not change, so nothing moves.");
add(asset("TIK.001"), "decided 2026-10-17 (owner): ticked, the box is flat (the fill and the check, no inner light or shade); under the pointer it takes a field's soft glow, with no wire drawn on it.");
add(asset("PCK.001"), "decided 2026-10-17 (owner): the colour picker opens a card of the app's own (a square of shades, the hue bar and the R, G and B numbers) on the ground of the card, with the calendar card's corners and closing; the box has no frame.");
const offerings = asset("FLD.054");
offerings.name = "Offerings";
offerings.summary = "The Offerings field: a label and tick list (+ number); with several Offerings the shares count in Units or in %.";

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions 27 applied");
