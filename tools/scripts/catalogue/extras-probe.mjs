/**
 * The extra components (the owner's list of 2026-10-15): the system icon, the dividers, the colour picker, the
 * image holder, the shrink button, the Add Card tile, the Refresh control, the messages and units, the reminder,
 * the background help text of a holder cell. For each: where it was found and how it looks (size, type, corners,
 * border, colours). Presses only tiles, links and the plus that opens a card.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/extras-probe.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "extras-probe.json");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];
const wait = ms => page.waitForTimeout(ms);

async function open(system, name) {
    await page.goto(base + "/");
    await page.evaluate(o => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", "light");
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, org);
    await page.goto(base + "/assistant");
    await wait(700);
    await page.getByText("Foundation", { exact: true }).first().click();
    await wait(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await wait(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await wait(600); }
    if (name) {
        await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click());
        await wait(900);
    }
}

/** Runs in the page: the elements matching a selector, and how the first few look. */
function measure(selector) {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const els = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0);
    return {
        count: els.length,
        items: els.slice(0, 3).map(el => {
            const r = el.getBoundingClientRect(), s = getComputedStyle(el), ph = el.matches("input, textarea") ? getComputedStyle(el, "::placeholder") : null;
            return {
                tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."), text: (el.textContent || el.getAttribute("placeholder") || el.getAttribute("aria-label") || "").trim().slice(0, 50),
                w: px(r.width), h: px(r.height), size: px(s.fontSize), weight: s.fontWeight, italic: s.fontStyle === "italic", radius: s.borderTopLeftRadius, border: px(s.borderTopWidth) + " " + s.borderTopStyle,
                fill: s.backgroundColor, colour: s.color, borderColour: s.borderTopColor, padding: s.paddingTop + " " + s.paddingLeft,
                placeholder: ph ? { colour: ph.color, size: px(ph.fontSize), italic: ph.fontStyle === "italic", opacity: ph.opacity } : undefined
            };
        })
    };
}
async function probe(where, name, selector) {
    try { records.push({ where, name, selector, ...(await page.evaluate(measure, selector)) }); }
    catch (error) { records.push({ where, name, selector, count: 0, error: String(error).slice(0, 80) }); }
}

// Landing: the Refresh control
await page.goto(base + "/");
await wait(1000);
await probe("Landing", "Refresh control", ".app-reload");

// The system header: icon, title, page title
await open("Strategy System", "Strategy System");
await probe("Strategy page", "System icon", ".interview-header-icon");
await probe("Strategy page", "System title", ".interview-header h1, h1");
await probe("Strategy page", "Page title", ".interview-header-page-title");
await probe("Strategy page", "Reminder: Financial Plan", ".strategy-field-label");
await probe("Strategy page", "Chapter frame", ".conversation-card .business-foundation-card, .tiles-frame, .column-tiles-page");
await probe("Strategy page", "Master tile", "button.section-tile");
// Strategic Period: the reminder, the Add Card tile, the nested card heads, the shrink button
await page.locator(".section-tile-slot", { hasText: "Strategic Period" }).locator("button.section-tile").first().evaluate(n => n.click());
await wait(900);
await probe("Strategic Period view", "Add Card tile", ".add-card-tile");
await probe("Strategic Period view", "Reminder: Financial Plan", ".strategy-field-label, .strategy-plan-line, [class*=financial-plan]");
await page.keyboard.press("Escape");
await wait(500);
await open("Strategy System", "Strategy System");
await page.locator(".section-tile-slot", { hasText: "Strategic Period" }).locator("button.section-tile-link").first().evaluate(n => n.click());
await wait(1000);
await probe("Theme card", "Nested card head buttons", ".strategy-box-actions button");
await probe("Theme card", "Nested card frame", ".strategy-goal-box, .strategy-objective-box, .strategy-metric-box");
await probe("Theme card", "Add Card tile (nested)", ".add-card-tile");
await probe("Theme card", "Background help text (placeholder)", "textarea[placeholder], input[placeholder]");
await probe("Theme card", "Divider", ".answer-columns-divider, hr, [class*=divider]");

// Brand: colour picker, hex, image holder
await open("Brand System", "Brand System");
await page.locator("[aria-label*='Add Colour']").filter({ visible: true }).first().evaluate(n => n.click());
await wait(900);
await probe("Brand, Colours", "Colour picker", "input[type=color]");
await probe("Brand, Colours", "Hex holder", ".brand-hex-input");
await probe("Brand, Colours", "Colour row", ".brand-colour-row");
await page.keyboard.press("Escape");
await wait(500);
await open("Brand System", "Brand System");
await page.locator(".section-tile-slot", { hasText: "Brand Images" }).locator("button.section-tile").first().evaluate(n => n.click());
await wait(900);
await page.locator(".section-tile-overlay:not(.floating-overlay) button.section-tile").first().evaluate(n => n.click());
await wait(900);
await probe("Brand, Image 1", "Image holder", ".brand-image-card, .brand-image-frame, .brand-image-preview, .brand-image-card img");
await probe("Brand, Image 1", "Image name and note", ".brand-image-name, .brand-image-note");

// Business: messages, units, indicators
await open("Business System", "Financial Foundation");
await probe("Financial Foundation", "Message: missing note", ".business-field-missing-note");
await probe("Financial Foundation", "Unit text beside a number", ".settings-unit, .business-capability-frequency-unit, [class*=unit]");
await probe("Financial Foundation", "Number holders", "input.interview-input");
records.push({ where: "Financial Foundation", name: "Words beside a number (units)", selector: "text % / months / USD", ...(await page.evaluate(() => { const px = v => Math.round(parseFloat(v) * 100) / 100; const hit = [...document.querySelectorAll("span, div, label")].filter(e => e.children.length === 0 && /^(%|months|years|USD|GBP|EUR|px)$/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); return { count: hit.length, items: hit.slice(0, 4).map(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.getAttribute("class") || "").slice(0, 50), text: e.textContent.trim(), size: px(s.fontSize), weight: s.fontWeight, colour: s.color, w: px(r.width), h: px(r.height) }; }) }; })) });
await open("Business System", "Sustainability");
await probe("Sustainability", "Unit text beside a number", ".settings-unit, [class*=unit]");
await open("Business System", "Infrastructure");
await page.locator("[aria-label='Add Resource to Resources']").filter({ visible: true }).first().evaluate(n => n.click());
await wait(800);
await probe("New Resource card", "Background help text (placeholder)", ".floating-card-host textarea[placeholder], .floating-card-host input[placeholder]");
await probe("New Resource card", "Dropdown, empty (Select)", ".floating-card-host .option-picker-trigger");
await probe("New Resource card", "Capacity or total message", "[class*=capacity], [class*=total], [class*=alarm]");
await browser.close();
writeFileSync(out, JSON.stringify({ records }));
console.log(records.length + " probes -> " + out);
for (const r of records) console.log((r.count ? "  " : "  (none) ") + r.where + " / " + r.name + ": " + r.count);
