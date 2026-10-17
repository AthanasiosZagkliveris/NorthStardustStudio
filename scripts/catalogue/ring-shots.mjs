/**
 * Pictures of the ring on the cells that hold a field in a box (the month cell, the colour cell, the date cell, a text area, a numbered list), dark theme,
 * into the folder given. The dev server must be running.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/ring-shots.mjs OUTPUT_FOLDER
 */
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { seedExample, openPage } from "../layout-check/run.mjs";

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const base = "http://localhost:1420";
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const example = readFileSync("src/data/examples/lumen-and-loom-studio.json", "utf8");
await seedExample(page, base, example);
await page.evaluate(() => localStorage.setItem("northstardust-theme", "dark"));
const shot = async (locator, name) => {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    await page.waitForTimeout(300);
    const box = await locator.boundingBox();
    await page.screenshot({ path: out + "/" + name + ".png", clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 30), width: Math.min(460, box.width + 200), height: box.height + 70 } });
    const ring = await page.evaluate(() => { const a = document.activeElement; const w = a.closest(".date-cell-field, .numbered-list"); const f = e => e ? getComputedStyle(e).boxShadow.slice(0, 100) + " | border " + getComputedStyle(e).borderTopColor : "-"; return "active " + a.className.toString().slice(0, 30) + " :: " + f(a) + " || box " + f(w); });
    console.log(name, ring);
    await page.keyboard.press("Escape");
};
// Strategy: the month cell
await openPage(page, base, "Strategy System", "Strategy System");
await page.locator("button.section-tile", { hasText: "Strategic Period" }).first().evaluate(n => n.click());
await page.waitForTimeout(900);
await shot(page.locator(".month-picker-trigger").first(), "month");
// Brand: the colour cell
await openPage(page, base, "Brand System", "Brand System");
await page.locator("button.section-tile", { hasText: "Colours" }).first().evaluate(n => n.click());
await page.waitForTimeout(800);
await page.locator(".picture-box").first().evaluate(n => n.click());
await page.waitForTimeout(900);
await shot(page.locator(".brand-hex-input").first(), "colour");
await page.waitForTimeout(300);
await browser.close();
