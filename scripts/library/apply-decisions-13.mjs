/**
 * Small additions to the twelfth set (2026-10-15): the kind of the side panel parts and of the popups, which
 * were read as the asset's. A migration kept as the record.
 *
 *   node scripts/library/apply-decisions-13.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const variant = code => assets.flatMap(a => a.variants).find(v => v.code === code);
variant("CAL.HND.001.001").kind = "Side panel handle: a tab that opens a section";
variant("CAL.PNL.001.002").kind = "Side panel: the opened panel";
variant("DAT.DAY.002.001").kind = "Popup: a grid of days";
variant("DAT.MON.002.002").kind = "Popup: a grid of months";
writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
