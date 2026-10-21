/**
 * Text links: every element drawn as a link in text (underlined, an <a>, or named a link) in the four Foundation systems, Global Settings and the Notes
 * panel, with its colour, weight, size and where it is. Walks as app-crawl.mjs does.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/link-survey.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "tools/catalogue/measures/link-survey.json");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
page.setDefaultTimeout(6000);
const wait = ms => page.waitForTimeout(ms);
const found = new Map();

async function reset() {
    await page.goto(base + "/");
    await page.evaluate(o => { localStorage.clear(); localStorage.setItem("northstardust-theme", "light"); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, org);
}
async function open(system, name) {
    await reset();
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

/** In the page: each element drawn as a link in text. */
function collect() {
    const px = v => Math.round(parseFloat(v) * 10) / 10;
    const rows = [];
    for (const el of document.querySelectorAll("a, button, [role=link], span, strong, p, li, div")) {
        if (el.children.length > 3) continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("").trim().replace(/\s+/g, " ");
        const text = (own || el.textContent || "").trim().replace(/\s+/g, " ");
        if (!text || text.length > 90) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean);
        const underlined = s.textDecorationLine.includes("underline");
        const named = cls.some(name => /(^|-)link(-|$)/.test(name)) && !/link-symbol|link-layer|links-layer|links-list|-links$/.test(cls.join(" "));
        const anchor = el.tagName === "A";
        if (!(underlined || named || anchor)) continue;
        if (el.closest(".section-tile-slot, .app-header, .rail, nav, .bullet-rail")) continue;
        rows.push({
            tag: el.tagName.toLowerCase(), cls: cls.slice(0, 3).join("."), text: text.slice(0, 60), colour: s.color, weight: s.fontWeight, size: px(s.fontSize), underlined, spacing: s.letterSpacing,
            where: el.closest(".floating-card-host, .floating-overlay") ? "floating card" : el.closest("[role=dialog], .section-tile-overlay") ? "tile dialog" : el.closest(".notepad-panel") ? "notes panel" : el.closest(".settings-page") ? "settings page" : "page"
        });
    }
    return rows;
}
async function record(where) {
    try {
        for (const row of await page.evaluate(collect)) {
            const key = [row.tag, row.cls, row.text, row.where].join("|");
            if (!found.has(key)) found.set(key, { ...row, scenes: [where] });
            else {
                const old = found.get(key);
                old.scenes.push(where);
            }
        }
    } catch (error) { console.log("record failed " + where + ": " + String(error).slice(0, 80)); }
}
const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("skipped " + name + ": " + String(error).slice(0, 90)); } };

const PAGES = { "Identity System": ["1. Definition", "2. Organization"], "Brand System": [null], "Business System": ["1. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"], "Strategy System": [null] };
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

// Global Settings and the Notes panel (with the calendar's notes)
await attempt("settings", async () => {
    await reset();
    await page.goto(base + "/settings");
    await wait(1200);
    await record("Global Settings");
});
await attempt("notes", async () => {
    await open("Identity System", null);
    await page.getByRole("button", { name: /^Notes/i }).first().evaluate(n => n.click());
    await wait(700);
    await record("Notes panel");
    const add = page.getByRole("button", { name: /add note|new note|\+/i }).first();
    if (await add.count()) { await add.evaluate(n => n.click()); await wait(500); await record("Notes panel / a new note"); }
    const calendar = page.getByRole("button", { name: /calendar/i }).first();
    if (await calendar.count()) { await calendar.evaluate(n => n.click()); await wait(700); await record("Notes panel / calendar"); }
});
await browser.close();
const rows = [...found.values()].sort((a, b) => a.scenes[0].localeCompare(b.scenes[0]));
writeFileSync(out, JSON.stringify({ rows }, null, 1));
console.log(rows.length + " text links -> " + out);
