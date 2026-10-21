/**
 * The owner's decisions and corrections of 2026-10-15, sixth set, applied to the library once (a migration,
 * kept as the record; the changes are then logged with npm run library:log):
 *
 *   - The years boxes are squares like the percent boxes (44 by 44px).
 *   - The rails were mixed up: the kinds of rail are by what they move between (the pages, the sections of a
 *     page, the views or cards of a dialog or a floating card, the Objectives of a nested card), and how much of
 *     a rail shows (bullets only, or the names too) is a variable, not a kind. Document: the scan's measures.
 *
 *   node tools/scripts/library/apply-decisions-6.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const variables = structuredClone(library.variables);
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);

// The years box is a square
const number = asset("NUM.001");
const years = number.variants.find(v => v.code === "NUM.YRS.001.004");
years.look = { height: 44, width: 44, fontSize: 18, fontWeight: "400", corners: "6px", paddingLeft: 4, paddingTop: 8, border: 1, scale: "body 18", found: 8 };
years.edits = "A square box, 44 by 44px, with the word years beside it.";
number.lookNotes = [...(number.lookNotes ?? []), "years boxes: by the owner's decision (" + DATE + ") they are squares, 44 by 44px, like the percent boxes (8 found: Useful life and Amortisation period)."];

// The rails, by kind; the display is a variable
variables.push({
    code: "VAR011", name: "rail display", description: "How much of a rail shows.",
    values: [
        { name: "bullets only", description: "A narrow tab (37px wide) of bullets; each name shows as a tooltip on hover." },
        { name: "with names", description: "The names stand beside the bullets; the rail is as wide as its longest name (145 to 229px measured)." }
    ]
});
const rail = asset("RAL.001");
rail.variables = [...rail.variables, "VAR011"];
rail.summary = "A column of bullets that moves between the pages, the sections of a page, the views or cards of a dialog or a floating card, or the Objectives of a nested card. It holds the bullets, the arrow and the Back button. It shows bullets only or the names too (the variable rail display); its height follows the number of items.";
rail.variants = [
    { code: "RAL.PAG.001.001", name: "Pages rail", description: "The rail at the left of the page: one bullet per page of the system. Bullets only: 37px wide (94px high for two pages, 128px for three, 230px for six); with names: 209 to 229px wide, 133px high for two pages.", edits: "At the left of the page, with the page arrows.", values: {} },
    { code: "RAL.SEC.001.002", name: "Sections rail", description: "The rail at the right of the page: one bullet per section of the page (Customer Channel, Customer Relationship). Bullets only: 37px wide (94px high for two sections, 162px for four); with names: 190px wide, 133px high for two. A page with no sections has only the Next arrow there, 25 by 44px.", edits: "At the right of the page.", values: {} },
    { code: "RAL.CAR.001.003", name: "Card rail", description: "The rail beside a dialog or a floating card: one bullet per view or card in it. Bullets only: a 37px tab (76px high for two items, 110 for three, 144 for four, 178 for five, 351 for eight); with names: 145 to 217px wide (131px high for two items, 174 for three, 217 for four, 502 for nine, 668 for thirteen).", edits: "Beside a dialog or a floating card.", values: {} },
    { code: "RAL.NST.001.004", name: "Nested card rail", description: "The rail of a nested card (Goal, Objective, Metric): 88 by 88px, two arrows and the bullets, without a tab.", edits: "Inside a nested card; two arrows and the bullets.", values: {} }
];
rail.lookNotes = [...(rail.lookNotes ?? []), "kinds corrected (" + DATE + "): the earlier variants Sections rail and Named rail mixed up the kind of rail and how much of it shows. The kinds are by what the rail moves between; how much shows is the variable rail display. The scan at 1920px found the Pages rail with bullets only for three or more pages and with names for two; the rulebook says names show from 1700px; which rule decides is not settled."];
const dialog = asset("FRM.003");
dialog.requires = dialog.requires.map(r => (r.asset === "RAL.001" ? { ...r, variant: "RAL.CAR.001.003", role: "moves between the views or cards" } : r));

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
