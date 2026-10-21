/**
 * The dialog plus probe: the "+" buttons inside the tile dialogs (the add probe
 * only reaches the ones on the page itself). For each page it opens every card
 * (Expand all), walks the tiles into their dialog views, lists the "+" buttons
 * of each view, then, in a fresh copy of the example organisation, goes back to
 * the view and presses one "+" per kind (a name already pressed in the system is
 * skipped). It records what changed: the tiles of the view before and after, the
 * floating card that opened (its fields, in order) and the dialog's own change.
 * Types nothing; chooses nothing.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/dialog-plus.mjs [--out FILE] [--systems Identity] [--pages Organization] [--theme light]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "dialog-plus.json");
const theme = arg("theme", "light");
const systemFilter = arg("systems", "").split(",").filter(Boolean);
const pageFilter = arg("pages", "").split(",").filter(Boolean);
const PAGES = [
    ["Identity System", ["^1\\. Definition", "^2\\. Organization"]],
    ["Brand System", ["Brand System"]],
    ["Business System", ["^1\\. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"]],
    ["Strategy System", ["Strategy System"]]
];
const PLUS = ".plus-box, .strategy-add-button, .business-add-button";
const LAYER = ".section-tile-overlay:not(.floating-overlay)";

const org = JSON.parse(readFileSync(new URL("../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];
const problems = [];
const done = new Set();

async function openPage(system, name) {
    await page.goto(base + "/");
    await page.evaluate(([o, t]) => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", t);
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, [org, theme]);
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
    // Every card of the page open.
    for (let round = 0; round < 2; round++) {
        for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
            try { await button.click({ timeout: 300 }); } catch { /* gone as another opened */ }
        }
        await page.waitForTimeout(200);
    }
    return true;
}

/** In the top layer: its tiles (titles), its "+" buttons (names) and a signature. */
const view = () => page.evaluate(([layerSel, plusSel]) => {
    const layer = [...document.querySelectorAll(layerSel)].pop();
    const root = layer ?? document.querySelector(".conversation-card") ?? document.body;
    const visible = el => el.getBoundingClientRect().width > 0;
    return {
        inDialog: Boolean(layer),
        tiles: [...root.querySelectorAll(".section-tile-slot")].map(slot => (slot.querySelector(".section-tile-title")?.textContent || slot.querySelector("button.section-tile")?.getAttribute("aria-label") || "").trim().slice(0, 40)),
        links: [...root.querySelectorAll(".section-tile-slot")].flatMap(slot => [...slot.querySelectorAll("button.section-tile-link")].map(link => (slot.querySelector(".section-tile-title")?.textContent || "").trim().slice(0, 40) + "" + (link.textContent || "").trim().slice(0, 30))),
        pluses: [...root.querySelectorAll(plusSel)].filter(visible).map(b => b.getAttribute("aria-label") || b.textContent.trim()),
        floating: document.querySelectorAll(".floating-card-host").length,
        cards: root.querySelectorAll(".card-name-input, .fold-card-head").length,
        sig: document.querySelectorAll(layerSel).length + "|" + (layer ? layer.innerText.replace(/\s+/g, " ").slice(0, 140) : "page")
    };
}, [LAYER, PLUS]);

/** Press the tile with this title in the top layer. */
const pressTile = title => page.evaluate(([layerSel, wanted]) => {
    const layer = [...document.querySelectorAll(layerSel)].pop();
    const root = layer ?? document.querySelector(".conversation-card") ?? document.body;
    const [master, link] = wanted.split("");
    for (const slot of root.querySelectorAll(".section-tile-slot")) {
        const name = (slot.querySelector(".section-tile-title")?.textContent || slot.querySelector("button.section-tile")?.getAttribute("aria-label") || "").trim().slice(0, 40);
        if (name !== master) continue;
        if (!link) { slot.querySelector("button.section-tile")?.click(); return true; }
        for (const button of slot.querySelectorAll("button.section-tile-link")) {
            if ((button.textContent || "").trim().slice(0, 30) === link) { button.click(); return true; }
        }
    }
    return false;
}, [LAYER, title]);

/** Press the "+" with this name (its aria-label, else its text) in the top layer, else on the page. */
const pressPlus = label => page.evaluate(([layerSel, plusSel, wanted]) => {
    const layer = [...document.querySelectorAll(layerSel)].pop();
    const root = layer ?? document.body;
    const button = [...root.querySelectorAll(plusSel)].find(b => b.getBoundingClientRect().width > 0 && (b.getAttribute("aria-label") || b.textContent.trim()) === wanted);
    if (!button) return false;
    button.click();
    return true;
}, [LAYER, PLUS, label]);

