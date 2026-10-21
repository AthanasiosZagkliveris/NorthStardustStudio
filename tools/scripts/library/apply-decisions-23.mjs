/**
 * The owner's decisions of 2026-10-16 (second message): the tick box (24px) has rounded corners of 4px; the colour picker is a
 * square cell with rounded corners holding a square colour with rounded corners; the one date cell and the month-and-year form
 * share one calendar (same cell, size, arrows, keys). A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-23.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const add = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

const tick = asset("TIK.001");
tick.look = { ...tick.look, corners: "4px" };
add(tick, "decided 2026-10-16 (owner): the tick box is 24px with rounded corners of 4px, drawn by the app (not the browser's box); the check is white on the fill.");
add(asset("PCK.001"), "decided 2026-10-16 (owner): the cell is a square (44px) with rounded corners, and the colour in it is a square with rounded corners (one step smaller).");
add(asset("DAT.001"), "decided 2026-10-16 (owner): the day cell and the month-and-year cell are one component in two forms: the same cell, width, calendar button (24px symbol on a 32px button), calendar card, arrows, keys and closing; only the grid differs (days, or the months of a year).");
add(asset("DAT.002"), "decided 2026-10-16 (owner): the month calendar is the day calendar's card (head with the double and single arrows and the title, the grid in the same width, a foot), the grid being the twelve months of the year in four columns; its foot offers This month.");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions 23 applied");
