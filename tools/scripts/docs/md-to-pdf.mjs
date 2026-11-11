/**
 * Writes any repo document (Markdown) as a PDF in exports/ (an export; PDFs are never kept in docs/). The converter is markdown-pdf.mjs.
 *
 *   PW_CHANNEL=msedge node tools/scripts/docs/md-to-pdf.mjs docs/design/current/22-help-texts.md exports/The-help-texts.pdf "The help texts" [landscape]
 */
import { readFileSync } from "node:fs";
import { writePdf } from "./markdown-pdf.mjs";

const [source, output, title = "Document", orientation] = process.argv.slice(2);
if (!source || !output) { console.error("usage: node tools/scripts/docs/md-to-pdf.mjs SOURCE.md OUTPUT.pdf [TITLE] [landscape]"); process.exit(1); }
await writePdf({ markdown: readFileSync(source, "utf8"), output, title, landscape: orientation === "landscape" });
console.log("wrote " + output);
