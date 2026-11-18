// TEMPORARY (deleted after use): every dialog and the first floating card behind each tile, on every page of both examples, in sepia at 1366x768 and
// 1920x1080 -- the same properties measured on each, so the cards can be compared with each other.
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { openPage, seedExample, PAGES } from "./run.mjs";
const base = "http://localhost:1430";
const out = process.env.OUT;
const browser = await chromium.launch();

const measure = (kind) => {
    const layer = kind === "card" ? [...document.querySelectorAll(".floating-card-body")].pop() : [...document.querySelectorAll(".section-tile-overlay:not(.floating-overlay) > .section-tile-dialog")].pop();
    if (!layer) {
        return null;
    }
    const r = e => e.getBoundingClientRect();
    const px = v => Math.round(parseFloat(v) * 10) / 10;
    const vis = e => { const b = r(e); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
    const cs = getComputedStyle(layer);
    const head = layer.querySelector(".strategy-box-head");
    const name = head?.querySelector("textarea.card-name-input, .strategy-name-input, .strategy-name-static");
    const x = head?.querySelector(".strategy-box-remove, .card-remove");
    const bands = [...layer.querySelectorAll(".legal-entity-org-section")].filter(vis);
    const tinted = bands.map(b => getComputedStyle(b).backgroundColor);
    // two neighbouring bands of the same colour (the alternation broken)
    const sameNeighbours = bands.slice(1).filter((b, i) => tinted[i + 1] === tinted[i] && !b.dataset.section).length;
    const pads = [...new Set(bands.map(b => px(getComputedStyle(b).paddingTop) + "/" + px(getComputedStyle(b).paddingBottom)))];
    const labels = [...layer.querySelectorAll(".field-label, .business-foundation-label")].filter(vis);
    const labelStyles = [...new Set(labels.map(l => { const s = getComputedStyle(l); return s.fontSize + " " + s.fontWeight + " " + s.textTransform; }))];
    const numbers = [...layer.querySelectorAll("input.number-cell, .number-cell input")].filter(vis).map(n => Math.round(r(n).width));
    const dividers = [...layer.querySelectorAll(".business-capability-card-rule")].filter(vis).map(d => Math.round(r(d).height) + (d.classList.contains("business-capability-card-rule-double") ? "d" : ""));
    const lastBand = bands[bands.length - 1];
    const endGap = lastBand ? Math.round(r(layer).bottom - r(lastBand).bottom) : null;
    const tab = [...document.querySelectorAll(".carousel-rail.carousel-rail-tab")].filter(vis).pop();
    const titles = [...layer.querySelectorAll(".legal-entity-org-section > .legal-entity-label-info [role=heading], .business-group-fold-head, .section-tile-dialog-title, .dialog-heading")].filter(vis).length;
    return {
        w: Math.round(r(layer).width), radius: cs.borderTopLeftRadius, shadow: cs.boxShadow === "none" ? "none" : "yes", border: cs.borderTopWidth + " " + cs.borderTopStyle,
        nameH: name ? Math.round(r(name).height) : null, xSize: x ? Math.round(r(x).width) : null, nameToX: name && x ? Math.round(r(x).left - r(name).right) : null,
        bands: bands.length, sameNeighbours, pads: pads.join(","), labelStyles: labelStyles.join(" | "), numbers: [...new Set(numbers)].join(","), dividers: [...new Set(dividers)].join(","),
        endGap, endColour: cs.backgroundColor === (lastBand ? getComputedStyle(lastBand).backgroundColor : "") ? "same" : "differs", titles,
        tab: tab ? Math.round(r(tab).width) + "w " + getComputedStyle(tab).paddingTop : "none"
    };
};

const rows = [];
for (const [w, h] of [[1366, 768], [1920, 1080]]) for (const ex of ["lumen-and-loom-studio", "quillfield-automation-llc"]) for (const [system, pageNames] of PAGES) for (const pageName of pageNames) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await seedExample(page, base, readFileSync(new URL("../../../src/data/examples/" + ex + ".json", import.meta.url), "utf8"));
    if (!(await openPage(page, base, system, pageName))) { await ctx.close(); continue; }
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "sepia"));
    const tiles = () => [...document.querySelectorAll("button.section-tile:not(.card-tile)")].filter(e => !e.closest(".section-tile-overlay"));
    const names = await page.evaluate(`(${tiles})().map(e => (e.getAttribute("aria-label") || e.textContent).trim().split(",")[0].slice(0, 30))`);
    for (let i = 0; i < names.length; i++) {
        if (i > 0) { await openPage(page, base, system, pageName); await page.evaluate(() => document.documentElement.setAttribute("data-theme", "sepia")); }
        try {
            const hit = await page.evaluate(`(() => { const t = (${tiles})()[${i}]; t?.click(); return !!t; })()`);
            if (!hit) continue;
            await page.waitForTimeout(900); await page.mouse.move(0, 0);
            const where = [w + "x" + h, ex.slice(0, 5), pageName.replace(/\^\d\\\. /, ""), names[i]].join(" | ");
            const d = await page.evaluate(measure, "dialog");
            if (d) rows.push([where + " (dialog)", d]);
            const opened = await page.evaluate(() => { const o = [...document.querySelectorAll(".section-tile-overlay")].pop(); if (!o) return false; const c = [...o.querySelectorAll(".section-tile-link, button.card-tile, .picture-box")].find(e => !e.closest(".section-tile-slot-plus")); if (c) { c.click(); return true; } return false; });
            await page.waitForTimeout(1100); await page.mouse.move(0, 0);
            const c = opened ? await page.evaluate(measure, "card") : null;
            if (c) rows.push([where + " (card)", c]);
        } catch (e) { rows.push([names[i], { error: String(e).slice(0, 80) }]); }
    }
    await ctx.close();
}
writeFileSync(out, JSON.stringify(rows, null, 0));
console.log("rows", rows.length);
await browser.close();
