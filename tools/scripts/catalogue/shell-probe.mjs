/**
 * The shell probe: what is around the Foundation systems. The landing page, the
 * system-selection page ("Select framework" and system pages), the app header
 * (reading mode, search, notes, review, global settings) and the calendar. For
 * each stage it lists every control (kind, class, name, size, type, corners,
 * border) and, in the three reading modes, how each reacts: the look at rest,
 * on hover and on keyboard focus. Then it presses what opens something (never
 * what changes or removes data: Add, Import, Export, Remove, Reload are listed,
 * not pressed), records what opened (its controls, size, how it closes) and
 * closes it again.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/shell-probe.mjs [--out FILE] [--width 1920]
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const base = arg("base", "http://localhost:1420");
const out = arg("out", "shell-probe.json");
const width = Number(arg("width", "1920"));
const THEMES = ["light", "dark", "sepia"];
const SKIP = /^(\+ Add|Add |Import|Export|Remove|Reload the app)/i;
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await (await browser.newContext({ viewport: { width, height: 1000 } })).newPage();
const records = [];
const problems = [];

async function seed(theme) {
    await page.goto(base + "/");
    await page.evaluate(([o, t]) => {
        localStorage.clear();
        localStorage.setItem("northstardust-theme", t);
        localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o));
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }]));
        localStorage.setItem("northstardust-selected-organization", o.id);
    }, [org, theme]);
}

/** Runs in the page: every control in view (or in `scope`), with a stable index. */
function listControls(scope) {
    const px = value => Math.round(parseFloat(value) * 100) / 100;
    const root = scope ? [...document.querySelectorAll(scope)].pop() : document.body;
    if (!root) return [];
    const sel = "button, a[href], [role=button], [role=tab], [role=menuitem], [role=option], input, select, textarea, [tabindex='0']";
    return [...root.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden").map((e, index) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return {
            index, tag: e.tagName.toLowerCase(), cls: (e.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2).join("."),
            role: e.getAttribute("role") || "", name: (e.getAttribute("aria-label") || e.textContent || e.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 50),
            w: px(r.width), h: px(r.height), font: px(s.fontSize), weight: s.fontWeight, radius: s.borderTopLeftRadius, border: px(s.borderTopWidth), cursor: s.cursor
        };
    });
}

