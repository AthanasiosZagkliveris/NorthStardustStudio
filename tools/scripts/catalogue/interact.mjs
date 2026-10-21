/**
 * The interaction probes (the owner's list of 2026-10-15). One script, one probe per run:
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/interact.mjs --probe rails|subchannel|combos|missing|tools [--out FILE]
 *
 *   rails       every rail (the Pages and Sections rails, a dialog's rail, a floating card's carousel
 *               rail, a nested card's rail): the elements it holds in order (items, arrow, Back, title),
 *               its size, and each bullet and label at rest, on hover, on focus and selected, at
 *               768, 1440 and 1920px wide, and the bullets in the three reading modes
 *   subchannel  the Subchannel card: each tick, dropdown choice and "+" pressed, with what changed
 *   combos      Resource, Activity and Partner & Supplier cards (Infrastructure and Offering): every
 *               choice of the category, then of every other dropdown, with the fields after each
 *   missing     what an incomplete card shows (the flashing cell and the line under it), after the
 *               name is typed, after it is cleared, and what a number box does with letters
 *   tools       Notes, Search, Review, Global Settings, the Inventory and Completed tiles, and the
 *               Calendar handle: opened, used once, and what they show
 *
 * Works in the browser's own copy of the example organisation; nothing in the project is touched.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const probe = arg("probe", "rails");
const out = arg("out", probe + ".json");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1000 } })).newPage();
const records = [];
const problems = [];
const LAYER = ".section-tile-overlay:not(.floating-overlay)";
const OPTION = "[role=option], .option-picker-option";
const wait = ms => page.waitForTimeout(ms);

async function seed(theme = "light") {
    await page.goto(base + "/");
    await page.evaluate(([o, t]) => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", t);
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, [org, theme]);
}

async function openPage(system, name, theme = "light") {
    await seed(theme);
    await page.goto(base + "/assistant");
    await wait(700);
    await page.getByText("Foundation", { exact: true }).first().click();
    await wait(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await wait(900);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) { await start.first().click(); await wait(600); }
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click());
    await wait(900);
    for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
        try { await button.click({ timeout: 300 }); } catch { /* gone */ }
    }
    await wait(300);
}

/** Press a master tile, or a tile inside the open dialog, by title. */
const pressTile = (where, title) => page.evaluate(([layerSel, scope, wanted]) => {
    const root = scope === "page" ? document.querySelector(".conversation-card") : [...document.querySelectorAll(layerSel)].pop();
    for (const slot of root ? root.querySelectorAll(".section-tile-slot") : []) {
        if ((slot.querySelector(".section-tile-title")?.textContent || "").trim().slice(0, 40) === wanted) { slot.querySelector("button.section-tile")?.click(); return true; }
    }
    return false;
}, [LAYER, where, title]);

/** Runs in the page: the open floating card's fields in order and its size. */
function readCard() {
    const host = document.querySelector(".floating-card-host");
    const root = host ? host.querySelector(".floating-card-body > *") : null;
    if (!root) return null;
    const kindOf = el => {
        if (el.matches("input[type=checkbox]")) return "tick box" + (el.checked ? "*" : "");
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
        const value = el.matches("input:not([type=checkbox]), textarea") ? "=" + String(el.value).slice(0, 12) : el.matches(".option-picker-trigger") ? "=" + el.textContent.trim().slice(0, 20) : "";
        fields.push(kindOf(el) + ":" + (row.querySelector(".field-label")?.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 36) + value);
    }
    const box = root.getBoundingClientRect();
    return { width: Math.round(box.width), height: Math.round(box.height), fields };
}

async function closeCards() {
    for (let i = 0; i < 3 && (await page.locator(".floating-card-host").count()); i++) {
        await page.mouse.click(6, 500);
        await wait(300);
    }
}

// ---------------------------------------------------------------------------------------------- rails

