/**
 * A sweep of an example organization: every page of the four Foundation systems, with each page's tiles, the lines each lists, the tiles that say "No items yet" and the
 * cards flagged incomplete -- to see at a glance what an example leaves empty.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/example-sweep.mjs lumen-and-loom-studio
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { seedExample, openPage, PAGES } from "../layout-check/run.mjs";

const example = process.argv[2] ?? "quillfield-automation-llc";
const base = "http://localhost:1420";
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
await seedExample(page, base, readFileSync("src/data/examples/" + example + ".json", "utf8"));
for (const [system, names] of PAGES) {
    for (const name of names) {
        if (!(await openPage(page, base, system, name))) { console.log("!! no page", system, name); continue; }
        const report = await page.evaluate(() => {
            const tiles = [...document.querySelectorAll(".section-tile-slot")].map(slot => {
                const title = slot.querySelector(".section-tile-title")?.textContent?.trim() ?? "";
                const items = [...slot.querySelectorAll(".section-tile-list li")].length;
                const empty = !!slot.querySelector(".section-tile-empty-note");
                const incomplete = slot.classList.contains("card-tile-incomplete") || !!slot.querySelector(".section-tile-list-alert");
                return title.replace(/\s+/g, " ") + (empty ? " [EMPTY]" : " (" + items + ")") + (incomplete ? " [INCOMPLETE]" : "");
            });
            const empties = [...document.querySelectorAll("textarea, input.interview-input")].filter(node => node.offsetParent && !node.value && !node.disabled).map(node => node.getAttribute("aria-label") || node.placeholder || "?");
            return { tiles, empties: empties.slice(0, 12), count: empties.length };
        });
        console.log(system + " / " + name + ": " + report.tiles.join(" | ") + (report.count ? "  || empty visible fields " + report.count + ": " + report.empties.join("; ") : ""));
    }
}
await browser.close();
