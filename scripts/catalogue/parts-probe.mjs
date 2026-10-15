/**
 * Measures what the text probe did not: the fonts in use, the texts that can be pressed (links), the page tag of a
 * card (with its width), the image holders of the Brand pages (logo, icon, image), the text of the date popup, the
 * words beside a number (units), and the link symbol. Presses only page buttons, tiles, the plus that opens a card
 * and the calendar button.
 *
 *   PW_CHANNEL=msedge node scripts/catalogue/parts-probe.mjs [--out FILE]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "catalogue/measures/parts-quillfield-1920.json");
const org = JSON.parse(readFileSync(new URL("../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
page.setDefaultTimeout(8000);
const wait = ms => page.waitForTimeout(ms);
const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("failed: " + name + ": " + String(error).slice(0, 160)); } };
const result = { fonts: [], pressable: [], tags: [], images: [], popup: [], units: [], symbols: [] };

async function open(system, name) {
    await page.goto(base + "/");
    await page.evaluate(o => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", "light");
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, org);
    await page.goto(base + "/assistant");
    await wait(700);
    await page.getByText("Foundation", { exact: true }).first().click();
    await wait(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await wait(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await wait(600); }
    if (name) {
        await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click());
        await wait(900);
    }
}

/** In the page: fonts, pressable texts, units, symbols. */
function scan() {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const fonts = {}, pressable = [], units = [], symbols = [];
    for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
        const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2).join(".");
        if (own) {
            const family = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
            fonts[family] = (fonts[family] ?? 0) + 1;
            const pressed = ["A", "BUTTON"].includes(el.tagName) || el.getAttribute("role") === "button" || el.closest("a, button, [role=button]") || s.cursor === "pointer";
            if (pressed) pressable.push({ tag: el.tagName.toLowerCase(), cls, text: own.slice(0, 30), size: px(s.fontSize), weight: s.fontWeight, underline: s.textDecorationLine.includes("underline"), italic: s.fontStyle === "italic", transform: s.textTransform, colour: s.color });
            if (/^(%|years?|months?|hrs?|hours?|USD|px|\/ ?month|per month)$/i.test(own)) units.push({ tag: el.tagName.toLowerCase(), cls, text: own, size: px(s.fontSize), weight: s.fontWeight, colour: s.color, w: px(r.width), h: px(r.height) });
        }
        if (/link-symbol/.test(cls)) symbols.push({ cls, w: px(r.width), h: px(r.height), size: px(s.fontSize), colour: s.color, radius: s.borderTopLeftRadius, border: px(s.borderTopWidth) });
    }
    return { fonts, pressable, units, symbols };
}
async function scanAll(where) {
    const r = await page.evaluate(scan);
    result.fonts.push({ where, fonts: r.fonts });
    for (const p of r.pressable) result.pressable.push({ where, ...p });
    for (const u of r.units) result.units.push({ where, ...u });
    for (const s of r.symbols) result.symbols.push({ where, ...s });
}
const tags = where => page.evaluate(w => {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    return [...document.querySelectorAll("[class*=bullet-rail]")].filter(e => e.getBoundingClientRect().width > 0).map(e => {
        const r = e.getBoundingClientRect();
        return { where: w, cls: (e.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."), w: px(r.width), h: px(r.height), text: e.textContent.trim().slice(0, 60), insideCard: !!e.closest(".floating-card-host, .floating-overlay") };
    });
}, where);

// Fonts and pressable texts: every page of the four systems
for (const system of ["Identity System", "Brand System", "Business System", "Strategy System"]) {
    await open(system);
    await scanAll(system + " / start");
    const names = await page.getByRole("navigation", { name: "Pages" }).getByRole("button").evaluateAll(list => list.map(b => b.textContent.trim()));
    for (const name of [...new Set(names)].filter(n => n && n.length > 1)) {
        try {
            await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name }).first().evaluate(n => n.click());
            await wait(700);
            await scanAll(system + " / " + name);
            result.tags.push(...await tags(system + " / " + name));
        } catch { /* a page that cannot be opened is skipped */ }
    }
}

