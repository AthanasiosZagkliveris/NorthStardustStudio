/*
    THE LAYOUT CHECK (docs/ai/layout-rules.md): every Foundation page,
    every card unfolded, at 1920, 1366 and 768, in light and dark,
    checked by layout-probe.js against the rulebook. Any failure fails.

    Run it with the dev server up (npm run dev) and an Organization
    open -- the two examples in docs/examples are the reference:

        npx playwright test is not needed: this is a plain script.
        node scripts/layout-check/run.mjs            (needs the
                                                     "playwright" package)

    or, from an agent's Playwright browser tool, paste the body of
    runLayoutCheck with `page` bound (see docs/ai/layout-rules.md, "Run
    the check").

    It prints the failures as JSON lines, and exits 1 if there are any.
*/

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const SPEC = {
    /** From the end of a card's number ("1.", or "1. Goal") to its name: the one gap. */
    numberToName: 8,
    /** The closed set of control widths (XS, Code / Date, S, M, L); a control may also fill its column or its container. */
    widths: [80, 160, 220, 300, 420],
    /** The square variant: as wide as a control is tall (a Text Hierarchy px box). */
    square: 45,
    /** Every card's and section box's inner side margin (--card-padding). */
    cardPadding: 12,
    /** The one single-line control height. */
    controlHeight: 45,
    tolerance: 0.5
};

export const PAGES = [
    // Each name is matched from the start of the page's button ("1. Definition"),
    // so "Foundation" does not also find "Financial Foundation".
    ["Identity System", ["^1\\. Definition", "^2\\. Ethics", "Legal Entity", "Founders Profile"]],
    ["Brand System", ["Ambassador", "Style", "Inventory"]],
    ["Business System", ["^1\\. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"]],
    ["Strategy System", ["Situation", "Goals", "Roadmap"]]
];

export const WIDTHS = [1920, 1366, 768];
export const THEMES = ["light", "dark"];

/** Opens a page of a System, from the System list. */
async function openPage(page, base, system, pageName) {
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
    if (!(await target.count())) {
        return false;
    }
    await target.click();
    await page.waitForTimeout(800);
    // Every card open: "Expand all", then any arrow still folded.
    for (let round = 0; round < 3; round++) {
        for (const button of await page.getByRole("button", { name: /^(Expand all|Maximize)/ }).all()) {
            try {
                await button.click({ timeout: 400 });
            } catch {
                // Gone as another opened.
            }
        }
        await page.waitForTimeout(250);
    }
    return true;
}

/** An example Organization (docs/examples) put in the browser's storage and opened. */
export async function seedExample(page, base, exampleText) {
    const example = JSON.parse(exampleText);
    await page.goto(base + "/");
    await page.evaluate(org => {
        localStorage.setItem("northstardust-organization-" + org.id, JSON.stringify(org));
        const list = JSON.parse(localStorage.getItem("northstardust-organizations") || "[]");
        if (!list.some(entry => entry.id === org.id)) {
            list.push({ id: org.id, name: org.name, createdAt: org.createdAt });
        }
        localStorage.setItem("northstardust-organizations", JSON.stringify(list));
        localStorage.setItem("northstardust-selected-organization", org.id);
    }, example);
}

/**
 * ONE SET OF REACTIONS PER KIND OF ELEMENT (docs/ai/layout-rules.md,
 * "Interactions"): up to `sample` of each kind on the page is hovered,
 * and what changes is compared with the kind's rule. A kind that does not
 * react, or reacts differently, fails.
 */
export const REACTIONS = [
    // A tick box: under the pointer, the box's glow ring.
    { kind: "tick box", selector: "input[type=checkbox]:not(:disabled)", property: "boxShadow", on: "self" },
    // A box you write into: its edge takes the primary colour. (An image's
    // name and description react as their one holder, .brand-image-text.)
    { kind: "text box", selector: "input.interview-input:not([type=checkbox]):not(:disabled):not(:focus):not(.brand-image-text *), textarea.interview-input:not(:disabled):not(:focus):not(.brand-image-text *)", property: "borderColor", on: "self" },
    { kind: "text holder", selector: ".brand-image-text", property: "borderColor", on: "self" },
    // A picker: its edge, as a box you write into.
    { kind: "picker", selector: ".option-picker-trigger:not(:disabled)", property: "borderColor", on: "self" },
    // An add button: its ground.
    { kind: "add button", selector: ".strategy-add-button:not(:disabled)", property: "backgroundColor", on: "self" },
    // A card's ×: its ground.
    { kind: "remove", selector: ".strategy-box-remove:not(:disabled)", property: "backgroundColor", on: "self" },
    // A fold arrow: its ground.
    { kind: "fold arrow", selector: ".strategy-box-toggle", property: "backgroundColor", on: "self" }
];

export async function checkReactions(page, where, sample = 3) {
    const failures = [];
    for (const reaction of REACTIONS) {
        const elements = await page.locator(reaction.selector).all();
        let tried = 0;
        for (const element of elements) {
            if (tried >= sample) {
                break;
            }
            if (!(await element.isVisible())) {
                continue;
            }
            tried++;
            await page.mouse.move(1, 1);
            await page.waitForTimeout(60);
            const rest = await element.evaluate((node, property) => getComputedStyle(node)[property], reaction.property);
            try {
                await element.hover({ timeout: 800 });
            } catch {
                continue;
            }
            await page.waitForTimeout(260);
            const hovered = await element.evaluate((node, property) => getComputedStyle(node)[property], reaction.property);
            if (hovered === rest) {
                failures.push({ page: where, rule: "reacts on hover: " + reaction.kind, where: await element.evaluate(node => node.getAttribute("aria-label") || node.className), detail: { property: reaction.property, rest, hovered } });
            }
        }
    }
    await page.mouse.move(1, 1);
    return failures;
}

/** The whole check: a list of failures (empty is a pass). */
export async function runLayoutCheck(page, { base = "http://localhost:1420", probe, pages = PAGES, widths = WIDTHS, themes = THEMES } = {}) {
    const failures = [];
    for (const [system, names] of pages) {
        for (const name of names) {
            if (!(await openPage(page, base, system, name))) {
                failures.push({ page: system + " › " + name, rule: "page opens", detail: "not found" });
                continue;
            }
            await page.addScriptTag({ content: probe });
            await page.setViewportSize({ width: 1920, height: 1000 });
            failures.push(...(await checkReactions(page, system + " › " + name)));
            for (const theme of themes) {
                await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
                for (const width of widths) {
                    await page.setViewportSize({ width, height: 1000 });
                    await page.waitForTimeout(300);
                    const found = await page.evaluate(spec => window.__layoutProbe.check(spec), SPEC);
                    failures.push(...found.map(failure => ({ page: system + " › " + name, theme, width, ...failure })));
                }
            }
        }
    }
    return failures;
}

// As a script: node scripts/layout-check/run.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const probe = readFileSync(new URL("./layout-probe.js", import.meta.url), "utf8");
    const base = process.env.BASE_URL ?? "http://localhost:1420";
    const failures = [];
    for (const example of ["lumen-and-loom-studio.json", "quillfield-automation-llc.json"]) {
        await seedExample(page, base, readFileSync(new URL("../../docs/examples/" + example, import.meta.url), "utf8"));
        failures.push(...(await runLayoutCheck(page, { base, probe })).map(failure => ({ example, ...failure })));
    }
    await browser.close();
    failures.forEach(failure => console.log(JSON.stringify(failure)));
    console.log(failures.length === 0 ? "Layout check: 0 failures." : "Layout check: " + failures.length + " failures.");
    process.exit(failures.length === 0 ? 0 : 1);
}
