/**
 * The owner's decisions of 2026-10-15 on the defaults, applied to the library once (a migration, kept as
 * the record; the changes are then logged with npm run library:log):
 *
 *   A1 dropdown padding 6 merged into 8; A2 the i with 18px type merged into 14; A3 the x with a hidden 18px
 *      type merged; A4 the fold arrow with a hidden 18px type merged.
 *   B5 one size for the plus: the tile plus (36px) takes the card plus size (32px); B6 the plus has the corners
 *      of the x (6px); B7 the percent boxes are squares (45 by 45px).
 *   C9 and C10 the Brand Images name box and note follow the new layout, that is, the standard text box and the
 *      standard free text; the 39px wide add buttons are the asset BTN.004 (they were listed under the plus by mistake).
 *
 *   node tools/scripts/library/apply-decisions.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const variant = (a, code) => a.variants.find(v => v.code === code);
const rewrite = (a, test, text) => { const i = a.lookNotes.findIndex(test); if (i < 0) throw new Error("note not found in " + a.code); a.lookNotes[i] = text(a.lookNotes[i]); };
const merged = note => "merged by the owner's decision (" + DATE + "): " + note.replace(/^(kept, the owner decides|merged into the default): /, "");

// A1 to A4
const dropdown = asset("DRP.001"); rewrite(dropdown, n => n.includes("padding 6/8"), merged);
const info = asset("BTN.002"); rewrite(info, n => n.includes("type 18"), merged);
const box = asset("BTN.001");
rewrite(box, n => n.startsWith("kept, the owner decides: x height 32, type 18"), merged);
const fold = asset("ARW.002"); rewrite(fold, n => n.includes("fold arrow height 36, type 18"), merged);

// B5, B6: one plus size (32px, the card plus), with the corners of the x (6px)
const add = variant(box, "BTN.ADD.001.002");
add.look = { ...add.look, corners: box.look.corners };
box.lookNotes = box.lookNotes.filter(n => !n.startsWith("plus"));
box.lookNotes.push(
    "plus: one size, by the owner's decision (" + DATE + "): 32px, the size of the x and of the plus in cards (107 found). The plus on a master tile (36px, 55 found: Customer Engagement 13, Infrastructure Resources 9, Infrastructure 5, Brand 3, Foundation 3 in the five largest places) takes this size.",
    "plus corners: the corners of the x, 6px, by the owner's decision (" + DATE + "); the plus measured 8px (107 found)."
);

// The 39px wide add buttons are their own asset
const wide = asset("BTN.004");
wide.look = { height: 39, fontSize: 18, fontWeight: "400", corners: "6px", paddingLeft: 14, paddingTop: 8, border: 1, scale: "body 18", found: 15 };
wide.lookNotes = ["found 15 times: Customer Engagement 7, Financial Foundation 3, Foundation 1, Identity (Founders and Registrations) 4; 39px high, type 18, padding 14/8, border 1. They are not a plus box; the one look measured."];

// B7: the percent boxes are squares
const number = asset("NUM.001");
const percent = variant(number, "NUM.PCT.001.003");
percent.look = { height: 45, width: 45, fontSize: 18, fontWeight: "400", corners: "6px", paddingLeft: 4, paddingTop: 8, border: 1, scale: "body 18", found: 12 };
percent.edits = "A square box, 45 by 45px, with a percent sign beside it.";
rewrite(number, n => n.includes("padding 4/8"), () => "percent boxes: by the owner's decision (" + DATE + ") they are squares, 45 by 45px, padding 4/8 (the 12 percent boxes of Meetup and event costs measured 44 by 45; the 5 size boxes of Typography and Text Hierarchy measured 45 by 45; 2 people boxes 44 by 45; 1 count box 48 by 45).");

// C9, C10: Brand Images follow the new layout (the standard text box and the standard free text)
const txt = asset("TXT.001");
rewrite(txt, n => n.includes("text box height 44, type 18, corners 0px"), () => "text box with square corners and no border (the name of Brand Images 1 to 3, 3 found): by the owner's decision (" + DATE + ") the Brand Images follow the new layout, that is, the standard text box.");
rewrite(txt, n => n.startsWith("free text: kept"), () => "free text with square corners and no border (the note of Brand Images 1 to 3, 3 found): by the owner's decision (" + DATE + ") the Brand Images follow the new layout, that is, the standard free text.");

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