/** Runs in the page: the open floating card's fields in order, as "kind:label". */
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
        return "link";
    };
    const sel = "input, textarea, .option-picker-trigger, .date-cell, .month-picker-trigger, .strategy-box-remove, .card-remove, .profile-card-remove, .legal-entity-field-remove, .plus-box, .strategy-add-button, .business-add-button, .info-note-button, a, button[class*=link]";
    const fields = [];
    for (const el of root.querySelectorAll(sel)) {
        if (el.getBoundingClientRect().width === 0) continue;
        const row = el.closest(".field-row, .interview-field, [class*=field]") || el.parentElement;
        fields.push(kindOf(el) + ":" + (row.querySelector(".field-label")?.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 40));
    }
    const box = root.getBoundingClientRect();
    return { cls: host.className.replace("floating-card-host ", ""), width: Math.round(box.width), height: Math.round(box.height), fields };
}

/** Find every view with a "+" by walking the tiles (the tile titles are the path). */
async function walk(path, depth, found) {
    const now = await view();
    if (now.pluses.length) found.push({ path: [...path], pluses: [...new Set(now.pluses)], tiles: now.tiles });
    if (depth >= 3) return;
    for (const title of [...now.tiles, ...now.links]) {
        const before = await view();
        if (!(await pressTile(title))) continue;
        await page.waitForTimeout(500);
        const after = await view();
        if (after.floating > before.floating) {
            await page.mouse.click(6, 500);
            await page.waitForTimeout(300);
        } else if (after.sig !== before.sig) {
            await walk([...path, title], depth + 1, found);
            // Back out to the view it was.
            for (let step = 0; step < 3 && (await view()).sig !== before.sig; step++) {
                const back = page.locator(LAYER + " .carousel-rail-back, " + LAYER + " .section-tile-back").first();
                if (await back.count()) await back.evaluate(node => node.click());
                else await page.keyboard.press("Escape");
                await page.waitForTimeout(350);
            }
        }
        if ((await view()).sig !== before.sig) { problems.push("lost the view after " + [...path, title].join(" > ")); return; }
    }
}

for (const [system, names] of PAGES) {
    if (systemFilter.length && !systemFilter.some(name => system.includes(name))) continue;
    for (const name of names) {
        if (pageFilter.length && !pageFilter.some(entry => name.includes(entry))) continue;
        const pageName = name.replace(/[\^\\]/g, "");
        if (!(await openPage(system, name))) { problems.push("page not found: " + pageName); continue; }
        const found = [];
        try { await walk([], 0, found); } catch (error) { problems.push("walk stopped on " + pageName + ": " + String(error).slice(0, 100)); }
        console.log(system + " / " + pageName + ": " + found.length + " views with a +");
        for (const where of found) {
            for (const label of where.pluses) {
                const key = system + "|" + label;
                if (done.has(key)) continue;
                done.add(key);
                try {
                    if (!(await openPage(system, name))) continue;
                    for (const title of where.path) { await pressTile(title); await page.waitForTimeout(500); }
                    const before = await view();
                    if (!(await pressPlus(label))) { problems.push("plus not found: " + label + " in " + where.path.join(" > ")); continue; }
                    await page.waitForTimeout(700);
                    const after = await view();
                    const card = after.floating > before.floating ? await page.evaluate(readCard) : null;
                    records.push({
                        system, page: pageName, path: where.path.join(" > ").split("").join(" / "), plus: label, inDialog: before.inDialog,
                        tilesBefore: before.tiles.length, tilesAfter: after.tiles.length, cardsBefore: before.cards, cardsAfter: after.cards,
                        opened: card ? "floating card" : after.sig !== before.sig ? "dialog view" : "in place", card
                    });
                    console.log("  " + (where.path.join(" > ").split("").join(" / ") || "(page)") + " | " + label + " -> " + records[records.length - 1].opened);
                } catch (error) {
                    problems.push("press " + label + " in " + where.path.join(" > ") + ": " + String(error).slice(0, 100));
                }
            }
        }
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ theme, records, problems }));
console.log(records.length + " records, " + problems.length + " problems -> " + out);
problems.slice(0, 20).forEach(p => console.log("  PROBLEM " + p));