/** Runs in the page: every rail with what it holds, in DOM order, and each item's bullet and label. */
function readRails() {
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    const box = el => { const r = el.getBoundingClientRect(); return { x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height) }; };
    const rails = [];
    for (const rail of document.querySelectorAll(".bullet-rail, .carousel-rail, .strategy-card-nav")) {
        const r = rail.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const s = getComputedStyle(rail);
        const holds = [...rail.querySelectorAll(".bullet-rail-item, .page-arrow, .carousel-arrow, .carousel-rail-back, .section-tile-back, .strategy-card-nav-arrows, .bullet-rail-title, .bullet-rail-heading, h2, h3, button")]
            .filter(e => e.getBoundingClientRect().width > 0)
            .map(e => (e.getAttribute("class") || "").split(/\s+/)[0] + ":" + (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 22));
        const items = [...rail.querySelectorAll(".bullet-rail-item")].map((item, index) => {
            const dot = item.querySelector(".bullet-rail-dot") || item.querySelector("[class*=dot]");
            const label = item.querySelector(".bullet-rail-label, .strategy-card-nav-tip");
            const ds = dot ? getComputedStyle(dot) : null;
            const ls = label ? getComputedStyle(label) : null;
            return {
                index, active: item.classList.contains("active") || item.getAttribute("aria-current") === "true" || item.getAttribute("aria-current") === "page", text: (item.textContent || "").trim().slice(0, 24),
                dot: dot ? { w: px(dot.getBoundingClientRect().width), h: px(dot.getBoundingClientRect().height), bg: ds.backgroundColor, opacity: ds.opacity, ring: ds.boxShadow.slice(0, 60) } : null,
                label: label ? { shown: ls.display !== "none" && ls.visibility !== "hidden" && label.getBoundingClientRect().width > 0, opacity: ls.opacity, underline: ls.textDecorationLine, weight: ls.fontWeight, w: px(label.getBoundingClientRect().width), colour: ls.color } : null
            };
        });
        rails.push({ cls: (rail.getAttribute("class") || "").split(/\s+/).slice(0, 2).join("."), label: rail.getAttribute("aria-label") || "", box: box(rail), padding: px(s.paddingTop) + "/" + px(s.paddingLeft), tab: /rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) ? "none" : "tab", radius: s.borderTopLeftRadius, holds, items });
    }
    return rails;
}

const LOOK = el => { const s = getComputedStyle(el); return [s.color, s.backgroundColor, s.opacity, s.boxShadow.slice(0, 70), s.textDecorationLine, s.fontWeight].join(" | "); };

/** Hover and focus one rail item (by rail index, item index): the item, its dot and its label before and after. */
async function reactRail(place, railIndex, itemIndex) {
    const handle = (await page.evaluateHandle(([ri, ii]) => {
        const rails = [...document.querySelectorAll(".bullet-rail, .carousel-rail, .strategy-card-nav")].filter(r => r.getBoundingClientRect().width > 0);
        return rails[ri]?.querySelectorAll(".bullet-rail-item")[ii] ?? null;
    }, [railIndex, itemIndex])).asElement();
    if (!handle) return null;
    const read = () => handle.evaluate(item => {
        const look = el => { if (!el) return ""; const s = getComputedStyle(el); return [s.color, s.backgroundColor, s.opacity, s.boxShadow.slice(0, 70), s.textDecorationLine, s.fontWeight, s.display === "none" || s.visibility === "hidden" ? "hidden" : "shown"].join(" | "); };
        const dot = item.querySelector(".bullet-rail-dot") || item.querySelector("[class*=dot]");
        const label = item.querySelector(".bullet-rail-label, .strategy-card-nav-tip");
        return { item: look(item), dot: look(dot), label: look(label), dotSize: dot ? Math.round(dot.getBoundingClientRect().width * 10) / 10 : null, spacing: label ? getComputedStyle(label).letterSpacing + " / " + Math.round(label.getBoundingClientRect().left - item.getBoundingClientRect().left) : "" };
    });
    await page.mouse.move(0, 0);
    await wait(250);
    const rest = await read();
    await handle.hover({ force: true, timeout: 1500 });
    await wait(450);
    const hover = await read();
    await page.mouse.move(0, 0);
    await wait(250);
    await handle.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await wait(450);
    const focus = await read();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const change = (a, b) => ["item", "dot", "label"].map(part => (a[part] === b[part] ? null : part + ": " + a[part] + " -> " + b[part])).filter(Boolean).concat(a.dotSize !== b.dotSize ? ["dot size " + a.dotSize + " -> " + b.dotSize] : []).join("; ");
    return { rest, hover: change(rest, hover), focus: change(rest, focus) };
}

