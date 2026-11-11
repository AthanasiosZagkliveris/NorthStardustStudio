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
execFileSync(process.execPath, ["tools/scripts/library/components-pdf.mjs", "exports/The-fields.pdf"], { stdio: "inherit", env: { ...process.env, DOC: "docs/design/library/14-fields-list.md", LANDSCAPE: "1", TITLE: "The fields" } });
// The design documents that have a downloadable version: a PDF of each, and the CSV its own script writes.
const DOCUMENTS = [
    ["docs/design/current/16-text-holders.md", "The-text-holders", "The text holders", "tools/scripts/catalogue/text-holders-doc.mjs"],
    ["docs/design/current/18-reactions.md", "The-reactions", "The reactions"],
    ["docs/design/current/19-text-links.md", "The-text-links", "The text links", "tools/scripts/catalogue/text-links-doc.mjs"],
    ["docs/design/current/20-free-text-categories.md", "The-free-text-categories", "The free-text categories"],
    ["docs/design/current/21-shared-components.md", "The-shared-components", "The shared components"],
    ["docs/design/current/22-help-texts.md", "The-help-texts", "The help texts", "tools/scripts/catalogue/help-texts-doc.mjs"],
    ["docs/design/current/23-popups.md", "The-popups", "The popups"],
    ["docs/design/questionnaire/37-organization-fields.md", "The-organisation-tile", "The Organisation tile"],
    ["docs/design/questionnaire/38-positioning-questions.md", "The-positioning-tile", "The Positioning tile"]
];
for (const [doc, file, title, csvScript] of DOCUMENTS) {
    if (csvScript) {
        execFileSync(process.execPath, [csvScript], { stdio: "inherit" });
    }
    execFileSync(process.execPath, ["tools/scripts/library/components-pdf.mjs", "exports/" + file + ".pdf"], { stdio: "inherit", env: { ...process.env, DOC: doc, TITLE: title } });
}
console.log("downloadable versions in exports/: The-fields.pdf, The-fields.xlsx, The-fields.csv, The-add-buttons.xlsx, The-components.pdf, The-components.xlsx, The-dropdowns.xlsx, The-components.csv, The-dropdowns.csv, and " + DOCUMENTS.map(([, file, , csv]) => file + ".pdf" + (csv ? ", " + file + ".csv" : "")).join(", "));
