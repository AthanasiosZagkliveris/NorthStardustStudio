/**
 * A correction of the library against the app (2026-10-16): the fold arrow is the 36px triangle that folds a card (319 found
 * in the walk of the app: strategy-box-toggle, 36 by 36px, 6px corners, a 1px line), and the label arrow (24px) and the title
 * arrow (28px) are its variants, as the owner decided on 2026-10-15. The default merge of 2026-10-16 had taken the label
 * arrow for the main asset and lost the 36px fold arrow. A migration kept as the record.
 *
 *   node tools/scripts/library/apply-decisions-21.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const fold = assets.find(a => a.code === "ARW.002");
const labelLook = { ...fold.look, width: 24 };
const title = fold.variants.find(v => v.code === "ARW.TTL.002.001");
fold.look = { height: 36, width: 36, fontSize: 0, fontWeight: "400", corners: "6px", paddingLeft: 0, paddingTop: 0, border: 1, scale: "symbol, no text", found: 319, places: 3 };
fold.summary = "A triangle that folds and unfolds a card, a list or a label. By default it is the fold arrow of a card: 36px, a 1px line, 6px corners (the toggle of a nested card, a section, an expanded list). Its variants are the frameless label arrow beside a field label (24px, 6px from the label) and the title arrow beside a chapter or column title (28px).";
fold.kind = "Fold control: a triangle that folds and unfolds";
fold.belongs = "Cards, nested boxes, lists and labels";
fold.variants = [
    { code: "ARW.LAB.002.001", name: "Label arrow", description: "A frameless arrow beside a label that opens a list under it.", edits: "No frame; 24px; sits 6px from the label.", values: {}, look: labelLook, kind: "Fold control, frameless: beside a label", belongs: "Beside a label" },
    { ...title, code: "ARW.TTL.002.002", belongs: "Beside a chapter or column title" }
];
fold.lookNotes = [...(fold.lookNotes ?? []), "corrected 2026-10-16: the default is the 36px fold arrow of a card (319 found by the walk of the app, strategy-box-toggle, 36 by 36px, 6px corners, a 1px line); the label arrow and the title arrow are its variants, as decided on 2026-10-15. The default merge had made the label arrow the main asset."];
const toggle = assets.find(a => a.code === "BTN.008");
toggle.look = { ...toggle.look, corners: "4px" };
toggle.lookNotes = [...(toggle.lookNotes ?? []), "corners corrected 2026-10-16: 4px, as the walk of the app measured them (the library had 0 by assumption)."];
writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/records/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/library/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("fold arrow corrected");
