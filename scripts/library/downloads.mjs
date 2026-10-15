/**
 * Writes the downloadable versions of the library documents into exports/ (the folder is not kept in git):
 * the components document as a PDF, and the components and dropdowns as CSV files for Excel. The dev server must be
 * running (the PDF draws a picture of each component from the inventory page).
 *
 *   PW_CHANNEL=msedge node scripts/library/downloads.mjs
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

mkdirSync("exports", { recursive: true });
execFileSync(process.execPath, ["scripts/library/export-csv.mjs"], { stdio: "inherit" });
copyFileSync("catalogue/exports/components.csv", "exports/The-components.csv");
copyFileSync("catalogue/exports/dropdowns.csv", "exports/The-dropdowns.csv");
execFileSync(process.execPath, ["scripts/library/components-pdf.mjs", "exports/The-components.pdf"], { stdio: "inherit" });
console.log("downloadable versions in exports/: The-components.pdf, The-components.csv, The-dropdowns.csv");