/** The places and their rails, at a width; records the rails and the reaction of a plain item, the lit item and the last. */
async function railsAt(width, theme, withReactions) {
    await page.setViewportSize({ width, height: 1000 });
    const places = [
        ["Business > Infrastructure (page)", async () => { await openPage("Business System", "Infrastructure", theme); }],
        ["Business > Infrastructure > Resources (dialog)", async () => { await openPage("Business System", "Infrastructure", theme); await pressTile("page", "Resources"); await wait(700); }],
        ["Business > Infrastructure > new Resource card (floating)", async () => { await openPage("Business System", "Infrastructure", theme); await page.locator("[aria-label='Add Resource to Resources']").filter({ visible: true }).first().evaluate(n => n.click()); await wait(700); }],
        ["Strategy > Strategic Period > Theme (dialog with nested cards)", async () => { await openPage("Strategy System", "Strategy System", theme); await page.locator(".section-tile-slot", { hasText: "Strategic Period" }).locator("button.section-tile-link").first().evaluate(n => n.click()); await wait(900); }],
        ["Identity > Organization > Registrations (dialog)", async () => { await openPage("Identity System", "2. Organization", theme); await pressTile("page", "Registrations"); await wait(700); }],
        ["Brand > Brand System (page)", async () => { await openPage("Brand System", "Brand System", theme); }]
    ];
    for (const [place, setup] of places) {
        try {
            await setup();
            const rails = await page.evaluate(readRails);
            for (let ri = 0; ri < rails.length; ri++) {
                const rail = rails[ri];
                const rec = { place, width, theme, rail: rail.cls, label: rail.label, box: rail.box, padding: rail.padding, tab: rail.tab, radius: rail.radius, holds: rail.holds.join(" | "), items: rail.items.length, dot: rail.items.map(i => i.dot ? i.dot.w + "x" + i.dot.h + (i.active ? "*" : "") : "").join(","), labelsShown: rail.items.map(i => (i.label && i.label.shown ? "Y" : "n")).join("") };
                if (withReactions && rail.items.length > 1) {
                    const lit = Math.max(0, rail.items.findIndex(i => i.active));
                    const plain = rail.items.findIndex((item, index) => index !== lit);
                    const reactions = {};
                    for (const [name, index] of [["plain", plain], ["lit", lit]]) reactions[name] = await reactRail(place, ri, index);
                    rec.reactions = reactions;
                }
                records.push(rec);
            }
            console.log("  " + place + ": " + rails.length + " rails");
            await closeCards();
        } catch (error) {
            problems.push(place + " @" + width + ": " + String(error).slice(0, 90));
        }
    }
}

if (probe === "rails") {
    for (const width of [768, 1440, 1920]) { console.log("[" + width + "px light]"); await railsAt(width, "light", width !== 768); }
    for (const theme of ["dark", "sepia"]) { console.log("[1920px " + theme + "]"); await railsAt(1920, theme, true); }
}

// ------------------------------------------------------------------------------- card exercises

