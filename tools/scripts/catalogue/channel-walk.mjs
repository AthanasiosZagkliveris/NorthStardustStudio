/**
 * The channel walk: every card behind the tiles of Business > Customer Engagement
 * (the channel cards and sub channel cards, the relationship cards, the customer
 * source and the channel expenses). It presses each master tile's links, reads
 * the floating card that opens (its fields in order, size and head), closes it
 * by a press outside it, and goes on. The page is opened again when a view is
 * lost. Presses only tiles and links.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/channel-walk.mjs [--out FILE] [--page "Customer Engagement"] [--system "Business System"]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "channel-walk.json");
const systemName = arg("system", "Business System");
const pageName = arg("page", "Customer Engagement");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];
const problems = [];

async function openPage() {
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
    await page.locator("li.system-item", { hasText: systemName }).press("Enter");
    await page.waitForTimeout(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await page.waitForTimeout(600); }
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(pageName) }).first().evaluate(n => n.click());
    await page.waitForTimeout(900);
    for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
        try { await button.click({ timeout: 300 }); } catch { /* gone */ }
    }
    await page.waitForTimeout(300);
}

const LAYER = ".section-tile-overlay:not(.floating-overlay)";

/** The master tiles of the page (by their titles) and the tiles inside the open dialog view. */
const masterTiles = () => page.evaluate(() => [...document.querySelectorAll(".conversation-card .section-tile-slot")].map(slot => (slot.querySelector(".section-tile-title")?.textContent || "").trim().slice(0, 40)));
const dialogTiles = () => page.evaluate(layerSel => {
    const layer = [...document.querySelectorAll(layerSel)].pop();
    return layer ? [...layer.querySelectorAll(".section-tile-slot")].map(slot => (slot.querySelector(".section-tile-title")?.textContent || "").trim().slice(0, 40)) : [];
}, LAYER);
const pressIn = (scope, title) => page.evaluate(([layerSel, where, wanted]) => {
    const root = where === "page" ? document.querySelector(".conversation-card") : [...document.querySelectorAll(layerSel)].pop();
    for (const slot of root ? root.querySelectorAll(".section-tile-slot") : []) {
        if ((slot.querySelector(".section-tile-title")?.textContent || "").trim().slice(0, 40) === wanted) { slot.querySelector("button.section-tile")?.click(); return true; }
    }
    return false;
}, [LAYER, scope, title]);

/** Runs in the page: the open floating card, its fields in order, its size, its head. */
function readCard() {
    const host = document.querySelector(".floating-card-host");
    const root = host ? host.querySelector(".floating-card-body > *") : null;
    if (!root) return null;
    const kindOf = el => {
        if (el.matches("input[type=checkbox]")) return "tick box";
        if (el.matches("textarea")) return "text area";
        if (el.matches(".option-picker-trigger")) return "dropdown";
        if (el.matches(".date-cell, input[type=date], .month-picker-trigger")) return "date cell";
        if (el.matches("input[inputmode], input[type=number]")) return "number box";
        if (el.matches("input")) return "text box";
        if (el.matches(".strategy-box-remove, .card-remove, .profile-card-remove, .legal-entity-field-remove")) return "x";
        if (el.matches(".plus-box, .business-add-button, .strategy-add-button")) return "plus";
        if (el.matches(".info-note-button")) return "info";
        return "link";
    };
    const sel = "input, textarea, .option-picker-trigger, .date-cell, .month-picker-trigger, .strategy-box-remove, .card-remove, .profile-card-remove, .legal-entity-field-remove, .plus-box, .business-add-button, .strategy-add-button, .info-note-button, a, button[class*=link]";
    const fields = [];
    for (const el of root.querySelectorAll(sel)) {
        if (el.getBoundingClientRect().width === 0) continue;
        const row = el.closest(".field-row, .interview-field, [class*=field]") || el.parentElement;
        fields.push(kindOf(el) + ":" + (row.querySelector(".field-label")?.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 40));
    }
    const box = root.getBoundingClientRect();
    return { cls: host.className.replace("floating-card-host ", ""), width: Math.round(box.width), height: Math.round(box.height), fields, head: (root.innerText || "").trim().split("\n")[0].slice(0, 50) };
}

await openPage();
const masters = await masterTiles();
console.log(masters.length + " master tiles on " + pageName);
for (const master of masters) {
    try {
        if (!(await pressIn("page", master))) { problems.push("tile not found: " + master); continue; }
        await page.waitForTimeout(700);
        if (await page.evaluate(() => document.querySelectorAll(".floating-card-host").length)) {
            const direct = await page.evaluate(readCard);
            records.push({ system: systemName, page: pageName, path: master, plus: master, choice: "(new)", opened: "floating card", card: direct });
            await page.mouse.click(6, 500);
            await page.waitForTimeout(350);
            continue;
        }
        const subs = await dialogTiles();
        records.push({ system: systemName, page: pageName, path: master, plus: master, choice: "(new)", opened: "dialog view", card: null, subTiles: subs.length });
        for (const sub of subs) {
            if (!(await pressIn("dialog", sub))) { problems.push("sub tile not found: " + master + " > " + sub); continue; }
            await page.waitForTimeout(700);
            const card = await page.evaluate(readCard);
            records.push({ system: systemName, page: pageName, path: master + " > " + sub, plus: master + " > " + sub, choice: "(new)", opened: card ? "floating card" : "dialog view", card });
            if (card) { await page.mouse.click(6, 500); await page.waitForTimeout(350); }
            else { await page.keyboard.press("Escape"); await page.waitForTimeout(350); }
        }
        // Back to the page.
        for (let step = 0; step < 3 && (await page.locator(LAYER).count()); step++) {
            const back = page.locator(LAYER + " .carousel-rail-back, " + LAYER + " .section-tile-back").first();
            if (await back.count()) await back.evaluate(node => node.click()); else await page.keyboard.press("Escape");
            await page.waitForTimeout(400);
        }
        if (await page.locator(LAYER).count()) { problems.push("lost the view after " + master); await openPage(); }
    } catch (error) {
        problems.push(master + ": " + String(error).slice(0, 80));
        await openPage();
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ records, problems }));
console.log(records.length + " records, " + problems.length + " problems -> " + out);
problems.slice(0, 20).forEach(p => console.log("  PROBLEM " + p));
