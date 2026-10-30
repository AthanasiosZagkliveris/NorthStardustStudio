/**
 * The colour picker is now the 32px colour box inside the hex cell (owner, 2026-10-16): the library takes the size the app draws.
 * A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-26.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const picker = assets.find(a => a.code === "PCK.001");
picker.look = { ...picker.look, height: 32, width: 32 };
picker.lookNotes = [...(picker.lookNotes ?? []), "size corrected 2026-10-16: the colour is a 32 by 32px box inside the 44px hex cell (the 44px square cell it was is now the hex cell)."];

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("colour box size set");
