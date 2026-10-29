/**
 * The owner's decisions of 2026-10-15, third set, applied to the library once (a migration, kept as the
 * record; the changes are then logged with npm run library:log):
 *
 *   - Every cell is 44px high (the text box, the dropdown, the number box, the date cell; a free text, a name
 *     cell and a list line are at least 44 and grow with their words). The percent boxes are squares of 44.
 *   - B8: the 28px arrow beside a chapter title and the 24px arrow beside a field label are variants of the
 *     label arrow.
 *   - C11: every chapter has a title; the title is a single line at the size of a column title (28px), and a
 *     title that is too long moves horizontally. It is a variant of the text input (Title input), not a text box.
 *
 *   node tools/scripts/library/apply-decisions-3.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = (a, code) => a.variants.find(v => v.code === code);
const note = (a, text) => { a.lookNotes = [...(a.lookNotes ?? []), text]; };

// Every cell is 44px high.
const cellNote = was => "cell height, by the owner's decision (" + DATE + "): every cell is 44px high (it measured " + was + ").";
const txt = asset("TXT.001");
txt.look = { ...txt.look, height: 44 };
variant(txt, "TXT.BOX.001.001").look = { ...variant(txt, "TXT.BOX.001.001").look, height: 44 };
for (const code of ["TXT.ARE.001.002", "TXT.NAM.001.003", "TXT.LST.001.005"]) variant(txt, code).look = { ...variant(txt, code).look, minHeight: 44 };
note(txt, cellNote("45 for the text box, 43 to 45 at least for the others") + " A free text, a name cell and a list line are at least 44px high and grow with their words.");
const dropdown = asset("DRP.001");
dropdown.look = { ...dropdown.look, height: 44 };
note(dropdown, cellNote("45"));
const number = asset("NUM.001");
number.look = { ...number.look, height: 44 };
const percent = variant(number, "NUM.PCT.001.003");
percent.look = { ...percent.look, height: 44, width: 44 };
percent.edits = "A square box, 44 by 44px, with a percent sign beside it.";
note(number, cellNote("45") + " The percent box is a square of 44 by 44px.");
const date = asset("DAT.001");
note(date, cellNote("44") + " Already 44px.");

// B8: the arrow beside a chapter title is a variant of the label arrow
const arrow = asset("ARW.002");
arrow.variants.push({
    code: "ARW.TTL.002.002", name: "Title arrow", description: "The label arrow beside a chapter or column title (Infrastructure & Capability): the same frameless triangle, with the same function, at the size of the title.",
    edits: "The arrow is 28px, the size of a column title (h2), where the label arrow is 24px beside a field label.", values: {},
    look: { height: 28, width: 28, fontSize: 28, fontWeight: "400", corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0, scale: "h2 28", found: 2 }
});
note(arrow, "label arrow and title arrow are variants (the owner's decision, " + DATE + "): the same component, function and style; the size follows the text beside it (24px beside a field label, 28px beside a title).");
arrow.lookNotes = arrow.lookNotes.filter(n => !n.startsWith("kept, the owner decides: label arrow"));

// C11: the chapter title
txt.variants.push({
    code: "TXT.TTL.001.006", name: "Title input", description: "The title of a chapter: a single line at the size of a column title. Every chapter has a title; a title that is too long moves horizontally.",
    edits: "One line, 28px; no cell edge; a long title scrolls sideways.", values: {},
    look: { height: 35, fontSize: 28, fontWeight: "400", corners: "0px", paddingLeft: 0, paddingTop: 0, border: 0, scale: "h2 28", found: 1 }
});
txt.lookNotes = txt.lookNotes.filter(n => !n.includes("text box height 35, type 28"));
note(txt, "title input: by the owner's decision (" + DATE + ") every chapter has a title, a single line at the column title size (28px); a title that is too long moves horizontally. It is not a text box (the frame name in Business, 1. Foundation, 1 found).");
const chapter = asset("FRM.001");
chapter.requires = [...chapter.requires, { asset: "TXT.001", variant: "TXT.TTL.001.006", role: "the title of the chapter" }];

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