const trigger = index => page.locator(".floating-card-host .option-picker-trigger").nth(index);
async function optionsOf(index, cap = 10) {
    if (index >= (await page.locator(".floating-card-host .option-picker-trigger").count())) return [];
    await trigger(index).evaluate(node => node.click());
    await wait(200);
    const options = await page.evaluate(sel => [...document.querySelectorAll(sel)].map(o => o.textContent.trim().slice(0, 40)), OPTION);
    if (options.length) { await page.keyboard.press("Escape"); await wait(150); }
    return options.slice(0, cap);
}
async function choose(index, option) {
    if (index >= (await page.locator(".floating-card-host .option-picker-trigger").count())) return false;
    await trigger(index).evaluate(node => node.click());
    await wait(150);
    const item = page.locator(OPTION).filter({ hasText: option }).first();
    if (!(await item.count())) { if (await page.locator(OPTION).count()) await page.keyboard.press("Escape"); return false; }
    await item.evaluate(node => node.click());
    await wait(350);
    return true;
}
const countIn = selector => page.locator(".floating-card-host " + selector).count();
const diffFields = (a, b) => {
    if (!a || !b) return "";
    const gone = a.fields.filter(f => !b.fields.includes(f)), added = b.fields.filter(f => !a.fields.includes(f));
    return (added.length ? "+ " + added.join("; ") : "") + (gone.length ? " - " + gone.join("; ") : "");
};

/** Tick, dropdown choice and "+" of a card, each pressed and read (ticks and "+" on a fresh card each time). */
async function exercise(label, openFn) {
    await openFn();
    const base = await page.evaluate(readCard);
    if (!base) { problems.push("no card: " + label); return; }
    records.push({ card: label, action: "(open)", ...base, change: "" });
    const ticks = await countIn("input[type=checkbox]");
    for (let t = 0; t < ticks; t++) {
        await openFn();
        const before = await page.evaluate(readCard);
        const name = await page.locator(".floating-card-host input[type=checkbox]").nth(t).evaluate(n => ((n.closest("label, .field-row, [class*=field]") || n.parentElement).textContent || "").trim().slice(0, 36));
        await page.locator(".floating-card-host input[type=checkbox]").nth(t).evaluate(n => n.click());
        await wait(400);
        const after = await page.evaluate(readCard);
        records.push({ card: label, action: "tick " + t + " (" + name + ")", ...after, change: diffFields(before, after), dHeight: after && before ? after.height - before.height : null });
    }
    await openFn();
    const dropdowns = await countIn(".option-picker-trigger");
    for (let d = 0; d < dropdowns; d++) {
        const options = await optionsOf(d);
        let previous = await page.evaluate(readCard);
        for (const option of options) {
            if (!(await choose(d, option))) continue;
            const after = await page.evaluate(readCard);
            records.push({ card: label, action: "dropdown " + d + " = " + option, ...after, change: diffFields(previous, after), dHeight: after && previous ? after.height - previous.height : null });
            previous = after;
        }
    }
    await openFn();
    const pluses = await countIn(".plus-box, .business-add-button");
    for (let p = 0; p < pluses; p++) {
        await openFn();
        const before = await page.evaluate(readCard);
        await page.locator(".floating-card-host .plus-box, .floating-card-host .business-add-button").nth(p).evaluate(n => n.click());
        await wait(500);
        const after = await page.evaluate(readCard);
        const cards = await page.locator(".floating-card-host").count();
        records.push({ card: label, action: "plus " + p, ...after, change: diffFields(before, after) + (cards > 1 ? " (a second floating card opened)" : ""), dHeight: after && before ? after.height - before.height : null });
    }
    await closeCards();
}

const openSubchannel = (master, sub) => async () => {
    await openPage("Business System", "Customer Engagement");
    await pressTile("page", master);
    await wait(700);
    await pressTile("dialog", sub);
    await wait(800);
};

if (probe === "subchannel") {
    await exercise("Social Media > LinkedIn (filled)", openSubchannel("Social Media", "LinkedIn"));
    await exercise("Social Media > Instagram (empty)", openSubchannel("Social Media", "Instagram"));
    await exercise("Other > Referral partners (name cell)", openSubchannel("Other", "Referral partners (bookkeepers and IT pr"));
    await exercise("Community (empty channel)", async () => { await openPage("Business System", "Customer Engagement"); await pressTile("page", "Community"); await wait(900); });
}

