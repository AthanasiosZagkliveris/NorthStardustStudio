/**
 * The card scanner: opens every page, master tile, dialog (and the open tiles
 * inside it) and floating card of the Foundation capability (the Identity,
 * Brand, Business and Strategy systems) in an example organisation, and
 * measures each surface, every control by type, the navigation (rails, arrows,
 * chapters, links) and where each card opens against what opened it. Read-only:
 * it presses tiles and links to open things and closes them again; it never
 * types and never presses a "+" or an x. Output: a JSON file with one record
 * per thing found.
 *
 *   PW_CHANNEL=msedge node tools/scripts/cards/scan.mjs [--out FILE] [--systems Business,Brand] [--pages Infrastructure] [--example quillfield|lumen] [--width 1920] [--theme light|dark|sepia] [--max 70]
 *
 * Needs the dev server running (npm run dev). tools/scripts/cards/report.mjs turns the
 * output into the variance tables (the distinct sizes found per control type and
 * per surface, and where).
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { CONTROLS, measureScope, measureNavigation, measurePlacement } from "./measure.mjs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "card-scan.json");
const example = arg("example", "quillfield");
const width = Number(arg("width", "1920"));
const theme = arg("theme", "light");
const systemFilter = arg("systems", "").split(",").filter(Boolean);
const pageFilter = arg("pages", "").split(",").filter(Boolean);

const PAGES = [
    ["Identity System", ["^1\\. Definition", "^2\\. Organization"]],
    ["Brand System", ["Brand System"]],
    ["Business System", ["^1\\. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"]],
    ["Strategy System", ["Strategy System"]]
];
const MAX_OPENINGS_PER_PAGE = Number(arg("max", "70"));
const MAX_DEPTH = 4;

const records = [];
const problems = [];
const log = text => console.log(text);

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const context = await browser.newContext({ viewport: { width, height: 1000 } });
const page = await context.newPage();

const file = example === "lumen" ? "lumen-and-loom-studio.json" : "quillfield-automation-llc.json";
const organisation = JSON.parse(readFileSync(new URL("../../../src/data/examples/" + file, import.meta.url), "utf8"));
await page.goto(base + "/");
await page.evaluate(([org, themeName]) => {
    localStorage.setItem("northstardust-theme", themeName);
    localStorage.setItem("northstardust-organization-" + org.id, JSON.stringify(org));
    const list = JSON.parse(localStorage.getItem("northstardust-organizations") || "[]");
    if (!list.some(entry => entry.id === org.id)) list.push({ id: org.id, name: org.name, createdAt: org.createdAt });
    localStorage.setItem("northstardust-organizations", JSON.stringify(list));
    localStorage.setItem("northstardust-selected-organization", org.id);
}, [organisation, theme]);

async function openPage(system, pageName) {
    await page.goto(base + "/assistant");
    await page.waitForTimeout(600);
    await page.getByText("Foundation", { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(800);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) {
        await start.first().click();
        await page.waitForTimeout(600);
    }
    const target = page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(pageName) }).first();
    if (!(await target.count())) return false;
    await target.evaluate(node => node.click());
    await page.waitForTimeout(800);
    // Every card of the page open (Expand all, then any arrow still folded), as the layout check does.
    for (let round = 0; round < 2; round++) {
        for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
            try { await button.click({ timeout: 300 }); } catch { /* gone as another opened */ }
        }
        await page.waitForTimeout(200);
    }
    return true;
}

const where = { system: "", page: "", path: [] };
const add = rows => rows.forEach(row => records.push({ ...where, path: where.path.join(" > "), ...row }));
const measure = async (scope, surface) => {
    await page.mouse.move(0, 0);
    add(await page.evaluate(measureScope, { scope, controls: CONTROLS, surface }));
};

/** What is open now, and a signature of the top layer, so a view is told from the one before it. */
const state = () => page.evaluate(() => {
    const layers = [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay)")];
    const top = layers[layers.length - 1];
    return {
        dialog: layers.length,
        floating: document.querySelectorAll(".floating-card-host").length,
        sig: layers.length + "|" + document.querySelectorAll(".floating-card-host").length + "|" + (top ? top.innerText.replace(/\s+/g, " ").slice(0, 140) : "page")
    };
});

/** The things in the top layer that open something: tiles and links. Each is described by its text, for a path and a dedupe. */
const openables = () => page.evaluate(() => {
    const layer = [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay)")].pop();
    const root = layer ?? document.querySelector(".conversation-card") ?? document.body;
    const items = [];
    [...root.querySelectorAll(".section-tile-slot")].forEach((slot, slotIndex) => {
        const tile = slot.querySelector("button.section-tile");
        const title = (slot.querySelector(".section-tile-title")?.textContent || tile?.getAttribute("aria-label") || "").trim().slice(0, 40);
        if (tile) items.push({ kind: "tile", slotIndex, title });
        const link = slot.querySelector("button.section-tile-link");
        if (link) items.push({ kind: "link", slotIndex, title: title + " / " + (link.textContent || "").trim().slice(0, 30) });
    });
    return items;
});