// Brand: the logo, the icon, the images
await attempt("brand icon and logo", async () => {
await open("Brand System", "Icon");
result.images.push(...await page.evaluate(() => { const px = v => Math.round(parseFloat(v) * 100) / 100; return [...document.querySelectorAll("img, svg, [class*=logo], [class*=icon-card], [class*=image]")].filter(e => e.getBoundingClientRect().width > 40).slice(0, 14).map(e => { const r = e.getBoundingClientRect(); return { where: "Brand, Icon & Logo", tag: e.tagName.toLowerCase(), cls: (e.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."), w: px(r.width), h: px(r.height), radius: getComputedStyle(e).borderTopLeftRadius }; }); }));
});
await attempt("brand images", async () => {
await open("Brand System", "Brand System");
await page.locator(".section-tile-slot", { hasText: "Brand Images" }).locator("button.section-tile").first().evaluate(n => n.click());
await wait(900);
await page.locator(".section-tile-overlay:not(.floating-overlay) button.section-tile").first().evaluate(n => n.click());
await wait(900);
result.images.push(...await page.evaluate(() => { const px = v => Math.round(parseFloat(v) * 100) / 100; return [...document.querySelectorAll(".brand-image-card, .brand-image-card img, .brand-image-card svg")].map(e => { const r = e.getBoundingClientRect(); return { where: "Brand, Image 1", tag: e.tagName.toLowerCase(), cls: (e.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."), w: px(r.width), h: px(r.height), radius: getComputedStyle(e).borderTopLeftRadius }; }); }));
result.tags.push(...await tags("Brand, Image 1 (card)"));
});

// Business: a Resource card, its page tag, the date popup, the units, the link symbol
await attempt("business card", async () => {
await open("Business System", "Infrastructure");
await page.locator("[aria-label='Add Resource to Resources']").filter({ visible: true }).first().evaluate(n => n.click());
await wait(900);
result.tags.push(...await tags("Business, new Resource card"));
await scanAll("Business, new Resource card");
const before = await page.evaluate(() => new Set([...document.querySelectorAll("body *")].map(e => e)).size);
const calendar = page.locator(".date-cell-calendar-button").filter({ visible: true }).first();
if (await calendar.count()) {
    await calendar.evaluate(n => n.click());
    await wait(700);
    result.popup = await page.evaluate(() => {
        const px = v => Math.round(parseFloat(v) * 100) / 100;
        const roots = [...document.querySelectorAll("[class*=popup], [class*=calendar-panel], [class*=month-picker-panel], [class*=picker-panel], [role=dialog], [role=grid]")].filter(e => e.getBoundingClientRect().width > 0 && !e.closest(".floating-card-host"));
        return roots.slice(0, 3).map(root => {
            const r = root.getBoundingClientRect(), s = getComputedStyle(root);
            const texts = {};
            for (const el of root.querySelectorAll("*")) { const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim(); if (!own) continue; const t = getComputedStyle(el); const k = px(t.fontSize) + "/" + t.fontWeight; texts[k] = (texts[k] ?? 0) + 1; }
            return { cls: (root.getAttribute("class") || "").slice(0, 60), w: px(r.width), h: px(r.height), radius: s.borderTopLeftRadius, padding: s.paddingTop, texts };
        });
    });
}
await page.keyboard.press("Escape");
});
await attempt("financial foundation", async () => {
await open("Business System", "Financial Foundation");
await scanAll("Business, Financial Foundation");
});
await attempt("resource card units", async () => {
await open("Business System", "Infrastructure");
await page.locator("[aria-label='Add Resource to Resources']").filter({ visible: true }).first().evaluate(n => n.click());
await wait(800);
await scanAll("Business, Resource card (units, symbols)");
});
await browser.close();
writeFileSync(out, JSON.stringify(result));
console.log("fonts " + result.fonts.length + " pages, pressable " + result.pressable.length + ", tags " + result.tags.length + ", images " + result.images.length + ", units " + result.units.length + ", symbols " + result.symbols.length + " -> " + out);