// ------------------------------------------------------------------------------------------- combos

/** Every category, then every option of every other dropdown, on one card (the choices add up as they are made). */
async function sweep(label, openFn) {
    await openFn();
    const base = await page.evaluate(readCard);
    if (!base) { problems.push("no card: " + label); return; }
    records.push({ card: label, action: "(open)", ...base, change: "" });
    const first = await optionsOf(0, 14);
    for (const category of first) {
        if (!(await choose(0, category))) { problems.push(label + ": could not choose " + category + " (dropdowns " + (await countIn(".option-picker-trigger")) + ", card " + (await page.locator(".floating-card-host").count()) + ")"); continue; }
        let previous = await page.evaluate(readCard);
        records.push({ card: label, action: "dropdown 0 = " + category, ...previous, change: "" });
        const dropdowns = await countIn(".option-picker-trigger");
        for (let d = 1; d < Math.min(dropdowns, 7); d++) {
            const options = await optionsOf(d, 8);
            for (const option of options) {
                if (!(await choose(d, option))) continue;
                const after = await page.evaluate(readCard);
                records.push({ card: label, action: "dropdown 0 = " + category + " | dropdown " + d + " = " + option, ...after, change: diffFields(previous, after), dHeight: after && previous ? after.height - previous.height : null });
                previous = after;
            }
        }
    }
    await closeCards();
}

if (probe === "combos") {
    for (const [version, nth] of [["Infrastructure", 0], ["Offering", 1]]) {
        for (const plus of ["Add Resource to Resources", "Add Activity to Activities", "Add Partner to Partners & Suppliers"].filter(p => !arg("only", "") || p.includes(arg("only", "")))) {
            const open = async () => { await openPage("Business System", "Infrastructure"); await page.locator("[aria-label=" + JSON.stringify(plus) + "]").filter({ visible: true }).nth(nth).evaluate(n => n.click()); await wait(700); };
            try { await sweep(version + " / " + plus, open); console.log("  " + version + " / " + plus + ": " + records.filter(r => r.card === version + " / " + plus).length + " records"); }
            catch (error) { problems.push(version + " / " + plus + ": " + String(error).slice(0, 90)); }
        }
    }
}

// ------------------------------------------------------------------------------------------ missing

/** Runs in the page: what an incomplete card shows. */
function readMissing() {
    const host = document.querySelector(".floating-card-host");
    const root = host ? host.querySelector(".floating-card-body > *") : null;
    if (!root) return null;
    const flashing = [...root.querySelectorAll("*")].filter(e => { const a = getComputedStyle(e).animationName; return a && a !== "none"; });
    return {
        missingFields: [...root.querySelectorAll(".business-field-missing")].map(e => (e.querySelector(".field-label")?.textContent || e.textContent).trim().slice(0, 30)),
        notes: [...root.querySelectorAll(".business-field-missing-note")].map(e => e.textContent.trim().slice(0, 80)),
        lacks: (root.closest("[data-lacks]") || root.querySelector("[data-lacks]"))?.getAttribute("data-lacks") ?? "",
        flashing: flashing.slice(0, 8).map(e => ((e.getAttribute("class") || "").split(/\s+/)[0] || e.tagName.toLowerCase()) + ":" + getComputedStyle(e).animationName),
        height: Math.round(root.getBoundingClientRect().height)
    };
}

