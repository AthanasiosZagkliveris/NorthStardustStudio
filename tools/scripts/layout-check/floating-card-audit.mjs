/**
 * THE AUDIT OF A FLOATING CARD OF QUESTIONS (docs/ai/tile-and-card-pattern.md, "A floating card of questions"): the Profile card is the model, and a new card of this kind is run
 * through this before it is called done. It opens the card in the running app (a Vite server on BASE_URL, 1420 by default), in light, sepia and dark and at two widths, and checks:
 *   width and reflow; the one content line; bands, lines and rules from side to side; bands flush; rules (the shared double rule between sections, one line between subsections);
 *   one band pattern, by the colours drawn (under a title band the first band untinted, then the tints alternate, the Notes the next tint); heading levels that never skip; no "None of these" in an option; text 4.5:1 and a control's boundary 3:1 (measured on the pixels); targets of 24px; names; console errors.
 *
 *   node tools/scripts/layout-check/floating-card-audit.mjs
 *   CARD_PAGE="1. Foundation" CARD_SYSTEM="Business System" CARD_OPEN="The Considered Nester" EXAMPLE=lumen-and-loom-studio node tools/scripts/layout-check/floating-card-audit.mjs
 *
 * With no CARD_OPEN or EXAMPLE it audits each card of CARDS in turn: the Considered Nester, a Competitor and an Offering of the Lumen example (src/data/examples), and the Profile of the check-only fixture
 * fixtures/proxy-tutoring.json (a parent buying tutoring for a child: B2C Proxy), the two-part Profile, whose "The buyer" and "The end user" sections it also requires.
 * It lists what fails and exits 1 if anything does.
 */
import { chromium } from "playwright";
import { PNG } from "playwright-core/lib/utilsBundle";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:1420";
const SYSTEM = process.env.CARD_SYSTEM ?? "Business System";
const PAGE = process.env.CARD_PAGE ?? "1. Foundation";
/** The cards audited by default: an example's card, then a fixture's (./fixtures, never one of the examples: no test reads it). `parts`: the section headings the card must show. */
const CARDS = [
    { open: "The Considered Nester", file: new URL("../../../src/data/examples/lumen-and-loom-studio.json", import.meta.url) },
    // The Competitor and the Offering cards of the same Segment: the one band pattern holds on every card of the Foundation page.
    { open: "Independent weavers on Etsy & at craft markets", file: new URL("../../../src/data/examples/lumen-and-loom-studio.json", import.meta.url) },
    { open: "Handwoven Homeware Collection", file: new URL("../../../src/data/examples/lumen-and-loom-studio.json", import.meta.url) },
    { open: "The Worried Working Parent", file: new URL("./fixtures/proxy-tutoring.json", import.meta.url), parts: ["The buyer", "The end user"] }
];
const chosen = process.env.CARD_OPEN || process.env.EXAMPLE
    ? [{ open: process.env.CARD_OPEN ?? "The Considered Nester", file: new URL("../../../src/data/examples/" + (process.env.EXAMPLE ?? "lumen-and-loom-studio") + ".json", import.meta.url) }]
    : CARDS;
const RUNS = [["sepia", 1440], ["light", 1440], ["dark", 1440], ["sepia", 520]];

const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const ratio = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

