/**
 * The Strategy walk: the structure of the Strategy System page. The three
 * content tiles (Current Situation, SWOT Analysis, Strategic Compass): their
 * fields in order. Then each Theme card of the Strategic Period, and every box
 * nested in it (Theme, Goal, Objective, Metric): its kind, its head (name, the
 * kind label, the "+" and the x), its own fields in order (not those of the
 * boxes inside it), its size, corners and padding. Presses only tiles and links.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/strategy-walk.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "strategy-walk.json");
const org = JSON.parse(readFileSync(new URL("../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];

async function openStrategy() {
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
    await page.locator("li.system-item", { hasText: "Strategy System" }).press("Enter");
    await page.waitForTimeout(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await page.waitForTimeout(600); }
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: /Strategy System/ }).first().evaluate(n => n.click());
    await page.waitForTimeout(800);
}

/** Runs in the page: the top layer's fields, and the strategy boxes with their own fields. */
function readLayer() {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const layer = [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay)")].pop();
    if (!layer) return null;
    const kindOf = el => {
        if (el.matches("input[type=checkbox]")) return "tick box";
        if (el.matches("textarea")) return "text area";
        if (el.matches(".option-picker-trigger")) return "dropdown";
        if (el.matches(".date-cell, input[type=date], .month-picker-trigger")) return "date cell";
        if (el.matches("input[inputmode], input[type=number]")) return "number box";
        if (el.matches("input")) return "text box";
        if (el.matches(".strategy-box-remove, .card-remove")) return "x";
        if (el.matches(".plus-box, .strategy-box-add, .strategy-add-button")) return "plus";
        if (el.matches(".info-note-button")) return "info";
        if (el.matches(".strategy-box-toggle")) return "fold arrow";
        return "other";
    };
    const sel = "input, textarea, .option-picker-trigger, .date-cell, .month-picker-trigger, .strategy-box-remove, .card-remove, .plus-box, .strategy-box-add, .strategy-add-button, .info-note-button, .strategy-box-toggle";
    const own = (box, nested) => [...box.querySelectorAll(sel)].filter(el => el.getBoundingClientRect().width > 0 && !nested.some(n => n !== box && n.contains(el) && box.contains(n)))
        .map(el => {
            const row = el.closest(".strategy-metric-field, .strategy-objective-when, .field-row, [class*=field]") || el.parentElement;
            return kindOf(el) + ":" + (row.querySelector(".field-label, label")?.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30);
        });
    const boxes = [...layer.querySelectorAll(".strategy-theme-fields, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box")];
    const list = boxes.map(box => {
        const r = box.getBoundingClientRect();
        const s = getComputedStyle(box);
        const kind = box.querySelector(":scope > .strategy-box-head .strategy-head-kind-name")?.textContent.trim() || box.querySelector(":scope > .strategy-box-head")?.innerText.trim().slice(0, 20) || "";
        let depth = 0;
        for (let p = box.parentElement; p && p !== layer; p = p.parentElement) if (boxes.includes(p)) depth++;
        return { kind, depth, w: px(r.width), h: px(r.height), radius: s.borderTopLeftRadius, padL: px(s.paddingLeft), padT: px(s.paddingTop), border: px(s.borderTopWidth), fields: own(box, boxes) };
    });
    return { all: own(layer, []), boxes: list };
}

await openStrategy();
for (const name of ["Current Situation", "SWOT Analysis", "Strategic Compass"]) {
    await page.locator(".section-tile-slot", { hasText: name }).locator("button.section-tile").first().evaluate(n => n.click());
    await page.waitForTimeout(800);
    const layer = await page.evaluate(readLayer);
    records.push({ view: name, kind: "content tile", fields: layer ? layer.all : null });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
}
const themes = await page.evaluate(() => [...document.querySelectorAll(".section-tile-slot")].filter(s => /Strategic Period/.test(s.textContent)).flatMap(s => [...s.querySelectorAll("button.section-tile-link")].map(l => l.textContent.trim())));
for (const theme of themes) {
    await openStrategy();
    await page.locator(".section-tile-slot", { hasText: "Strategic Period" }).locator("button.section-tile-link", { hasText: theme }).first().evaluate(n => n.click());
    await page.waitForTimeout(900);
    const layer = await page.evaluate(readLayer);
    for (const box of layer ? layer.boxes : []) records.push({ view: "Strategic Period / " + theme, type: "strategy box", ...box });
    console.log(theme + ": " + (layer ? layer.boxes.length : 0) + " boxes");
}
await browser.close();
writeFileSync(out, JSON.stringify({ records }));
console.log(records.length + " records -> " + out);
