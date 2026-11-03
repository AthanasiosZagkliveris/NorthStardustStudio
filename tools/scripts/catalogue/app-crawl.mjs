/**
 * Walks the running app: every page of the four Foundation systems, every master tile opened, and the first nested tiles
 * of each opened view (their cards), and records every control that can be pressed or filled, and the words beside a number.
 * Presses only tiles; never a plus, a delete or a card's content.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/app-crawl.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "tools/catalogue/measures/crawl-quillfield-1920.json");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
page.setDefaultTimeout(6000);
const wait = ms => page.waitForTimeout(ms);
const scenes = [];

async function open(system, name) {
    await page.goto(base + "/");
    await page.evaluate(o => { localStorage.clear(); localStorage.setItem("northstardust-theme", "light"); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, org);
    await page.goto(base + "/assistant");
    await wait(600);
    await page.getByText("Foundation", { exact: true }).first().click();
    await wait(200);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await wait(800);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await wait(500); }
    if (name) { await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click()); await wait(800); }
}

/** In the page: every control, and the words beside numbers. */
function collect() {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const items = [];
    for (const el of document.querySelectorAll("button, [role=button], [role=option], a, select, input, textarea")) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        const text = (el.textContent || "").trim().replace(/\s+/g, " ");
        items.push({
            tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", cls: (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 3).join("."),
            text: (text || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").slice(0, 48), aria: (el.getAttribute("aria-label") || "").slice(0, 48),
            w: px(r.width), h: px(r.height), size: px(s.fontSize), weight: s.fontWeight, caps: s.textTransform === "uppercase", radius: s.borderTopLeftRadius, border: px(s.borderTopWidth) + " " + s.borderTopStyle,
            inDialog: !!el.closest("[role=dialog], .floating-card-host, .section-tile-overlay, .floating-overlay")
        });
    }
    const units = [];
    for (const el of document.querySelectorAll("span, div, label, small")) {
        if (el.children.length) continue;
        const own = el.textContent.trim();
        if (!/^(px|%|years?|months?|hours?|hrs?|days?|weeks?|USD|GBP|EUR|\$|£|€|\/ ?month|per [a-z]+)$/i.test(own)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1) continue;
        const s = getComputedStyle(el);
        units.push({ text: own, cls: (el.getAttribute("class") || "").slice(0, 40), size: px(s.fontSize), weight: s.fontWeight, colour: s.color, prev: el.previousElementSibling ? el.previousElementSibling.tagName.toLowerCase() : "" });
    }
    return { items, units };
}
async function record(where) { try { scenes.push({ where, ...(await page.evaluate(collect)) }); } catch (error) { scenes.push({ where, items: [], units: [], error: String(error).slice(0, 80) }); } }
const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("skipped " + name + ": " + String(error).slice(0, 90)); } };

const PAGES = { "Identity System": ["1. Definition", "2. Legal Entity"], "Brand System": [null], "Business System": ["1. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"], "Strategy System": [null] };
for (const [system, pages] of Object.entries(PAGES)) {
    for (const name of pages) {
        const where = system + " / " + (name ?? "main");
        await attempt(where, async () => {
            await open(system, name);
            await record(where + " / page");
            const count = await page.locator(".section-tile-slot button.section-tile").count();
            for (let i = 0; i < count; i++) {
                await attempt(where + " tile " + i, async () => {
                    await open(system, name);
                    const tile = page.locator(".section-tile-slot button.section-tile").nth(i);
                    const title = (await tile.textContent() ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
                    await tile.evaluate(n => n.click());
                    await wait(900);
                    await record(where + " / tile " + title);
                    const nested = page.locator(".section-tile-overlay:not(.floating-overlay) button.section-tile");
                    const nn = Math.min(await nested.count(), 2);
                    for (let j = 0; j < nn; j++) {
                        await attempt(where + " nested " + j, async () => {
                            if (j > 0) { await open(system, name); await page.locator(".section-tile-slot button.section-tile").nth(i).evaluate(n => n.click()); await wait(900); }
                            await nested.nth(j).evaluate(n => n.click());
                            await wait(900);
                            await record(where + " / tile " + title + " / card " + (j + 1));
                        });
                    }
                });
            }
        });
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ scenes }));
console.log(scenes.length + " scenes -> " + out);