/** The structure of the open card, read in the page. */
const structure = () => {
    const out = [];
    const fail = (rule, detail) => out.push(rule + " [" + detail + "]");
    const card = document.querySelector(".floating-card-body .business-foundation-card");
    if (!card) { fail("card", "no floating card is open"); return out; }
    const cr = card.getBoundingClientRect(), host = document.querySelector(".floating-card-body").getBoundingClientRect();
    const name = card.querySelector(".strategy-name-input")?.getBoundingClientRect();
    const line = name ? name.right : cr.right - 57, left = name ? name.left : cr.left + 13;
    if (Math.round(host.width) > Math.min(492, innerWidth - 16)) fail("width", Math.round(host.width) + "px");
    if (document.documentElement.scrollWidth > innerWidth) fail("reflow", "the page scrolls sideways");
    // the one content line
    const content = [...card.querySelectorAll("textarea, input:not([type=checkbox]):not([type=radio]), label.radio-choice-option, .business-foundation-tick, .numbered-list, .optional-field, .field-label")].filter(e => e.getBoundingClientRect().width > 0 && !e.closest(".strategy-box-head"));
    const over = content.filter(e => e.getBoundingClientRect().right > line + 1), under = content.filter(e => e.getBoundingClientRect().left < left - 1);
    if (over.length) fail("content line", over.length + " pass the right edge of the name cell: " + over[0].textContent.trim().slice(0, 30));
    if (under.length) fail("content left", under.length + " left of the name cell");
    // bands, section heads, rules and the lines under labels run from side to side
    const sides = e => { const r = e.getBoundingClientRect(); return Math.round(r.left - cr.left) + "/" + Math.round(cr.right - r.right); };
    const wide = [...card.querySelectorAll(".business-segment-box > .legal-entity-org-section, :scope > .business-group-fold-head, .business-capability-card-rule-double, .business-segment-grid-single .legal-entity-org-section")];
    const labelLines = [...card.querySelectorAll(".legal-entity-label-info")].filter(e => getComputedStyle(e).borderBottomStyle !== "none" && getComputedStyle(e).borderBottomWidth !== "0px");
    const off = [...wide, ...labelLines].filter(e => sides(e) !== "1/1");
    if (off.length) fail("side to side", off.length + " off, e.g. " + sides(off[0]));
    // flush bands
    const gaps = [];
    for (const box of card.querySelectorAll(".business-segment-box")) { const k = [...box.children]; for (let i = 1; i < k.length; i++) { const g = Math.round(k[i].getBoundingClientRect().top - k[i - 1].getBoundingClientRect().bottom); if (g) gaps.push(g); } }
    if (gaps.length) fail("flush bands", "gaps " + gaps.slice(0, 5).join(","));
    // rules: the double rule is the shared component (4px, two 1px lines), only between sections; one line between subsections
    const section = [...card.querySelectorAll(":scope > .business-profile-section-rule")], sub = [...card.querySelectorAll(".business-segment-grid-single .business-capability-card-rule-double")];
    if (section.some(r => Math.round(r.getBoundingClientRect().height) !== 4)) fail("section rule", "not the shared double rule (4px)");
    if (sub.some(r => Math.round(r.getBoundingClientRect().height) !== 1)) fail("subsection line", "not one line");
    // heading levels never skip
    const levels = [...card.querySelectorAll("[role=heading]")].map(h => Number(h.getAttribute("aria-level")));
    if (levels.some((l, i) => i > 0 && l - levels[i - 1] > 1) || (levels[0] ?? 3) !== 3) fail("heading levels", levels.join(""));
    // label rows: no blank line under a label, no line under a label over a text holder or beside a cell
    const tall = [...card.querySelectorAll(".legal-entity-pair > .legal-entity-label-info")].filter(h => { const t = h.querySelector(".field-label"); return t && h.getBoundingClientRect().height - t.getBoundingClientRect().height > 20 && !h.parentElement.querySelector(":scope > .business-profile-age"); });
    if (tall.length) fail("blank under label", tall.length + " label rows taller than their words");
    const lined = [...card.querySelectorAll(".legal-entity-pair")].filter(p => p.querySelector(":scope > .numbered-list, :scope > .business-profile-age, :scope > textarea") && getComputedStyle(p.querySelector(".legal-entity-label-info")).borderBottomWidth !== "0px");
    if (lined.length) fail("line under a label over a text holder", String(lined.length));
    // a cell beside its label has equal room above and below
    for (const cell of card.querySelectorAll(".business-profile-age")) { const a = cell.getBoundingClientRect(), b = cell.closest(".legal-entity-org-section").getBoundingClientRect(); if (Math.round(a.top - b.top) !== Math.round(b.bottom - a.bottom)) fail("cell room", Math.round(a.top - b.top) + " above, " + Math.round(b.bottom - a.bottom) + " below"); if (Math.abs(a.width - a.height) > 1) fail("cell square", Math.round(a.width) + "x" + Math.round(a.height)); }
    // notes: a band of its own, the next tint, a field gap above
    for (const n of card.querySelectorAll(".business-note-band")) { if (getComputedStyle(n).paddingTop !== "12px") fail("notes gap", getComputedStyle(n).paddingTop); }
    // one band pattern, by the colours drawn (not the classes, which a rule can restyle): under a title band (a box's first band, or a section's head) the first band is untinted,
    // then each band the other tint from the one above it (the Notes included, the next tint)
    const clear = e => { const c = getComputedStyle(e).backgroundColor; return c === "transparent" || /^rgba\(.*, 0\)$/.test(c) || / \/ 0\)$/.test(c); };
    for (const run of card.querySelectorAll(".business-segment-box, .business-segment-grid > .legal-entity-field")) {
        const bands = [...run.children].filter(k => k.classList.contains("legal-entity-org-section") && k.getBoundingClientRect().height > 0);
        const list = run.classList.contains("business-segment-box") ? bands.slice(1) : bands;
        const what = e => (e.querySelector(".field-label")?.textContent ?? e.textContent).trim().slice(0, 30);
        if (list.length && !clear(list[0])) fail("band pattern", "the first band under a title is tinted: " + what(list[0]));
        for (let i = 1; i < list.length; i++) { if (clear(list[i]) === clear(list[i - 1])) fail("band pattern", "same tint as the band above: " + what(list[i])); }
    }
    // words: no "None of these" (an Other the user writes in). (The word "or" is right between two different things, a slash between similar ones: owner, 2026-11-03, docs/ai/tile-and-card-pattern.md, "Options".)
    const words = [...card.querySelectorAll(".radio-choice-option span, .business-foundation-tick-label")].map(e => e.textContent.trim()).filter(w => /None of these/.test(w));
    if (words.length) fail("option words", words.slice(0, 4).join(" | "));
    const cap = document.querySelector(".floating-card-caption")?.textContent.trim().replace(/i$/, "").trim();
    if (!cap || /s$/.test(cap)) fail("caption", "'" + cap + "' is not singular");
    const edge = getComputedStyle(card).borderTopColor; if (/ 0\.\d+\)/.test(edge)) fail("card edge", "the pale default: " + edge);
    const x = card.querySelector(".card-remove"); if (x && name && x.getBoundingClientRect().left < name.right) fail("x position", "inside the name cell");
    return out;
};

