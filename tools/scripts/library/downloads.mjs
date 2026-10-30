/**
 * Writes the downloadable versions of the library documents into exports/ (the folder is not kept in git):
 * the components document as a PDF, and the components and dropdowns as CSV files for Excel. The dev server must be
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
console.log("downloadable versions in exports/: The-fields.pdf, The-fields.xlsx, The-fields.csv, The-add-buttons.xlsx, The-components.pdf, The-components.xlsx, The-dropdowns.xlsx, The-components.csv, The-dropdowns.csv");
