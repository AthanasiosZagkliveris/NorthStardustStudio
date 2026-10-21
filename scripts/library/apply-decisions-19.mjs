/**
 * The ADD buttons that exist in the four systems, scanned in the source on 2026-10-16 (docs/design/15-fields-list.md):
 * their words are recorded in the components that carry them. A migration kept as the record.
 *
 *   node scripts/library/apply-decisions-19.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = code => assets.flatMap(a => a.variants).find(v => v.code === code);
asset("BTN.004").belongs = "Words: + Add founder, + Add expense, + Add Colour, + Add Typeface, + Add Offering, + Add Journey Stage, + Add Relationship Type, + Add resource, + Add channel, + Add expenses (opens a menu), and + Add with the kind of nested card in Strategy (Goal, Objective, Metric, Initiative)";
variant("BTN.ROW.004.001").belongs = "Words: + Add legal requirement, + Add registration number, + Add tax registration (the Legal Entity card's lists)";
variant("BTN.SML.004.002").belongs = "The notes panel: + Add note, Add Date, Link a field";
asset("BTN.001").belongs = "The x of cards and fields; the plus of rows and tiles (Add {card} to {tile}, Add {status} to {card}, Add row, Add item, Add entry, Add another {column}); the shrink of nested cards";
asset("BTN.005").belongs = "The end of the grid in an opened tile view (+ Add Card); the profile pages (the plus tile)";
asset("DRP.001").lookNotes = [...(asset("DRP.001").lookNotes ?? []), "an option may be + Add at the end of a list (the activities): choosing it makes an ordinary activity, chooses it and asks its name (a reaction of the option, scanned 2026-10-16)."];
writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("add buttons recorded");