const collect = () => {
    const parse = c => { const m = c.match(/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/); const raw = (m[1] ?? m[2]).split(/[ ,\/]+/).filter(Boolean).map(Number); const u = !!m[2]; return { r: u ? raw[0] * 255 : raw[0], g: u ? raw[1] * 255 : raw[1], b: u ? raw[2] * 255 : raw[2], a: raw[3] === undefined ? 1 : raw[3] }; };
    const root = document.querySelector(".floating-card-body"); const texts = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement, cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") continue; const range = document.createRange(); range.selectNodeContents(n); const r = range.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; let op = 1; for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity); texts.push({ text: t.slice(0, 28), x: r.left, y: r.top + scrollY, w: r.width, h: r.height, color: parse(cs.color), op, size: parseFloat(cs.fontSize), bold: Number(cs.fontWeight) >= 700, disabled: !!el.closest("label:has(input:disabled)") }); }
    const controls = [...root.querySelectorAll("input, textarea, select, button, .numbered-list")].filter(c => c.getBoundingClientRect().width > 0).map(c => { const cs = getComputedStyle(c), r = c.getBoundingClientRect(); const box = c.matches("input[type=checkbox], input[type=radio]") ? (c.closest("label")?.getBoundingClientRect() ?? r) : r; const label = c.getAttribute("aria-label") || (c.labels && c.labels[0] && c.labels[0].textContent.trim()) || c.getAttribute("title") || c.textContent.trim(); return { name: (c.getAttribute("aria-label") || c.className).toString().slice(0, 34), kind: c.type || c.tagName, list: c.classList.contains("numbered-list"), row: !!c.closest(".numbered-list") && !c.classList.contains("numbered-list"), noName: !label && !c.classList.contains("numbered-list"), small: Math.min(box.width, box.height) < 24 && !c.classList.contains("numbered-list"), x: r.left, y: r.top + scrollY, w: r.width, h: r.height, disabled: c.disabled, checked: c.checked, border: parse(cs.borderTopColor), bw: cs.borderTopWidth }; });
    return { texts, controls };
};

