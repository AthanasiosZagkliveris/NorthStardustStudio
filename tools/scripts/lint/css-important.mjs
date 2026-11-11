/**
 * WHAT EACH !important OVERRIDES (owner, 2026-11-11: "Go on, do all together", the optimisation's step 2): an `!important` is there to win over another
 * rule; this finds, on the pages the app draws, every element an `!important` declaration applies to, and the other declarations of the same property
 * that also apply to it. An `!important` with no rival anywhere is not needed (it can go as it is); one with rivals is fixed at its source: the rival is
 * corrected or removed, then the `!important` goes.
 *
 *   node tools/scripts/lint/css-important.mjs                 every !important on the Foundation pages, their tile dialogs and floating cards
 *   node tools/scripts/lint/css-important.mjs --json FILE     the same, written as JSON
 *
 * Read-only. Needs the dev server (http://localhost:1420). A rule's selector is matched in the page (element.matches), so a state the page is not in
 * (:hover, :focus) is not seen: such an !important is listed with "seen: 0" and left alone.
 */
import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { EXAMPLES, PAGES, openPage, seedExample } from "../layout-check/run.mjs";

const base = process.env.BASE_URL ?? "http://localhost:1420";
const jsonOut = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : null;

/** In the page: every style rule with an !important declaration, and for each, the rivals it beats on the elements it applies to. */
const scan = () => {
    const rules = [];
    const walk = (list, sheet) => {
        for (const rule of list) {
            if (rule.cssRules && !(rule instanceof CSSStyleRule)) {
                walk(rule.cssRules, sheet);
                continue;
            }
            if (!(rule instanceof CSSStyleRule)) continue;
            rules.push({ rule, sheet: ((sheet.ownerNode && sheet.ownerNode.dataset && sheet.ownerNode.dataset.viteDevId) || sheet.href || "inline").split(/[\/]src[\/]styles[\/]/).pop().split("?")[0] });
        }
    };
    for (const sheet of document.styleSheets) {
        try { walk(sheet.cssRules, sheet); } catch { /* another origin */ }
    }
    // (The rules that set each property, so a rival is looked for among those only.)
    const byProp = new Map();
    for (const entry of rules) for (let i = 0; i < entry.rule.style.length; i++) { const prop = entry.rule.style[i]; if (!byProp.has(prop)) byProp.set(prop, []); byProp.get(prop).push(entry); }
    const matches = (rule, element) => { try { return element.matches(rule.selectorText); } catch { return false; } };
    const found = {};
    const all = [...document.querySelectorAll("body *")].filter(element => element.getClientRects().length > 0);
    for (const { rule, sheet } of rules) {
        for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i];
            if (rule.style.getPropertyPriority(prop) !== "important") continue;
            const key = sheet + " | " + rule.selectorText.replace(/\s+/g, " ").slice(0, 160) + " | " + prop;
            const entry = found[key] ?? (found[key] = { sheet, selector: rule.selectorText, prop, value: rule.style.getPropertyValue(prop), seen: 0, rivals: {} });
            for (const element of all) {
                if (!matches(rule, element)) continue;
                entry.seen++;
                for (const other of byProp.get(prop) ?? []) {
                    if (other.rule === rule) continue;
                    if (other.rule.style.getPropertyValue(prop) === rule.style.getPropertyValue(prop)) continue;
                    if (!matches(other.rule, element)) continue;
                    const rival = other.sheet + " | " + other.rule.selectorText.replace(/\s+/g, " ").slice(0, 160) + " => " + other.rule.style.getPropertyValue(prop) + (other.rule.style.getPropertyPriority(prop) ? " !important" : "");
                    entry.rivals[rival] = (entry.rivals[rival] ?? 0) + 1;
                }
            }
        }
    }
    return found;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const total = {};
const merge = found => {
    for (const [key, entry] of Object.entries(found)) {
        const into = total[key] ?? (total[key] = { ...entry, seen: 0, rivals: {} });
        into.seen += entry.seen;
        for (const [rival, n] of Object.entries(entry.rivals)) into.rivals[rival] = (into.rivals[rival] ?? 0) + n;
    }
};
for (const example of EXAMPLES.slice(0, 2)) {
    await seedExample(page, base, readFileSync(example.file, "utf8"));
    for (const [system, names] of PAGES) {
        for (const name of names) {
            if (!(await openPage(page, base, system, name))) continue;
            merge(await page.evaluate(scan));
            // Every tile's dialog, and the first floating card of each tile.
            const tiles = await page.locator("button.section-tile[data-tile]").count();
            for (let t = 0; t < tiles; t++) {
                const tile = page.locator("button.section-tile[data-tile]").nth(t);
                const id = await tile.getAttribute("data-tile");
                await tile.evaluate(node => node.click());
                await page.waitForTimeout(400);
                merge(await page.evaluate(scan));
                await page.keyboard.press("Escape");
                await page.waitForTimeout(250);
                const link = page.locator(".section-tile-slot:has(button.section-tile[data-tile='" + id + "']) .section-tile-link").first();
                if (await link.count()) {
                    await link.evaluate(node => node.click());
                    await page.waitForTimeout(450);
                    merge(await page.evaluate(scan));
                    await page.keyboard.press("Escape");
                    await page.waitForTimeout(250);
                }
            }
            process.stderr.write(".");
        }
    }
}
await browser.close();
const list = Object.values(total).sort((a, b) => a.sheet.localeCompare(b.sheet) || a.selector.localeCompare(b.selector));
const unneeded = list.filter(entry => entry.seen > 0 && Object.keys(entry.rivals).length === 0);
const unseen = list.filter(entry => entry.seen === 0);
const fought = list.filter(entry => Object.keys(entry.rivals).length > 0);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ unneeded, unseen, fought }, null, 1));
console.log("\n" + list.length + " !important declarations: " + unneeded.length + " applied with no rival (not needed), " + fought.length + " beat a rival, " + unseen.length + " not seen on these pages.");
for (const entry of fought.slice(0, Number(process.env.SHOW ?? 20))) {
    console.log("\n" + entry.sheet + "  " + entry.selector.replace(/\s+/g, " ").slice(0, 140) + "  { " + entry.prop + ": " + entry.value + " !important }");
    for (const [rival, n] of Object.entries(entry.rivals).slice(0, 4)) console.log("    beats " + rival + "  (" + n + ")");
}
