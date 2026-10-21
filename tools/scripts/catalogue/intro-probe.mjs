/**
 * The Introduction pages: every system has one (the first item of the Pages rail). For each, every text
 * element and control: its tag and class, its words, and how it looks (size, weight, italic, underline,
 * colour, corners, border, height, width), so that the reading texts of the introductions become components.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/intro-probe.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "intro-probe.json");
const SYSTEMS = ["Identity System", "Brand System", "Business System", "Strategy System"];
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];

for (const system of SYSTEMS) {
    await page.goto(base + "/");
    await page.evaluate(o => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", "light");
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, org);
    await page.goto(base + "/assistant");
    await page.waitForTimeout(700);
    await page.getByText("Foundation", { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(1200);
    // The Introduction page is the first item of the Pages rail: open it (never press Start Interview).
    const intro = page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: /Introduction/i }).first();
    if (await intro.count()) { await intro.evaluate(n => n.click()); await page.waitForTimeout(900); }
    const found = await page.evaluate(() => {
        const px = v => Math.round(parseFloat(v) * 100) / 100;
        const root = document.querySelector(".conversation-card, main, #root") ?? document.body;
        const items = [];
        const seen = new Set();
        for (const el of root.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
            const interactive = el.matches("button, a, input, textarea, select, [role=button]");
            if (!own && !interactive) continue;
            const s = getComputedStyle(el);
            const key = el.tagName + own + Math.round(r.top) + Math.round(r.left);
            if (seen.has(key)) continue;
            seen.add(key);
            items.push({
                tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 3).join("."), text: own.slice(0, 70),
                interactive, size: px(s.fontSize), weight: s.fontWeight, italic: s.fontStyle === "italic", underline: s.textDecorationLine.includes("underline"),
                colour: s.color, transform: s.textTransform, tracking: s.letterSpacing, radius: s.borderTopLeftRadius, border: px(s.borderTopWidth), fill: s.backgroundColor,
                w: px(r.width), h: px(r.height), x: px(r.left), y: px(r.top)
            });
        }
        return { title: document.title, url: location.pathname, items };
    });
    console.log(system + ": " + found.items.length + " elements at " + found.url);
    for (const item of found.items) records.push({ system, ...item });
}
await browser.close();
writeFileSync(out, JSON.stringify({ records }));
console.log(records.length + " records -> " + out);
