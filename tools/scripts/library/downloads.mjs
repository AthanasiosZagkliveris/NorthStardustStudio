/**
 * Writes the downloadable versions of the library documents into exports/ (the folder is not kept in git):
 * the components and fields documents and the design documents listed below as PDFs, and the CSV and Excel files of
 * the components, the dropdowns, the fields, the text holders, the text links and the help texts. The dev server must be
 * running (the PDF draws a picture of each component from the inventory page).
 *
 *   PW_CHANNEL=msedge node tools/scripts/library/downloads.mjs
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

mkdirSync("exports", { recursive: true });
execFileSync(process.execPath, ["tools/scripts/library/export-csv.mjs"], { stdio: "inherit" });
copyFileSync("tools/catalogue/exports/components.csv", "exports/The-components.csv");
copyFileSync("tools/catalogue/exports/dropdowns.csv", "exports/The-dropdowns.csv");
execFileSync(process.execPath, ["tools/scripts/library/components-pdf.mjs", "exports/The-components.pdf"], { stdio: "inherit" });
execFileSync(process.execPath, ["tools/scripts/library/fields-list.mjs", "--export"], { stdio: "inherit" });
execFileSync(process.execPath, ["tools/scripts/library/components-pdf.mjs", "exports/The-fields.pdf"], { stdio: "inherit", env: { ...process.env, DOC: "docs/design/library/04-fields-list.md", LANDSCAPE: "1", TITLE: "The fields" } });
// The design documents that have a downloadable version: a PDF of each (md-to-pdf.mjs, no pictures), and the CSV its own script writes.
const DOCUMENTS = [
    ["docs/design/interface/02-text-holders.md", "The-text-holders", "The text holders", "tools/scripts/catalogue/text-holders-doc.mjs"],
    ["docs/design/interface/05-reactions.md", "The-reactions", "The reactions"],
    ["docs/design/interface/06-text-links.md", "The-text-links", "The text links", "tools/scripts/catalogue/text-links-doc.mjs"],
    ["docs/design/interface/03-free-text-categories.md", "The-free-text-categories", "The free-text categories"],
    ["docs/design/interface/01-shared-components.md", "The-shared-components", "The shared components"],
    ["docs/design/interface/09-help-texts.md", "The-help-texts", "The help texts", "tools/scripts/catalogue/help-texts-doc.mjs"],
    ["docs/design/interface/07-popups.md", "The-popups", "The popups"],
    ["docs/design/questions/07-organisation-tile.md", "The-organisation-tile", "The Organisation tile"],
    ["docs/design/questions/08-positioning-tile.md", "The-positioning-tile", "The Positioning tile"]
];
for (const [doc, file, title, csvScript] of DOCUMENTS) {
    if (csvScript) {
        execFileSync(process.execPath, [csvScript], { stdio: "inherit" });
    }
    execFileSync(process.execPath, ["tools/scripts/docs/md-to-pdf.mjs", doc, "exports/" + file + ".pdf", title], { stdio: "inherit" });
}
console.log("downloadable versions in exports/: The-fields.pdf, The-fields.xlsx, The-fields.csv, The-add-buttons.xlsx, The-components.pdf, The-components.xlsx, The-dropdowns.xlsx, The-components.csv, The-dropdowns.csv, and " + DOCUMENTS.map(([, file, , csv]) => file + ".pdf" + (csv ? ", " + file + ".csv" : "")).join(", "));