const browser = await chromium.launch();
let failed = 0;
for (const { open: OPEN, file, parts = [] } of chosen) {
const org = JSON.parse(readFileSync(file, "utf8"));
console.log(org.name + ": " + OPEN);
for (const [theme, width] of RUNS) {
    const page = await browser.newPage({ viewport: { width, height: 7000 } });
    const errors = []; page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 100)); });
    await page.goto(BASE + "/");
    await page.evaluate(([o, theme]) => { localStorage.setItem("northstardust-theme", theme); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, [org, theme]);
    await page.goto(BASE + "/assistant"); await page.waitForTimeout(600);
    await page.getByText("Foundation", { exact: true }).first().click(); await page.waitForTimeout(250); await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: SYSTEM }).press("Enter"); await page.waitForTimeout(800);
    const start = page.getByRole("button", { name: /Start Interview/i }); if (await start.count()) { await start.first().click(); await page.waitForTimeout(600); }
    await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp("^" + PAGE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first().evaluate(n => n.click()); await page.waitForTimeout(900);
    for (let r = 0; r < 3; r++) { for (const bt of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) { try { await bt.click({ timeout: 400 }); } catch {} } await page.waitForTimeout(250); }
    await page.locator("text=" + OPEN).first().evaluate(n => n.click()); await page.waitForTimeout(3500);
    const problems = await page.evaluate(structure);
    const heads = await page.evaluate(() => [...document.querySelectorAll(".floating-card-body [role=heading]")].map(h => h.textContent.trim().replace(/i$/, "").trim()));
    const missing = parts.filter(part => !heads.includes(part));
    if (missing.length) problems.push("parts [missing: " + missing.join(", ") + "]");
    if (!problems.some(p => p.startsWith("card "))) {
        const { texts, controls } = await page.evaluate(collect);
        const withText = PNG.sync.read(await page.screenshot({ fullPage: true }));
        await page.addStyleTag({ content: "*{color:transparent !important;text-shadow:none !important;-webkit-text-fill-color:transparent !important} input,textarea{caret-color:transparent !important}" });
        const noText = PNG.sync.read(await page.screenshot({ fullPage: true }));
        const px = (png, x, y) => { const i = (Math.floor(y) * png.width + Math.floor(x)) * 4; return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] }; };
        const low = [];
        for (const t of texts) {
            if (t.disabled) continue;
            const pts = [[t.x - 2, t.y + t.h / 2], [t.x + t.w + 2, t.y + t.h / 2], [t.x + 1, t.y + 1], [t.x + t.w - 1, t.y + t.h - 1]].map(p => px(noText, p[0], p[1]));
            const bg = pts.sort((a, c) => lum(a) - lum(c))[1], a = t.color.a * t.op;
            const fg = { r: t.color.r * a + bg.r * (1 - a), g: t.color.g * a + bg.g * (1 - a), b: t.color.b * a + bg.b * (1 - a) };
            const need = (t.size >= 24 || (t.size >= 18.66 && t.bold)) ? 3 : 4.5, got = ratio(fg, bg);
            if (got < need) low.push(t.text + " " + got.toFixed(2));
        }
        if (low.length) problems.push("text contrast [" + low.slice(0, 4).join(" | ") + "]");
        const edges = [];
        for (const c of controls) {
            if (c.disabled || c.row || (["checkbox", "radio"].includes(c.kind) && c.checked)) continue;
            // a control's boundary: its own line (a box, a list) or its fill, against the ground beside it
            const ground = px(withText, c.x - 4, c.y + c.h / 2);
            const a = c.border.a, line = { r: c.border.r * a + ground.r * (1 - a), g: c.border.g * a + ground.g * (1 - a), b: c.border.b * a + ground.b * (1 - a) };
            const own = c.bw !== "0px" ? ratio(line, ground) : 0;
            if (own < 3 && !["button"].includes(c.kind)) edges.push(c.kind + " " + c.name + " " + own.toFixed(2));
        }
        if (edges.length) problems.push("control boundary under 3:1 [" + [...new Set(edges)].slice(0, 4).join(" | ") + "]");
        if (controls.some(c => c.noName)) problems.push("unnamed controls [" + controls.filter(c => c.noName).length + "]");
        if (controls.some(c => c.small)) problems.push("targets under 24px [" + controls.filter(c => c.small).length + "]");
    }
    if (errors.length) problems.push("console errors [" + errors.join(" | ") + "]");
    console.log((problems.length ? "FAIL " : "pass ") + theme + " " + width + (problems.length ? ": " + problems.join("; ") : ""));
    failed += problems.length;
    await page.close();
}
}
await browser.close();
process.exit(failed ? 1 : 0);