if (probe === "missing") {
    const kinds = [["Business > Infrastructure", "Infrastructure", "Add Resource to Resources"], ["Business > Infrastructure", "Infrastructure", "Add Activity to Activities"], ["Business > Infrastructure", "Infrastructure", "Add Partner to Partners & Suppliers"],
        ["Business > Foundation", "1. Foundation", "Add Competitor to Competitors"], ["Business > Foundation", "1. Foundation", "Add Offering to Offerings"], ["Identity > Organization", "2. Organization", "Add Expense to Expenses"], ["Brand", "Brand System", "Add Colour to Colours"]];
    for (const [where, name, plus] of kinds) {
        try {
            const system = where.startsWith("Brand") ? "Brand System" : where.startsWith("Identity") ? "Identity System" : "Business System";
            await openPage(system, name);
            await page.locator("[aria-label=" + JSON.stringify(plus) + "]").filter({ visible: true }).first().evaluate(n => n.click());
            await wait(900);
            records.push({ card: plus, step: "opened empty", ...(await page.evaluate(readMissing)) });
            const nameCell = page.locator(".floating-card-host textarea, .floating-card-host input.interview-input").first();
            await nameCell.click();
            await page.keyboard.type("Test name");
            await wait(500);
            records.push({ card: plus, step: "name typed", ...(await page.evaluate(readMissing)) });
            await page.keyboard.press("Control+A");
            await page.keyboard.press("Delete");
            await page.keyboard.press("Tab");
            await wait(600);
            records.push({ card: plus, step: "name cleared, left", ...(await page.evaluate(readMissing)) });
            // A new card is quiet while it is open. Give it a name, close it, and open it again from the Inventory (or the Expenses tile).
            await nameCell.click();
            await page.keyboard.type("Test name");
            await wait(400);
            const number = page.locator(".floating-card-host input.interview-input[inputmode]").first();
            if (await number.count()) {
                await number.click();
                await page.keyboard.type("abc");
                records.push({ card: plus, step: "number box, typed letters", value: await number.inputValue() });
                await number.fill("");
                await page.keyboard.type("-5");
                records.push({ card: plus, step: "number box, typed -5", value: await number.inputValue() });
            }
            await closeCards();
            const tileName = plus.includes("Expense") ? "Expenses" : "Inventory";
            if (system !== "Brand System" && (plus.includes("Resource") || plus.includes("Activity") || plus.includes("Partner") || plus.includes("Expense"))) {
                await pressTile("page", tileName);
                await wait(800);
                const opened = await page.evaluate(wanted => { const layer = [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay)")].pop(); for (const slot of layer ? layer.querySelectorAll(".section-tile-slot") : []) { if ((slot.querySelector(".section-tile-title")?.textContent || "").trim().startsWith(wanted)) { slot.querySelector("button.section-tile")?.click(); return true; } } return false; }, "Test name");
                await wait(900);
                records.push({ card: plus, step: "reopened from the " + tileName + " tile" + (opened ? "" : " (card not found)"), ...(await page.evaluate(readMissing)) });
            }
            console.log("  " + plus + ": done");
        } catch (error) {
            problems.push(plus + ": " + String(error).slice(0, 90));
        }
    }
}

// --------------------------------------------------------------------------------------------- tools

/** Runs in the page: what is on top (layers, their text, controls) after a press. */
function snapshot() {
    const layers = [...document.querySelectorAll("[role=dialog], [role=menu], [role=listbox], dialog, .search-dialog, .notepad-panel, .org-calendar-panel, .section-tile-overlay, .capability-description-overlay")].filter(e => e.getBoundingClientRect().width > 0);
    const top = layers[layers.length - 1];
    return {
        url: location.pathname,
        layers: layers.map(e => (e.getAttribute("class") || "").split(/\s+/)[0]).join(", "),
        text: top ? top.innerText.replace(/\s+/g, " ").slice(0, 220) : document.body.innerText.replace(/\s+/g, " ").slice(0, 160),
        controls: [...(top ?? document.body).querySelectorAll("button, input, textarea, select, a[href], [role=tab]")].filter(e => e.getBoundingClientRect().width > 0).map(e => ((e.getAttribute("class") || "").split(/\s+/)[0] || e.tagName.toLowerCase()) + ":" + (e.getAttribute("aria-label") || e.textContent || e.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 24)).slice(0, 30)
    };
}

if (probe === "tools") {
    const note = async (tool, step, action) => { try { await action(); await wait(700); records.push({ tool, step, ...(await page.evaluate(snapshot)) }); } catch (error) { problems.push(tool + " / " + step + ": " + String(error).slice(0, 90)); } };
    await openPage("Business System", "Infrastructure");
    await note("Notes", "open", () => page.getByRole("button", { name: /^Notes/ }).first().evaluate(n => n.click()));
    await note("Notes", "press + Add note", () => page.getByRole("button", { name: /Add note/ }).first().evaluate(n => n.click()));
    await note("Notes", "type a note", async () => { const field = page.locator(".notepad-panel textarea, .notepad-panel input[type=text]").first(); await field.click(); await page.keyboard.type("Test note"); });
    await page.keyboard.press("Escape");
    await note("Search", "open", async () => { await page.getByRole("button", { name: "Search" }).first().evaluate(n => n.click()); });
    await note("Search", "type Zoom", async () => { await page.keyboard.type("Zoom"); await wait(500); });
    await note("Search", "press the first result", async () => { await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); });
    await openPage("Business System", "Infrastructure");
    await note("Inventory tile", "open", () => pressTile("page", "Inventory"));
    await note("Inventory tile", "press Table", () => page.getByRole("button", { name: "Table" }).first().evaluate(n => n.click()));
    await note("Inventory tile", "press Tiles", () => page.getByRole("button", { name: "Tiles" }).first().evaluate(n => n.click()));
    await note("Inventory tile", "press the filter", () => page.locator(LAYER + " button[aria-label*='ilter'], " + LAYER + " button[title*='ilter']").first().evaluate(n => n.click()));
    await openPage("Business System", "Infrastructure");
    await note("Completed tile", "open", () => pressTile("page", "Completed"));
    await page.goto(base + "/review");
    await wait(800);
    await note("Review", "page", async () => {});
    await note("Review", "press the first item", () => page.locator("main button, .review-item, [class*=review] button").first().evaluate(n => n.click()));
    await page.goto(base + "/settings");
    await wait(800);
    await note("Global Settings", "page", async () => {});
    await page.goto(base + "/assistant");
    await wait(900);
    await note("Calendar handle", "press Calendar", () => page.locator(".org-rail-handle", { hasText: "Calendar" }).first().evaluate(n => n.click()));
    await note("Calendar handle", "press Capabilities", () => page.locator(".org-rail-handle", { hasText: "Capabilities" }).first().evaluate(n => n.click()));
    await note("Calendar handle", "press Systems", () => page.locator(".org-rail-handle", { hasText: "Systems" }).first().evaluate(n => n.click()));
}

// ------------------------------------------------------------------------------------------ review

if (probe === "review") {
    await openPage("Business System", "Infrastructure");
    await page.goto(base + "/review");
    await wait(900);
    const count = await page.locator(".review-go").count();
    console.log(count + " review items");
    for (let i = 0; i < count; i++) {
        try {
            await page.goto(base + "/review");
            await wait(800);
            const text = await page.locator(".review-go").nth(i).evaluate(n => (n.closest("li, section, div[class*=review]")?.parentElement?.innerText || n.parentElement.innerText).replace(/\s+/g, " ").slice(0, 200));
            await page.locator(".review-go").nth(i).evaluate(n => n.click());
            await wait(1200);
            const snap = await page.evaluate(snapshot);
            const card = await page.evaluate(readCard);
            const missing = await page.evaluate(readMissing);
            records.push({ item: i, text, ...snap, card: card ? card.fields.slice(0, 12).join(" > ") : null, missing });
        } catch (error) { problems.push("review item " + i + ": " + String(error).slice(0, 90)); }
    }
}

await browser.close();
writeFileSync(out, JSON.stringify({ probe, records, problems }));
console.log(records.length + " records, " + problems.length + " problems -> " + out);
problems.slice(0, 15).forEach(p => console.log("  PROBLEM " + p));
