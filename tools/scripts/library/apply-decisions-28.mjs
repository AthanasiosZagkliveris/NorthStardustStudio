/**
 * The field the cards called Linked to is called Offerings on its label (owner, 2026-10-17); the library already has a field named Offerings, so this one is
 * named Linked Offerings. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-28.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const field = assets.find(a => a.code === "FLD.054");
field.name = "Linked Offerings";
field.summary = "The Offerings field of a card (its label says Offerings): a label and tick list (+ number); with several Offerings the shares count in Units or in %.";

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/core/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions 28 applied");
