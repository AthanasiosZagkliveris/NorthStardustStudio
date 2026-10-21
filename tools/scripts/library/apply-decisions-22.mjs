/**
 * The date cell and its popups made as the owner asked (2026-10-16): the calendar button is inside the cell (a 32px box button
 * with a drawn calendar symbol, no emoji), the cell opens a calendar list of its own (days, with Today and Clear, rounded 6px
 * corners; the browser's native picker is no longer used), and the month-and-year form has the same cell with the symbol inside.
 * Notes of the library that said "to do" now say what the app does. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-22.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const add = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

add(asset("DAT.001"), "done 2026-10-16: the calendar button is inside the cell, 32px high with a drawn calendar symbol (an SVG in the text colour, not an emoji); the month-and-year form (the Strategic Period, the Financial Plan) is the same cell with the same symbol inside; the browser's native date input is no longer used.");
add(asset("DAT.002"), "done 2026-10-16: the day calendar is the app's own (the list under the date cell: month and year with previous and next arrows, the days from Monday, Today and Clear, 6px corners, a day after the latest or before the earliest allowed is dimmed and cannot be chosen); it closes on a choice, on Escape and on a click elsewhere, as a dropdown's list does.");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("date cell notes added");
