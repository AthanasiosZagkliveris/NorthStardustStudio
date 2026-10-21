/**
 * The reaction probe: how each kind of control and tile reacts, one instance per
 * kind, on the pages that hold them: the look at rest, on hover, and on keyboard
 * focus, in the three reading modes. The pages: Business > Infrastructure (master
 * tiles, tile links, the "+", the rails and arrows, a new Resource card with its
 * x, "i", dropdown, tick box, text area, date cell and label arrow) and Strategy
 * (the fold arrow, the Add buttons in a card, Back). It presses nothing but the
 * "+" that opens a card; types nothing.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/reactions.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "reactions.json");
const THEMES = ["light", "dark", "sepia"];
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));

/** Kind -> selector (the first visible one is measured), grouped by where it lives. */
const PAGE_KINDS = [
    ["master tile", "button.section-tile"], ["tile link", "button.section-tile-link"], ["plus", ".plus-box"],
    ["page rail bullet", ".bullet-rail-item"], ["page arrow", ".page-arrow:not(.carousel-arrow)"], ["info", ".info-note-button"],
    ["tick box", "input[type=checkbox]"], ["page tab", ".bullet-rail"], ["add button", ".business-add-button, .strategy-add-button"],
    ["fold arrow", ".strategy-box-toggle"], ["expand all", "button.section-tile-expand, .expand-all"]
];
const CARD_KINDS = [
    ["x", ".strategy-box-remove, .card-remove"], ["info", ".info-note-button"], ["dropdown", ".option-picker-trigger"], ["tick box", "input[type=checkbox]"],
    ["text area", "textarea"], ["date cell", ".date-cell, .month-picker-trigger"], ["label arrow", ".label-arrow"], ["plus", ".plus-box"],
    ["number box", "input[inputmode]"], ["carousel arrow", ".page-arrow.carousel-arrow"], ["carousel rail bullet", ".carousel-rail .bullet-rail-item"], ["calendar button", ".date-cell button, .date-cell-button"]
];

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];

async function open(system, name, theme) {
    await page.goto(base + "/");
    await page.evaluate(([o, t]) => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", t);
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, [org, theme]);
    await page.goto(base + "/assistant");
    await page.waitForTimeout(700);
    await page.getByText("Foundation", { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await page.waitForTimeout(600); }
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click());
    await page.waitForTimeout(900);
    for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
        try { await button.click({ timeout: 300 }); } catch { /* gone */ }
    }
    await page.waitForTimeout(300);
}

const LOOK = el => {
    const s = getComputedStyle(el);
    return [s.color, s.backgroundColor, s.borderTopColor, s.boxShadow, s.outlineStyle + " " + s.outlineWidth + " " + s.outlineColor, s.transform, s.opacity, s.textDecorationLine, s.cursor].join(" | ");
};
const NAMES = ["colour", "fill", "border", "shadow", "outline", "transform", "opacity", "underline", "cursor"];
const diff = (a, b) => a.split(" | ").map((value, i) => (value === b.split(" | ")[i] ? null : NAMES[i] + " " + value + " -> " + b.split(" | ")[i])).filter(Boolean).join("; ");

async function measureKinds(where, theme, kinds, scope) {
    for (const [kind, selector] of kinds) {
        const handle = (await page.evaluateHandle(([sel, sc]) => {
            const root = sc ? document.querySelector(sc) : document;
            if (!root) return null;
            return [...root.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; }) ?? null;
        }, [selector, scope])).asElement();
        if (!handle) { records.push({ where, theme, kind, found: false }); continue; }
        try {
            await page.mouse.move(0, 0);
            await page.waitForTimeout(250);
            const rest = await handle.evaluate(LOOK);
            await handle.hover({ timeout: 1500, force: true });
            await page.waitForTimeout(500);
            const hover = await handle.evaluate(LOOK);
            await page.mouse.move(0, 0);
            await page.waitForTimeout(250);
            await handle.focus();
            await page.keyboard.press("Shift+Tab");
            await page.keyboard.press("Tab");
            await page.waitForTimeout(500);
            const focused = await handle.evaluate(el => el === document.activeElement);
            const focus = await handle.evaluate(LOOK);
            const transition = await handle.evaluate(el => getComputedStyle(el).transitionDuration);
            await page.evaluate(() => document.activeElement && document.activeElement.blur());
            records.push({ where, theme, kind, found: true, hover: diff(rest, hover), focus: focused ? diff(rest, focus) : "(could not focus)", transition });
        } catch (error) {
            records.push({ where, theme, kind, found: true, note: String(error).slice(0, 80) });
        }
    }
}

for (const theme of THEMES) {
    console.log("[" + theme + "] Business > Infrastructure");
    await open("Business System", "Infrastructure", theme);
    await measureKinds("Business > Infrastructure (page)", theme, PAGE_KINDS);
    const plus = page.locator("[aria-label='Add Resource to Resources']").filter({ visible: true }).first();
    await plus.evaluate(node => node.click());
    await page.waitForTimeout(700);
    await measureKinds("Business > Infrastructure (new Resource card)", theme, CARD_KINDS, ".floating-card-host");
    console.log("[" + theme + "] Strategy");
    await open("Strategy System", "Strategy System", theme);
    await measureKinds("Strategy (page)", theme, PAGE_KINDS);
    const tile = page.locator("button.section-tile").first();
    if (await tile.count()) {
        await tile.evaluate(node => node.click());
        await page.waitForTimeout(700);
        await measureKinds("Strategy (first tile opened)", theme, [...PAGE_KINDS, ...CARD_KINDS], ".section-tile-overlay:not(.floating-overlay)");
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ records }));
console.log(records.length + " records -> " + out);
