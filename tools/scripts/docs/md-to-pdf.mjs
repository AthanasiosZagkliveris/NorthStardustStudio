/**
 * Writes any repo document (Markdown) as a PDF in exports/ (an export; PDFs are never kept in docs/).
 *
 *   PW_CHANNEL=msedge node tools/scripts/docs/md-to-pdf.mjs docs/design/current/22-help-texts.md exports/The-help-texts.pdf "The help texts" [landscape]
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const [source, output, title = "Document", orientation] = process.argv.slice(2);
if (!source || !output) { console.error("usage: node tools/scripts/docs/md-to-pdf.mjs SOURCE.md OUTPUT.pdf [TITLE] [landscape]"); process.exit(1); }
const markdown = readFileSync(source, "utf8").split("\r").join("");
const escape = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = s => escape(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
// A small converter for the subset of Markdown the document uses.
const lines = markdown.split("\n");
const html = [];
let table = null, list = false;
const flush = () => { if (list) { html.push("</ul>"); list = false; } if (table) { html.push("<table>" + table.join("") + "</table>"); table = null; } };
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("|")) {
        if (!table) table = [];
        if (/^\|[-| ]+\|$/.test(line)) continue;
        const cells = line.slice(1, -1).split("|").map(c => c.trim());
        const head = table.length === 0;
        table.push("<tr>" + cells.map(c => "<" + (head ? "th" : "td") + ">" + inline(c) + "</" + (head ? "th" : "td") + ">").join("") + "</tr>");
        continue;
    }
    flush();
    const h = /^(#{1,5}) (.+)$/.exec(line);
    if (h) {
        const level = h[1].length;
        html.push("<h" + level + (level === 2 ? ' class="part"' : "") + ">" + inline(h[2]) + "</h" + level + ">");
        continue;
    }
    if (line.startsWith("- ")) { if (!list) { html.push("<ul>"); list = true; } html.push("<li>" + inline(line.slice(2)) + "</li>"); continue; }
    if (line.trim() === "") continue;
    html.push("<p>" + inline(line) + "</p>");
}
flush();

const css = `
@page { size: A4; margin: 18mm 16mm; }
body { font: 10.5pt/1.5 "Segoe UI", Arial, sans-serif; color: #1f2937; }
h1 { font-size: 24pt; margin: 0 0 4mm; }
h2 { font-size: 15pt; margin: 8mm 0 2mm; border-bottom: 1.5px solid #374151; padding-bottom: 1mm; }
h2.part { font-size: 18pt; }
h3 { font-size: 14pt; margin: 7mm 0 1mm; page-break-after: avoid; }
h4 { font-size: 12pt; margin: 6mm 0 1mm; page-break-after: avoid; }
h5 { font-size: 10.5pt; margin: 3mm 0 1mm; page-break-after: avoid; }
p { margin: 0 0 2mm; }
ul { margin: 0 0 3mm 5mm; padding: 0; }
li { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 2mm 0 4mm; font-size: 9pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th, td { border: 1px solid #d1d5db; padding: 1.2mm 2mm; text-align: left; vertical-align: top; }
th { background: #f3f4f6; }
img { max-width: 100%; border: 1px solid #e5e7eb; margin: 1mm 0 2mm; }
code { font-size: 9pt; }
`;
const page = "<html><head><meta charset='utf-8'><style>" + css + "</style></head><body>" + html.join("\n") + "</body></html>";
const doc = await context.newPage();
await doc.setContent(page);
await doc.waitForTimeout(500);
await doc.pdf({ path: output, format: "A4", landscape: orientation === "landscape", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: "<div style='font:8pt Arial;width:100%;text-align:center;color:#6b7280'>" + title + " - page <span class='pageNumber'></span> of <span class='totalPages'></span></div>", margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
await browser.close();
console.log("wrote " + output);
