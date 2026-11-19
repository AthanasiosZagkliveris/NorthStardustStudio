import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const run = await import("./run.mjs");
const browser = await chromium.launch();
for (const W of [1920, 1366]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: W === 1920 ? 1000 : 768 } })).newPage();
    await run.seedExample(page, "http://localhost:1420", readFileSync("C:/Projects/NorthStardustStudio/src/data/examples/lumen-and-loom-studio.json", "utf8"));
    const labels = await page.evaluate(() => 0);
    for (const [system, name] of [["Identity System", "^1\. Definition"], ["Brand System", "Brand System"], ["Business System", "Foundation"], ["Business System", "Infrastructure"], ["Business System", "Financials"]]) {
        const ok = await run.openPage(page, "http://localhost:1420", system, name);
        if (!ok) { console.log(W, name, "not found"); continue; }
        await page.waitForTimeout(1200);
        console.log(W, name.padEnd(20), await page.evaluate(() => [...new Set([...document.querySelectorAll(".section-tile-slot:not(.card-tile-slot)")].filter(s => !s.closest(".section-tile-overlay, .floating-card-host") && s.getBoundingClientRect().width > 0).map(s => Math.round(s.getBoundingClientRect().width) + "x" + Math.round(s.getBoundingClientRect().height)))].join(" ")));
    }
    await page.close();
}
await browser.close();
