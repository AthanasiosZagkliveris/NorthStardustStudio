/**
 * Help texts: every "i" note (the small round button whose panel says what a label means) in the four Foundation systems and Global Settings,
 * as the running app draws them with the example organization: where it stands, its label, the lines its panel fills at 1920px and its characters.
 * Walks as text-holders.mjs does (every page, every master tile, the first two nested tiles of each view).
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/help-texts.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "tools/catalogue/measures/help-texts.json");
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

/** In the page: press each "i" button one at a time and read its panel. */
async function collectHelp() {
    const buttons = page.locator(".info-note-button");
    const total = await buttons.count();
    const rows = [];
    for (let i = 0; i < total; i++) {
        try {
            const button = buttons.nth(i);
            const label = ((await button.getAttribute("aria-label")) || "").replace(/: what this means$/, "");
            const place = await button.evaluate(node => node.closest(".floating-card-host, .floating-overlay") ? "floating card" : node.closest("[role=dialog], .section-tile-overlay") ? "tile dialog" : node.closest(".notepad-panel") ? "notes panel" : node.closest(".settings-page") ? "settings page" : "page");
            await button.evaluate(node => node.click());
            await wait(150);
            const panel = page.locator(".info-note-panel").last();
            const info = await panel.evaluate(node => {
                const lh = parseFloat(getComputedStyle(node).lineHeight) || parseFloat(getComputedStyle(node).fontSize) * 1.4;
                const items = [...node.querySelectorAll("li, p")];
                const text = node.innerText.trim();
                return { text, lines: Math.max(1, Math.round(node.scrollHeight / lh)), points: items.length || 1, w: Math.round(node.getBoundingClientRect().width) };
            });
            rows.push({ label, place, ...info, chars: info.text.length });
            await page.keyboard.press("Escape");
            await wait(80);
        } catch (error) { /* a button hidden behind another layer */ }
    }
    return rows;
}
async function record(where) {
    try {
        for (const row of await collectHelp()) {
            const key = [row.label, row.place, row.text.slice(0, 60)].join("|");
            if (!found.has(key)) found.set(key, { ...row, scenes: [where] });
            else found.get(key).scenes.push(where);
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

// Global Settings
await attempt("settings", async () => {
    await reset();
    await page.goto(base + "/settings");
    await wait(1200);
    await record("Global Settings");
});
await browser.close();
const rows = [...found.values()].sort((a, b) => a.scenes[0].localeCompare(b.scenes[0]));
writeFileSync(out, JSON.stringify({ rows }, null, 1));
console.log(rows.length + " help texts -> " + out);
