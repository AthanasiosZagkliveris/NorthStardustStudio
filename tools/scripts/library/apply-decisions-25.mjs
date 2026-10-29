/**
 * The owner's decisions of 2026-10-16 (third message): the tick box and the date cell take a text input's look (no stroke, the recessed inset, the glow, the ring), the
 * calendar button follows the "+" box, the calendar card takes the card's ground and the months read Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec; the colour
 * is a 32px box inside the hex cell. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-25.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const add = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

const tick = asset("TIK.001");
tick.look = { ...tick.look, border: 1 };
add(tick, "decided 2026-10-16 (owner): the tick box has a text input's look: no visible stroke (a 1px transparent line), the recessed inset, the soft glow under the pointer and the ring when active; ticked it is filled with the app's blue with a white check in its exact centre; no bold on hover.");
add(asset("DAT.001"), "decided 2026-10-16 (owner): the date cell and the month cell take a text input's look (no stroke, recessed inset, glow, ring, no bold on hover); the calendar button follows the \"+\" box (BTN.ADD.001.001): the ground of the card, a 2px stroke and the symbol in the darker tone, filled on hover; the cell shows its months as Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec; the calendar closes on a click anywhere outside it.");
add(asset("DAT.002"), "decided 2026-10-16 (owner): the calendar card stands on the ground of the card it opens from (the + box's ground), its buttons share one 2px frame so hovering or choosing never changes their size, numbers and letters at the body size; months: Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec.");
add(asset("PCK.001"), "decided 2026-10-16 (owner): the colour is a 32px square with rounded corners INSIDE the hex cell at its right end, 6px from the top, bottom and right (as the date cell's calendar button); an x beside the cell, in the card's x column, clears the colour.");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("tick line set");