/** Runs in the page: the look of the nth control of the list (same selector as listControls). */
function lookOf([scope, index]) {
    const root = scope ? [...document.querySelectorAll(scope)].pop() : document.body;
    const sel = "button, a[href], [role=button], [role=tab], [role=menuitem], [role=option], input, select, textarea, [tabindex='0']";
    const list = [...root.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden");
    const e = list[index];
    if (!e) return null;
    const s = getComputedStyle(e);
    return [s.color, s.backgroundColor, s.borderTopColor, s.boxShadow, s.outlineStyle + " " + s.outlineWidth + " " + s.outlineColor, s.transform, s.opacity, s.textDecorationLine].join(" | ");
}

const names = ["colour", "fill", "border", "shadow", "outline", "transform", "opacity", "underline"];
function diff(rest, other) {
    if (!rest || !other) return "";
    const a = rest.split(" | "), b = other.split(" | ");
    return a.map((value, i) => (value === b[i] ? null : names[i] + " " + value + " -> " + b[i])).filter(Boolean).join("; ");
}

/** Every control of a stage: its facts, and its hover and focus change in each reading mode. */
async function survey(stage, scope, reactions = true) {
    let controls = await page.evaluate(listControls, scope);
    for (let retry = 0; retry < 3 && controls.length === 0; retry++) {
        await page.waitForTimeout(1500);
        controls = await page.evaluate(listControls, scope);
    }
    if (controls.length === 0) problems.push("no controls found: " + stage);
    for (const c of controls) {
        const rec = { stage, kind: "control", ...c, hover: {}, focus: {} };
        if (reactions && !SKIP.test(c.name)) {
            const handle = (await page.evaluateHandle(([sc, i]) => {
                const root = sc ? [...document.querySelectorAll(sc)].pop() : document.body;
                const sel = "button, a[href], [role=button], [role=tab], [role=menuitem], [role=option], input, select, textarea, [tabindex='0']";
                return [...root.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden")[i];
            }, [scope, c.index])).asElement();
            if (handle) {
                try {
                    await page.mouse.move(0, 0);
                    const rest = await page.evaluate(lookOf, [scope, c.index]);
                    await handle.hover({ timeout: 1500 });
                    await page.waitForTimeout(450);
                    rec.hover.light = diff(rest, await page.evaluate(lookOf, [scope, c.index]));
                    await page.mouse.move(0, 0);
                    await handle.focus();
                    await page.keyboard.press("Shift+Tab");
                    await page.keyboard.press("Tab");
                    await page.waitForTimeout(450);
                    rec.focus.light = diff(rest, await page.evaluate(lookOf, [scope, c.index]));
                    await page.evaluate(() => document.activeElement && document.activeElement.blur());
                } catch (error) { rec.note = "reaction not read: " + String(error).slice(0, 60); }
            }
        }
        records.push(rec);
    }
    return controls;
}

/** Press the control, record what opened, close it. */
async function opens(stage, scope, c, how = "click") {
    const layerKeys = () => page.evaluate(() => [...document.querySelectorAll("[role=dialog], [role=menu], [role=listbox], dialog, .modal, .popover, .drawer, [class*=overlay], [class*=panel]")].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute("class") || "").split(/s+/)[0] + "@" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
    const before = await layerKeys();
    const url = page.url();
    const handle = (await page.evaluateHandle(([sc, i]) => {
        const root = sc ? [...document.querySelectorAll(sc)].pop() : document.body;
        const sel = "button, a[href], [role=button], [role=tab], [role=menuitem], [role=option], input, select, textarea, [tabindex='0']";
        return [...root.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== "hidden")[i];
    }, [scope, c.index])).asElement();
    if (!handle) return null;
    await handle.evaluate(node => node.click());
    await page.waitForTimeout(700);
    const now = await layerKeys();
    const fresh = now.filter(key => !before.includes(key));
    const after = await page.evaluate(newKeys => {
        const layers = [...document.querySelectorAll("[role=dialog], [role=menu], [role=listbox], dialog, .modal, .popover, .drawer, [class*=overlay], [class*=panel]")].filter(e => e.getBoundingClientRect().width > 0 && newKeys.includes((e.getAttribute("class") || "").split(/s+/)[0] + "@" + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height)));
        const top = layers[layers.length - 1];
        const r = top ? top.getBoundingClientRect() : null;
        return { layers: layers.length, cls: top ? (top.getAttribute("class") || "").split(/\s+/)[0] : "", role: top ? top.getAttribute("role") || "" : "", modal: top ? top.getAttribute("aria-modal") || "" : "", box: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(",") : "", text: top ? top.innerText.replace(/\s+/g, " ").slice(0, 160) : "" };
    }, fresh);
    const moved = page.url() !== url;
    records.push({ stage, kind: "opens", control: c.name, cls: c.cls, how, newLayers: fresh.join(", "), ...after, navigated: moved ? page.url().replace(base, "") : "" });
    return { moved, after };
}

async function closeTop(scopeBefore) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
}

for (const theme of THEMES) {
    await seed(theme);
    await page.goto(base + "/"); await page.waitForTimeout(1000);
    console.log("[" + theme + "] landing");
    const landing = await survey(theme + " / landing page", null);
    if (theme === "light") {
        for (const c of landing) {
            if (SKIP.test(c.name) || c.tag === "input") continue;
            await page.goto(base + "/"); await page.waitForTimeout(700);
            const result = await opens("landing page", null, c);
            if (result && result.moved) {
                console.log("  " + c.name + " -> " + page.url());
                await survey("page after '" + c.name + "'", null, true);
                await page.goBack(); await page.waitForTimeout(500);
            } else if (result) await closeTop();
        }
    }
    // The system-selection page and its header.
    await page.goto(base + "/assistant"); await page.waitForTimeout(1000);
    console.log("[" + theme + "] system selection");
    const shell = await survey(theme + " / system selection page", null);
    if (theme === "light") {
        for (const c of shell) {
            if (SKIP.test(c.name) || c.tag === "input") continue;
            await page.goto(base + "/assistant"); await page.waitForTimeout(700);
            const result = await opens("system selection page", null, c);
            if (result && result.moved) {
                console.log("  " + c.name + " -> " + page.url());
                await survey("page after '" + c.name + "'", null, false);
                await page.goBack(); await page.waitForTimeout(500);
            } else if (result) {
                await survey("open: " + c.name, "[role=dialog], [role=menu], [role=listbox], dialog, .modal, .popover, .drawer, [class*=overlay], [class*=panel]", false);
                await closeTop();
            }
        }
    }
}
await browser.close();
writeFileSync(out, JSON.stringify({ width, records, problems }));
console.log(records.length + " records, " + problems.length + " problems -> " + out);
