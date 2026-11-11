/**
 * Writes the components document as a PDF to read or download (an export; the PDF is never kept in the
 * project): the text of docs/design/library/13-components-list.md, laid out for reading, with a picture of each
 * component taken from the inventory page (the dev server must be running). The converter is docs/markdown-pdf.mjs.
 *
 *   PW_CHANNEL=msedge node tools/scripts/library/components-pdf.mjs OUTPUT.pdf
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { writePdf } from "../docs/markdown-pdf.mjs";

const output = process.argv[2];
if (!output) { console.error("usage: node tools/scripts/library/components-pdf.mjs OUTPUT.pdf"); process.exit(1); }
const markdown = readFileSync(process.env.DOC ?? "docs/design/library/13-components-list.md", "utf8").split("\r").join("");

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

const code = text => /^([A-Z]{3}\.\d{3}) /.exec(text);
await writePdf({
    markdown, output, browser,
    title: process.env.TITLE ?? "The components",
    landscape: process.env.LANDSCAPE === "1",
    html: process.argv[3],
    afterHeading: (level, text) => level === 4 && code(text) && pictures.has(code(text)[1]) ? "<img src='data:image/png;base64," + pictures.get(code(text)[1]) + "'>" : "",
    css: "h2.part { page-break-before: always; } h2 { page-break-before: always; } h1 + p + h2.part { page-break-before: auto; }"
});
await browser.close();
console.log("wrote " + output + " (" + pictures.size + " pictures)");
