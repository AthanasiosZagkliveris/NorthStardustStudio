/**
 * The colour box has no frame and no text (owner, 2026-10-17): the library takes what the app draws.
 * A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-29.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const picker = assets.find(a => a.code === "PCK.001");
picker.look = { ...picker.look, border: 0, fontSize: 0, scale: "symbol, no text" };
picker.lookNotes = [...(picker.lookNotes ?? []), "corrected 2026-10-17: the colour box has no frame (the owner took the wire off) and no text."];

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("colour box frame set");
