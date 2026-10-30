/**
 * The check of the rule "connected components align as one" (docs/ai/layout-rules.md, section 5): in every opened card of
 * the four Foundation systems, any two controls side by side in one row (their vertical ranges overlap, the gap between
 * them is at most 40px) share one centre line (within 1px), and two of the same height share one top.
 * Opens every master tile and the first two cards of each view, like app-crawl.mjs; presses only tiles.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/align-check.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
page.setDefaultTimeout(6000);
const wait = ms => page.waitForTimeout(ms);
const findings = [];
let scenes = 0;

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

/** In the page: the controls of the open view or card, and the pairs side by side that break the rule. */
function check() {
    const px = v => Math.round(v * 10) / 10;
    const root = document.querySelector(".floating-card-host, .section-tile-overlay") ?? document.body;
    const sel = "input:not([type=hidden]):not([type=file]), select, textarea, button, .option-picker-trigger";
    const items = [...root.querySelectorAll(sel)].map(el => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ el, r }) => r.width >= 8 && r.height >= 8 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[aria-hidden=true]") && !/section-tile$|section-tile |bullet-rail|page-arrow|header-tool|back-link/.test(el.className.toString()));
    const label = el => (el.className.toString().split(" ")[0] || el.tagName.toLowerCase()) + (el.getAttribute("aria-label") ? " (" + el.getAttribute("aria-label").slice(0, 24) + ")" : "");
    const bad = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i].r, b = items[j].r;
        if (items[i].el.contains(items[j].el) || items[j].el.contains(items[i].el)) continue;
        const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (overlap < Math.min(a.height, b.height) * 0.5) continue;
        const gap = Math.max(a.left, b.left) - Math.min(a.right, b.right);
        if (gap < -1 || gap > 40) continue;
        const midA = a.top + a.height / 2, midB = b.top + b.height / 2;
        if (Math.abs(midA - midB) > 1) bad.push({ kind: "centre", a: label(items[i].el), b: label(items[j].el), diff: px(Math.abs(midA - midB)), heights: px(a.height) + " / " + px(b.height) });
        else if (Math.abs(a.height - b.height) < 0.6 && Math.abs(a.top - b.top) > 1) bad.push({ kind: "top", a: label(items[i].el), b: label(items[j].el), diff: px(Math.abs(a.top - b.top)), heights: px(a.height) + " / " + px(b.height) });
    }
    return bad;
}
async function scan(where) { scenes++; try { for (const f of await page.evaluate(check)) findings.push({ where, ...f }); } catch (error) { console.log("skipped " + where + ": " + String(error).slice(0, 60)); } }
const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("skipped " + name + ": " + String(error).slice(0, 80)); } };

const PAGES = { "Identity System": ["1. Definition", "2. Legal Entity"], "Brand System": [null], "Business System": ["1. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"], "Strategy System": [null] };
for (const [system, pages] of Object.entries(PAGES)) for (const name of pages) {
    const where = system + " / " + (name ?? "main");
    await attempt(where, async () => {
        await open(system, name);
        const count = await page.locator(".section-tile-slot button.section-tile").count();
        for (let i = 0; i < count; i++) await attempt(where + " tile " + i, async () => {
            await open(system, name);
            const tile = page.locator(".section-tile-slot button.section-tile").nth(i);
            const title = (await tile.textContent() ?? "").trim().replace(/\s+/g, " ").slice(0, 28);
            await tile.evaluate(n => n.click());
            await wait(900);
            await scan(where + " / " + title);
            const nested = page.locator(".section-tile-overlay:not(.floating-overlay) button.section-tile");
            const nn = Math.min(await nested.count(), 2);
            for (let j = 0; j < nn; j++) await attempt(where + " nested " + j, async () => {
                if (j > 0) { await open(system, name); await page.locator(".section-tile-slot button.section-tile").nth(i).evaluate(n => n.click()); await wait(900); }
                await nested.nth(j).evaluate(n => n.click());
                await wait(900);
                await scan(where + " / " + title + " / card " + (j + 1));
            });
        });
    });
}
await browser.close();
const groups = new Map();
for (const f of findings) { const k = f.kind + " | " + [f.a, f.b].sort().join(" + ") + " | " + f.heights + " | " + f.diff + "px"; (groups.get(k) ?? groups.set(k, new Set()).get(k)).add(f.where); }
console.log(scenes + " views checked, " + findings.length + " pairs break the rule, " + groups.size + " different pairs");
for (const [k, w] of [...groups].sort((a, b) => b[1].size - a[1].size)) console.log(w.size + " views | " + k + " | e.g. " + [...w][0]);
if (out) writeFileSync(out, JSON.stringify({ findings }));
