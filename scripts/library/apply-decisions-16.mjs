/**
 * The bullet's reactions and effects, read in the running app on 2026-10-16 (hover, focus, selected, with the
 * pictures): a migration kept as the record.
 *
 *   node scripts/library/apply-decisions-16.mjs
 */
import { writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const assets = structuredClone(library.assets);
const bullet = assets.find(a => a.code === "BUL.001");
bullet.summary = "The one dot of every page tag. Rest: 12px, the card's tint, no ring. Hover and focus: 15.6px (1.3 times), the fill turns darker, a 3px ring of the tint appears, the label is underlined and, in the compact tag, its name shows as a tooltip. Selected: 17.4px (1.45 times), the fill stays the tint, a 4px light bloom surrounds it (25px in all, the largest mark of the tag) and the label is bold. Hovering the selected bullet only underlines its label. All changes run in 0.2 seconds.";
bullet.lookNotes = [...(bullet.lookNotes ?? []), "reactions read 2026-10-16 in the app (Business page tag, 1920px): rest 12px, fill rgb(139, 85, 108); hover 15.6px, fill rgb(101, 70, 89), ring 3px; selected 17.4px, fill rgb(139, 85, 108), bloom 4px; transitions 0.2s for size, colour and ring. In the pictures the selected bullet reads as much larger than the hovered one (25px against 22px with its ring)."];
writeFileSync("src/library/data/library.ts", [
    "// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).",
    "// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).",
    "",
    'import type { Library } from "../model/types.ts";',
    "",
    "export const library: Library = " + JSON.stringify({ variables: library.variables, families: library.families, assets }, null, 1) + ";",
    ""
].join("\n"));
console.log("bullet updated");
