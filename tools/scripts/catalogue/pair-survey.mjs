/**
 * Pairing survey (rules 6-8 of docs/ai/layout-rules.md): opens every page of the four Foundation systems, every tile and
 * every nested tile/card (to a depth of 2), and records each field whose label is above its holder (label, holder kind,
 * size, shape, and the labels of the fields on its row), plus every label that names an amount, a frequency or hours.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/pair-survey.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "tools/catalogue/measures/pair-survey.json");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/lumen-and-loom-studio.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
page.setDefaultTimeout(6000);
const wait = ms => page.waitForTimeout(ms);
const scenes = [];

async function open(system, name) {
    await page.goto(base + "/");
    await page.evaluate(o => { localStorage.clear(); localStorage.setItem("northstardust-theme", "sepia"); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, org);
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

function collect() {
    const px = v => Math.round(parseFloat(v) * 10) / 10;
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.display !== "none"; };
    const holderOf = el => {
        const h = el.querySelector("input, textarea, select, button.option-picker, [role=combobox], button[aria-haspopup], .option-picker, button:not(.info-button)");
        return h;
    };
    const fields = [];
    for (const el of document.querySelectorAll(".business-foundation-field")) {
        if (!vis(el)) continue;
        const labelEl = el.querySelector(".business-foundation-label-info, .business-foundation-label, label");
        const label = (labelEl ? labelEl.textContent : "").trim().replace(/\s+/g, " ");
        const h = holderOf(el);
        const r = el.getBoundingClientRect();
        const lr = labelEl ? labelEl.getBoundingClientRect() : null;
        const hr = h ? h.getBoundingClientRect() : null;
        const hs = h ? getComputedStyle(h) : null;
        fields.push({
            label, mode: el.className.includes("inline") ? "inline" : el.className.includes("side") ? "side" : "above",
            top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width),
            labelAbove: !!(lr && hr && lr.bottom <= hr.top + 2),
            holder: h ? (h.tagName.toLowerCase() + "." + (h.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2).join(".")) : "",
            hw: hr ? Math.round(hr.width * 10) / 10 : 0, hh: hr ? Math.round(hr.height * 10) / 10 : 0,
            radius: hs ? hs.borderTopLeftRadius : "", font: hs ? px(hs.fontSize) + "/" + hs.fontWeight : "", inDialog: !!el.closest("[role=dialog], .floating-card-host, .floating-overlay, .section-tile-overlay")
        });
    }
    // any text label that names an amount, a period or hours, wherever it stands (other editors build their own rows)
    const words = [];
    const re = /^(salary|cost|price|expense|amount|frequency|payment frequency|repayment frequency|working hours|delivery hours|qty|quantity|currency|fee|budget)\b/i;
    for (const el of document.querySelectorAll("label, span, div, th, legend, p")) {
        if (el.children.length > 1) continue;
        const t = el.textContent.trim().replace(/\s+/g, " ");
        if (!t || t.length > 40 || !re.test(t) || !vis(el)) continue;
        const r = el.getBoundingClientRect();
        const row = [];
        for (const c of document.querySelectorAll("input, select, button.option-picker, [role=combobox], textarea")) {
            if (!vis(c)) continue;
            const cr = c.getBoundingClientRect();
            if (Math.abs(cr.top - r.bottom) < 16 || Math.abs(cr.top + cr.height / 2 - (r.top + r.height / 2)) < 12) {
                if (cr.left > r.left - 40 && cr.left < r.right + 500 && cr.top >= r.top - 12 && cr.top < r.bottom + 40) row.push(Math.round(cr.left) + "," + Math.round(cr.width) + "x" + Math.round(cr.height));
            }
        }
        words.push({ t, x: Math.round(r.left), y: Math.round(r.top), cls: (el.getAttribute("class") || "").slice(0, 40), below: row.slice(0, 4) });
    }
    const title = (document.querySelector(".floating-card-host [class*=head] input, .floating-overlay input") || {}).value || "";
    return { fields, words, title };
}
async function record(where) { try { scenes.push({ where, ...(await page.evaluate(collect)) }); console.log("scene " + scenes.length + " " + where); writeFileSync(out, JSON.stringify({ scenes })); } catch (error) { scenes.push({ where, error: String(error).slice(0, 80) }); } }
const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("skipped " + name + ": " + String(error).slice(0, 90)); } };

const PAGES = { "Identity System": ["1. Definition", "2. Organization"], "Brand System": [null], "Business System": ["1. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"], "Strategy System": [null] };
const MAX_DEPTH = 2;
const SEL = "button.section-tile";

/** Replay a path of tile indices from the page, returning after the last is open. */
async function replay(system, name, path) {
    await open(system, name);
    for (let d = 0; d < path.length; d++) {
        const sel = d === 0 ? ".section-tile-slot " + SEL : ".section-tile-overlay:not(.floating-overlay) " + SEL;
        await page.locator(sel).nth(path[d]).evaluate(n => n.click());
        await wait(700);
    }
}
async function walk(system, name, path, where) {
    await replay(system, name, path);
    await record(where);
    if (path.length >= MAX_DEPTH) return;
    const sel = path.length === 0 ? ".section-tile-slot " + SEL : ".section-tile-overlay:not(.floating-overlay) " + SEL;
    const count = Math.min(await page.locator(sel).count(), 12);
    for (let i = 0; i < count; i++) {
        await attempt(where + " > " + i, async () => {
            await walk(system, name, [...path, i], where + " > " + i);
        });
    }
}
for (const [system, pages] of Object.entries(PAGES)) {
    for (const name of pages) {
        const where = system + " / " + (name ?? "main");
        await attempt(where, async () => walk(system, name, [], where));
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ scenes }));
console.log(scenes.length + " scenes -> " + out);