/** Press an opener (in the page: a links layer covers the tile) and return its box and its frame's box, read before the press. */
async function press(item) {
    return page.evaluate(({ kind, slotIndex }) => {
        const layer = [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay)")].pop();
        const root = layer ?? document.querySelector(".conversation-card") ?? document.body;
        const slot = [...root.querySelectorAll(".section-tile-slot")][slotIndex];
        const button = slot && slot.querySelector(kind === "tile" ? "button.section-tile" : "button.section-tile-link");
        if (!button) return null;
        const box = element => { if (!element) return null; const r = element.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
        const frame = box(button.closest(".business-foundation-input, .section-tile-overlay, .conversation-card"));
        const opener = box(button);
        button.click();
        return { opener, frame };
    }, item);
}

/** Close the top layer: a floating card by a press outside it (then Escape); a dialog view by its Back, else Escape. */
async function closeTop() {
    const now = await state();
    if (now.floating > 0) {
        // A press outside the card closes the topmost card only (Escape would close the dialog behind it as well).
        await page.mouse.click(6, 500);
        await page.waitForTimeout(350);
        if ((await state()).floating >= now.floating) {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(350);
        }
        return;
    }
    const back = page.locator(".section-tile-overlay:not(.floating-overlay) .carousel-rail-back, .section-tile-overlay:not(.floating-overlay) .section-tile-back").first();
    if (await back.count()) await back.evaluate(node => node.click());
    else await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
}

/** Back out until the view is the one it was (at most four steps). */
async function restore(signature) {
    for (let step = 0; step < 4; step++) {
        if ((await state()).sig === signature) return true;
        await closeTop();
    }
    return (await state()).sig === signature;
}

let openings = 0;
const visited = new Set();

async function crawl(depth) {
    if (depth > MAX_DEPTH) return;
    const items = await openables();
    for (const item of items) {
        if (openings >= MAX_OPENINGS_PER_PAGE) return;
        const key = where.path.join(">") + ">" + item.kind + ":" + item.title;
        if (visited.has(key)) continue;
        visited.add(key);
        const before = await state();
        const origin = await press(item);
        if (!origin) continue;
        openings++;
        await page.waitForTimeout(550);
        const after = await state();
        where.path.push(item.title);
        if (after.floating > before.floating) {
            await measure(".floating-card-host .floating-card-body > *", "floating card");
            await measure(".floating-card-host .floating-card-caption", "card caption");
            const placement = await page.evaluate(measurePlacement, origin);
            if (placement) add([placement]);
            add(await page.evaluate(measureNavigation, { scope: ".floating-card-host" }));
            log("  card   " + where.path.join(" > "));
        } else if (after.sig !== before.sig) {
            await measure(".section-tile-overlay:not(.floating-overlay):last-of-type", "dialog view");
            await measure(".section-tile-overlay:not(.floating-overlay):last-of-type .section-tile-slot > button.section-tile", "open tile");
            add(await page.evaluate(measureNavigation, { scope: ".section-tile-overlay:not(.floating-overlay):last-of-type" }));
            log("  view   " + where.path.join(" > "));
            await crawl(depth + 1);
        } else {
            problems.push("nothing opened: " + where.path.join(" > "));
        }
        where.path.pop();
        if (!(await restore(before.sig))) {
            problems.push("lost the view after: " + where.path.join(" > ") + " > " + item.title + " (the page was opened again)");
            throw new Error("lost");
        }
    }
}

for (const [system, names] of PAGES) {
    if (systemFilter.length && !systemFilter.some(name => system.includes(name))) continue;
    for (const name of names) {
        if (pageFilter.length && !pageFilter.some(entry => name.includes(entry))) continue;
        where.system = system;
        where.page = name.replace(/[\^\\]/g, "");
        where.path = [];
        openings = 0;
        visited.clear();
        log(system + " / " + where.page);
        if (!(await openPage(system, name))) {
            problems.push("page not found: " + system + " / " + name);
            continue;
        }
        // The page itself: its master tiles, the controls of its cards, and its navigation (rails, arrows, chapters).
        await measure(".conversation-card .section-tile-slot > button.section-tile", "master tile");
        await measure(".conversation-card", "page");
        add(await page.evaluate(measureNavigation, { scope: ".conversation-card" }));
        for (let attempt = 0; attempt < 6; attempt++) {
            try {
                await crawl(1);
                break;
            } catch (error) {
                if (String(error).includes("lost") && attempt < 5) {
                    where.path = [];
                    if (!(await openPage(system, name))) break;
                    continue;
                }
                problems.push("crawl stopped on " + where.page + ": " + String(error).slice(0, 160));
                break;
            }
        }
        log("  " + openings + " openings, " + records.length + " records so far");
    }
}

await browser.close();
writeFileSync(out, JSON.stringify({ example, width, theme, records, problems }, null, 1));
log(records.length + " records, " + problems.length + " problems -> " + out);
for (const problem of problems.slice(0, 30)) log("  PROBLEM " + problem);
