/**
 * The tick box the app now draws has a 2px line (the browser's box had none in the library): the library takes it. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-24.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const add = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

const tick = asset("TIK.001");
tick.look = { ...tick.look, border: 2 };
add(tick, "line corrected 2026-10-16: the drawn tick box has a 2px line in the text colour (the fill when ticked).");

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("tick line set");
