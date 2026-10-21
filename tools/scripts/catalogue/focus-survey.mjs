/**
 * Focus survey: every text holder is focused, and what it draws while active is read (border, ring, outline), so that every holder can be seen to show the same
 * effect. Walks as app-crawl.mjs does.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/focus-survey.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "tools/catalogue/measures/focus-survey.json");
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

/** In the page: focus each text holder and read what it draws (border, shadow, outline) while it is active. */
function collect() {
    const rows = [];
    for (const el of document.querySelectorAll("textarea, input")) {
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute("type") || "text";
        if (tag === "input" && type !== "text" && type !== "search" && type !== "number") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const rest = getComputedStyle(el);
        if (rest.visibility === "hidden" || rest.display === "none" || el.disabled || el.readOnly) continue;
        const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean);
        el.focus({ preventScroll: true });
        const s = getComputedStyle(el);
        const ring = (s.boxShadow.match(/0px 0px 0px 3px[^,]*/) ?? [""])[0];
        rows.push({
            tag, cls: cls.slice(0, 3).join("."), aria: (el.getAttribute("aria-label") || "").slice(0, 40),
            border: s.borderTopWidth + " " + s.borderTopColor, ring: ring ? "ring3" : (s.boxShadow === "none" ? "none" : "other: " + s.boxShadow.slice(0, 60)), outline: s.outlineStyle === "none" ? "none" : s.outlineWidth + " " + s.outlineStyle,
            where: el.closest(".notepad-panel") ? "notes panel" : el.closest(".settings-page") ? "settings page" : el.closest(".floating-card-host, .floating-overlay") ? "floating card" : el.closest("[role=dialog], .section-tile-overlay") ? "tile dialog" : "page"
        });
        el.blur();
    }
    return rows;
}
async function record(where) {
    try {
        await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
        for (const row of await page.evaluate(collect)) {
            const key = [row.tag, row.aria, row.cls, row.where].join("|");
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
console.log(rows.length + " focus rows -> " + out);
