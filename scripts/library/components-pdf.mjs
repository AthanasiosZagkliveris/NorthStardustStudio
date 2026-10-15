/**
 * Writes the components document as a PDF to read or download (an export; the PDF is never kept in the
 * project): the text of docs/design/14-components-list.md, laid out for reading, with a picture of each
 * component taken from the inventory page (the dev server must be running).
 *
 *   PW_CHANNEL=msedge node scripts/library/components-pdf.mjs OUTPUT.pdf
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const output = process.argv[2];
if (!output) { console.error("usage: node scripts/library/components-pdf.mjs OUTPUT.pdf"); process.exit(1); }
const markdown = readFileSync("docs/design/14-components-list.md", "utf8").split("\r").join("");
const escape = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = s => escape(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const shot = await context.newPage();
await shot.goto("http://localhost:1420/library/inventory");
await shot.waitForTimeout(3500);
await shot.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await shot.addStyleTag({ content: "article.inventory-asset > h3, article.inventory-asset > p, article.inventory-asset > details { display: none !important; } article.inventory-asset { border: 0 !important; padding: 0 !important; margin: 0 !important; }" });
const pictures = new Map();
for (const code of await shot.evaluate(() => [...document.querySelectorAll("section[data-category='component'] article.inventory-asset")].map(a => a.dataset.asset))) {
    pictures.set(code, (await shot.locator("article[data-asset='" + code + "']").screenshot()).toString("base64"));
}

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
        const code = /^([A-Z]{3}\.\d{3}) /.exec(h[2]);
        if (level === 4 && code && pictures.has(code[1])) html.push("<img src='data:image/png;base64," + pictures.get(code[1]) + "'>");
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
h2.part { page-break-before: always; font-size: 18pt; }
h2 { page-break-before: always; }
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
if (process.argv[3]) writeFileSync(process.argv[3], page);
const doc = await context.newPage();
await doc.setContent(page);
await doc.waitForTimeout(500);
await doc.pdf({ path: output, format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: "<div style='font:8pt Arial;width:100%;text-align:center;color:#6b7280'>The components - page <span class='pageNumber'></span> of <span class='totalPages'></span></div>", margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
await browser.close();
console.log("wrote " + output + " (" + pictures.size + " pictures)");
