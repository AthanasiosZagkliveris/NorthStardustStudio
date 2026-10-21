/**
 * The owner's decisions of 2026-10-15, second set, applied to the library once (a migration, kept as the
 * record; the changes are then logged with npm run library:log):
 *
 *   C12 the name cell with padding 12 (the name with suggestions, Customer Engagement, Other, Referral partners)
 *       is an error of the app: it takes the standard name cell look.
 *   C13 the text box with padding 38 (the theme name in Strategy) is moved to the name cell.
 *   D14 the i (22px) and the tick box (18px) are enlarged to 24px, the WCAG 2.5.8 minimum, without the exception.
 *   D15 the reference sources are accepted. D16 the letters LST are confirmed (document 08).
 *
 *   node scripts/library/apply-decisions-2.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const DATE = "owner, 2026-10-15";
const assets = structuredClone(library.assets);
const asset = code => assets.find(a => a.code === code);
const rewrite = (a, test, text) => { const i = a.lookNotes.findIndex(test); if (i < 0) throw new Error("note not found in " + a.code); a.lookNotes[i] = text(a.lookNotes[i]); };

const txt = asset("TXT.001");
rewrite(txt, n => n.startsWith("name cell: kept"), () => "app error, by the owner's decision (" + DATE + "): the name cell with padding 12 (the name with suggestions in Customer Engagement, Other, Referral partners; 2 found) is an error of the app and has to take the standard name cell look (padding 38, the number inside). It is counted in the standard name cell.");
rewrite(txt, n => n.includes("text box height 45, type 18, corners 6px, padding 38/8"), () => "moved to the name cell, by the owner's decision (" + DATE + "): the text box with padding 38 (the theme name in Strategy, Strategic Period, Financial Stability; 1 found) is a name cell. It is counted in the standard name cell.");
const nameCell = txt.variants.find(v => v.code === "TXT.NAM.001.003");
nameCell.look = { ...nameCell.look, found: nameCell.look.found + 3 };

const info = asset("BTN.002");
info.look = { ...info.look, height: 24, width: 24 };
info.lookNotes.push("enlarged, by the owner's decision (" + DATE + "): from 22px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (567 found at 22px).");
const tick = asset("TIK.001");
tick.look = { ...tick.look, height: 24, width: 24 };
tick.lookNotes = [...(tick.lookNotes ?? []), "enlarged, by the owner's decision (" + DATE + "): from 18px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (721 found at 18px)."];

writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("decisions applied");
