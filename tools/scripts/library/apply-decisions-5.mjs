/**
 * The owner's decision of 2026-10-15 on the wide add button, applied to the library once (a migration, kept
 * as the record; the change is then logged with npm run library:log): the button is 44px high, and the plus
 * inside it has the size and the place of the plus box (32px, at the left, like the plus box).
 *
 *   node tools/scripts/library/apply-decisions-5.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const wide = assets.find(a => a.code === "BTN.004");
wide.summary = "A wide text button that adds a row to a list (+ ADD CHANNEL, + ADD REGISTRATION NUMBER): 44px high, with the plus box at its left and its words after it.";
wide.requires = [{ asset: "BTN.001", variant: "BTN.ADD.001.002", role: "the plus: 32px, at the left of the button, like the plus box" }];
wide.lookNotes = [...wide.lookNotes.filter(n => !n.startsWith("height:")), "height and plus: by the owner's decision (owner, 2026-10-15) the button looks like a cell, so it is 44px high like every cell (it measured 39px); the plus inside it has the size and the place of the plus box, 32px, at the left, like the plus box."];

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decision applied");
