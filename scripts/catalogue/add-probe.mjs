/**
 * The add probe: goes to every "+" that adds a card in the Foundation pages,
 * presses it in a fresh copy of the example organisation, and records the new
 * card: its fields (kind of control and label, in order) and, for each dropdown
 * of the card, the fields after each choice. Output: a JSON file with one
 * record per card and choice. It types nothing; it only presses the "+" and
 * chooses from dropdowns, in the browser's own copy of the example organisation
 * (the project's files are not touched).
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/add-probe.mjs [--out FILE] [--systems Business] [--pages Infrastructure] [--only "Add Resource"] [--theme light]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "add-probe.json");
const theme = arg("theme", "light");
const systemFilter = arg("systems", "").split(",").filter(Boolean);
const pageFilter = arg("pages", "").split(",").filter(Boolean);
const only = arg("only", "");
const PAGES = [
    ["Identity System", ["^1\\. Definition", "^2\\. Organization"]],
    ["Brand System", ["Brand System"]],
    ["Business System", ["^1\\. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"]],
    ["Strategy System", ["Strategy System"]]
];
const PLUS = ".plus-box, .strategy-add-button, .business-add-button";
const OPTION = "[role=option], .option-picker-option";

const org = JSON.parse(readFileSync(new URL("../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];
/** One "+" per kind of card: a label already pressed in this system is not pressed again on another page. */
const done = new Set();
const problems = [];

async function seed() {
    await page.goto(base + "/");
    await page.evaluate(([o, t]) => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", t);
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, [org, theme]);
}

async function openPage(system, name) {
    await seed();
    await page.goto(base + "/assistant");
    await page.waitForTimeout(600);
    await page.getByText("Foundation", { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(800);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await page.waitForTimeout(600); }
    const target = page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first();
    if (!(await target.count())) return false;
    await target.evaluate(node => node.click());
    await page.waitForTimeout(800);
    return true;
}

const pluses = () => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(b => b.getBoundingClientRect().width > 0)
    .map(b => b.getAttribute("aria-label") || b.textContent.trim()), PLUS);

/** Runs in the page: the open card's fields in order, as "kind:label". */
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
        if (el.matches(".plus-box, .strategy-add-button, .business-add-button")) return "plus";
        if (el.matches(".info-note-button")) return "info";
        if (el.matches("a, button[class*=link]")) return "link";
        return "button";
    };
    const sel = "input, textarea, .option-picker-trigger, .date-cell, .month-picker-trigger, .strategy-box-remove, .card-remove, .profile-card-remove, .legal-entity-field-remove, .plus-box, .strategy-add-button, .business-add-button, .info-note-button, a, button[class*=link]";
    const fields = [];
    const seen = new Set();
    for (const el of root.querySelectorAll(sel)) {
        if (el.getBoundingClientRect().width === 0 || seen.has(el)) continue;
        seen.add(el);
        const row = el.closest(".field-row, .interview-field, [class*=field]") || el.parentElement;
        const label = (row.querySelector(".field-label")?.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 40);
        fields.push(kindOf(el) + ":" + label);
    }
    const box = root.getBoundingClientRect();
    return { cls: host.className.replace("floating-card-host ", ""), width: Math.round(box.width), height: Math.round(box.height), fields };
}

async function optionsOf(index) {
    await page.locator(".floating-card-host .option-picker-trigger").nth(index).evaluate(node => node.click());
    await page.waitForTimeout(200);
    const options = await page.evaluate(sel => [...document.querySelectorAll(sel)].map(o => o.textContent.trim().slice(0, 60)), OPTION);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    return options;
}

for (const [system, names] of PAGES) {
    if (systemFilter.length && !systemFilter.some(name => system.includes(name))) continue;
    for (const name of names) {
        if (pageFilter.length && !pageFilter.some(entry => name.includes(entry))) continue;
        const pageName = name.replace(/[\^\\]/g, "");
        if (!(await openPage(system, name))) { problems.push("page not found: " + system + " / " + name); continue; }
        // Per master tile: its title and every button in it (class and name), whatever it opens.
        const tiles = await page.evaluate(() => [...document.querySelectorAll(".conversation-card .section-tile-slot")].map(slot => ({
            chapter: (slot.closest(".business-foundation-card, .conversation-card > section, .answer-column")?.querySelector(".answer-column-label, .field-group-title, h2, h3")?.textContent || "").trim().slice(0, 40),
            tile: (slot.querySelector(".section-tile-title")?.textContent || slot.querySelector("button.section-tile")?.getAttribute("aria-label") || "").trim().slice(0, 50),
            buttons: [...slot.querySelectorAll("button")].map(b => (b.className.split(/\s+/)[0] || "button") + ":" + (b.getAttribute("aria-label") || b.textContent.trim()).slice(0, 50))
        })));
        for (const tile of tiles) records.push({ system, page: pageName, plus: "", choice: "master tile", chapter: tile.chapter, tile: tile.tile, buttons: tile.buttons });
        const labels = [...new Set(await pluses())].filter(label => (!only || label.includes(only)) && !done.has(system + "|" + label));
        labels.forEach(label => done.add(system + "|" + label));
        console.log(system + " / " + pageName + ": " + labels.length + " different + buttons");
        for (const label of labels) {
            if (!(await openPage(system, name))) continue;
            const button = page.locator("[aria-label=" + JSON.stringify(label) + "]").filter({ visible: true }).first();
            if (!(await button.count())) { problems.push("plus gone: " + label); continue; }
            await button.evaluate(node => node.click());
            await page.waitForTimeout(600);
            const card = await page.evaluate(readCard);
            if (!card) { problems.push("no floating card after: " + pageName + " / " + label); records.push({ system, page: pageName, plus: label, choice: "(new)", card: null }); continue; }
            records.push({ system, page: pageName, plus: label, choice: "(new)", card });
            const count = await page.locator(".floating-card-host .option-picker-trigger").count();
            for (let index = 0; index < Math.min(count, 4); index++) {
              try {
                const options = await optionsOf(index);
                records.push({ system, page: pageName, plus: label, choice: "dropdown " + index + " options", options });
                for (const option of options.slice(0, 12)) {
                    await page.locator(".floating-card-host .option-picker-trigger").nth(index).evaluate(node => node.click());
                    await page.waitForTimeout(150);
                    const item = page.locator(OPTION).filter({ hasText: option }).first();
                    if (!(await item.count())) continue;
                    await item.evaluate(node => node.click());
                    await page.waitForTimeout(350);
                    records.push({ system, page: pageName, plus: label, choice: "dropdown " + index + " = " + option, card: await page.evaluate(readCard) });
                }
              } catch (error) {
                problems.push("dropdown " + index + " of " + pageName + " / " + label + ": " + String(error).slice(0, 100));
                await page.keyboard.press("Escape");
              }
            }
            console.log("  " + label + ": " + records.filter(r => r.plus === label && r.page === pageName).length + " records");
        }
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ theme, records, problems }));
console.log(records.length + " records, " + problems.length + " problems -> " + out);
problems.slice(0, 20).forEach(p => console.log("  PROBLEM " + p));
