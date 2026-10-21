/**
 * Measures the text of every page of the four Foundation systems (Identity, Brand, Business, Strategy) and the
 * parts that were not measured before: the main Back, the dividers, the messages, the page tag, the side panel.
 * For every visible element that holds its own text: its size, weight and style, grouped by class, with the
 * pages it was found on. Presses only the page buttons of the navigation, never a card.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/measure-probe.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "catalogue/measures/measure-quillfield-1920.json");
const org = JSON.parse(readFileSync(new URL("../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const wait = ms => page.waitForTimeout(ms);
const texts = [];
const parts = [];

async function open(system) {
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
}

/** Runs in the page: every element with its own text. */
function collect() {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const hit = [];
    for (const el of document.querySelectorAll("body *")) {
        if (["SCRIPT", "STYLE", "OPTION", "SVG", "PATH"].includes(el.tagName.toUpperCase())) continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
        const holder = el.matches("input, textarea");
        const placeholder = holder ? el.getAttribute("placeholder") || "" : "";
        if (!own && !(holder && (el.value || placeholder))) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        hit.push({
            tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2).join("."), text: (own || el.value || placeholder).slice(0, 40),
            size: px(s.fontSize), weight: s.fontWeight, italic: s.fontStyle === "italic", transform: s.textTransform, underline: s.textDecorationLine.includes("underline"),
            lineHeight: s.lineHeight, holder
        });
    }
    return hit;
}

async function textsOf(where) { for (const t of await page.evaluate(collect)) texts.push({ where, ...t }); }

const SYSTEMS = ["Identity System", "Brand System", "Business System", "Strategy System"];
for (const system of SYSTEMS) {
    await open(system);
    await textsOf(system + " / start");
    const names = await page.getByRole("navigation", { name: "Pages" }).getByRole("button").evaluateAll(list => list.map(b => b.textContent.trim()));
    for (const name of [...new Set(names)]) {
        try {
            await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name }).first().evaluate(n => n.click());
            await wait(800);
            await textsOf(system + " / " + name);
        } catch (error) { console.log("skipped " + system + " / " + name); }
    }
}

// The parts that were not measured
function measure(selector) {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const els = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0);
    return {
        count: els.length,
        items: els.slice(0, 4).map(el => {
            const r = el.getBoundingClientRect(), s = getComputedStyle(el);
            return { tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 50), w: px(r.width), h: px(r.height), size: px(s.fontSize), weight: s.fontWeight, transform: s.textTransform, letterSpacing: s.letterSpacing, radius: s.borderTopLeftRadius, border: px(s.borderTopWidth) + " " + s.borderTopStyle, fill: s.backgroundColor, colour: s.color, padding: s.paddingTop + " " + s.paddingLeft };
        })
    };
}
async function probe(where, name, selector) {
    try { parts.push({ where, name, selector, ...(await page.evaluate(measure, selector)) }); }
    catch (error) { parts.push({ where, name, selector, count: 0, error: String(error).slice(0, 80) }); }
}
await open("Business System");
await probe("Business", "Main Back (footer)", ".back-link");
await probe("Business", "Page tag", ".page-rail, [class*=page-tag], [class*=rail]");
await probe("Business", "Dividers", ".answer-columns-divider, hr, [class*=divider]");
await probe("Business", "Messages", "[class*=missing-note], [class*=message], [class*=alert], [class*=verification], [class*=total]");
await probe("Business", "Side panel handles", "[class*=side-panel] button, [class*=drawer] button, [class*=handle]");
await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: /Financial Foundation/ }).first().evaluate(n => n.click());
await wait(800);
await probe("Financial Foundation", "Messages", "[class*=missing-note], [class*=message], [class*=alert], [class*=verification], [class*=total]");
await probe("Financial Foundation", "Dividers", ".answer-columns-divider, hr, [class*=divider]");
await browser.close();
writeFileSync(out, JSON.stringify({ texts, parts }));
console.log(texts.length + " texts, " + parts.length + " parts -> " + out);
