/*
    THE LAYOUT CHECK (docs/ai/layout-rules.md): every Foundation page,
    every card unfolded, at 1920, 1366 and 768, in light and dark,
    checked by layout-probe.js against the rulebook. Any failure fails.

    Run it with the dev server up (npm run dev) and an Organization
    open -- the two examples in src/data/examples are the reference:

        npx playwright test is not needed: this is a plain script.
        node scripts/layout-check/run.mjs            (needs the
                                                     "playwright" package)

    or, from an agent's Playwright browser tool, paste the body of
    runLayoutCheck with `page` bound (see docs/ai/layout-rules.md, "Run
    the check").

    It prints the failures as JSON lines, and exits 1 if there are any.
*/

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The findings known today (see the end of this file): the check fails only on one that is not in it. */
const STANDARD_BASELINE_FILE = fileURLToPath(new URL("./baseline.json", import.meta.url));

export const SPEC = {
    /** From the end of a card's number ("1.", or "1. Goal") to its name: the one gap. */
    numberToName: 8,
    /** The closed set of control widths (XS, Code, Date, S, M, L); a control may also fill its column or its container. */
    widths: [80, 128, 170, 220, 300, 420],
    /** The square variant: as wide as a control is tall (a Text Hierarchy px box). */
    square: 45,
    /** A label to its control (--space-label), and one field or row to the next (--space-field). */
    labelGap: 6,
    fieldGap: 12,
    /** Every card's and section box's inner side margin (--card-padding). */
    cardPadding: 12,
    /** The one single-line control height. */
    controlHeight: 45,
    tolerance: 0.5
};

export const PAGES = [
    // Each name is matched from the start of the page's button ("1. Definition"),
    // so "Foundation" does not also find "Financial Foundation".
    ["Identity System", ["^1\\. Definition", "^2\\. Organization"]],
    ["Brand System", ["Brand System"]],
    ["Business System", ["^1\\. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"]],
    ["Strategy System", ["Strategy System"]]
];

export const WIDTHS = [1920, 1366, 768];
export const THEMES = ["light", "dark"];

/** A window is [width, height]; the standard check keeps the height at 1000. */
export const SIZES = WIDTHS.map(width => [width, 1000]);

/**
 * THE WIDE CHECK (--wide): all three reading modes (sepia too) and the screen classes of the website's profiles and of the minimum width
 * (768): Tablet 768 and 1024 wide; Laptop 1200 and wider and lower than 1250 (the 1440 x 864 and 1440 x 1024 reference cases, and 1366 x 768,
 * the common laptop); Desktop 1200 and wider and 1250 or higher. Its findings are kept in baseline-wide.json, apart from the standard baseline.
 */
export const WIDE_THEMES = ["light", "sepia", "dark"];
export const WIDE_SIZES = [[768, 1024], [1024, 768], [1366, 768], [1440, 864], [1440, 1024], [1920, 1000], [1920, 1300]];

/** Opens a page of a System, from the System list. */
export async function openPage(page, base, system, pageName) {
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
    // (Pressed in the page, not with the mouse: a fixed footer or tab over the rail must not make the check crash.)
    await target.evaluate(node => node.click());
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

/** An example Organization (src/data/examples) put in the browser's storage and opened. */
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
    { kind: "remove", selector: ".strategy-box-remove:not(:disabled)", property: "backgroundColor", on: "self", same: true },
    // A fold arrow: its ground.
    { kind: "fold arrow", selector: ".strategy-box-toggle", property: "backgroundColor", on: "self" }
];

export async function checkReactions(page, where, sample = 3) {
    const failures = [];
    for (const reaction of REACTIONS) {
        const elements = await page.locator(reaction.selector).all();
        let tried = 0;
        // Every one of a kind reacts the SAME way (one hovered value).
        const hoveredValues = new Map();
        for (const element of elements) {
            if (tried >= (reaction.same ? sample * 4 : sample)) {
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
            } else if (reaction.same) {
                hoveredValues.set(hovered, await element.evaluate(node => node.getAttribute("aria-label") || node.className));
            }
        }
        if (hoveredValues.size > 1) {
            failures.push({ page: where, rule: "one reaction per kind: " + reaction.kind, detail: Object.fromEntries([...hoveredValues].map(([value, name]) => [name, value])) });
        }
    }
    await page.mouse.move(1, 1);
    return failures;
}

/**
 * THE ONE x (docs/ai/layout-rules.md, "Interactions"): every remove
 * button looks as a Legal Entity card's does, at rest, under the pointer
 * and focused -- its square, edge, corners, ground, colour, ring and its
 * drawn X (the two bars). The look of one x, in those three states.
 */
const REMOVE_LOOK = ["width", "height", "borderTopWidth", "borderTopStyle", "borderTopColor", "borderRadius", "backgroundColor", "color", "boxShadow", "outlineStyle", "cursor", "transitionProperty", "transitionDuration", "paddingTop", "paddingLeft", "display", "alignItems", "justifyContent"];
const REMOVE_BARS = ["width", "height", "backgroundColor", "transform", "borderRadius", "top", "left", "marginTop", "marginLeft"];

async function removeLook(page, element) {
    const read = () => element.evaluate((node, [look, bars]) => {
        const style = getComputedStyle(node);
        const out = {};
        for (const property of look) {
            out[property] = style[property];
        }
        for (const pseudo of ["::before", "::after"]) {
            const bar = getComputedStyle(node, pseudo);
            for (const property of bars) {
                out[pseudo + property] = bar[property];
            }
        }
        return out;
    }, [REMOVE_LOOK, REMOVE_BARS]);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(250);
    const rest = await read();
    await element.scrollIntoViewIfNeeded({ timeout: 2000 });
    await element.hover({ timeout: 2000, force: true });
    await page.waitForTimeout(300);
    const hover = await read();
    await page.mouse.move(1, 1);
    await page.keyboard.press("Shift");
    await element.focus();
    await page.waitForTimeout(300);
    const focus = await read();
    await element.evaluate(node => node.blur());
    return { rest, hover, focus };
}

async function checkRemoveLook(page, where, reference, sample = 12) {
    const failures = [];
    let tried = 0;
    for (const element of await page.locator(".strategy-box-remove:not(:disabled)").all()) {
        if (tried >= sample) {
            break;
        }
        if (!(await element.isVisible())) {
            continue;
        }
        tried++;
        let look;
        try {
            look = await removeLook(page, element);
        } catch {
            continue;
        }
        const differs = {};
        for (const state of ["rest", "hover", "focus"]) {
            for (const [property, value] of Object.entries(reference[state])) {
                if (look[state][property] !== value) {
                    differs[state + " " + property] = [value, look[state][property]];
                }
            }
        }
        if (Object.keys(differs).length) {
            failures.push({ page: where, rule: "the one x (as a Legal Entity card's)", where: await element.evaluate(node => node.getAttribute("aria-label") || node.className), detail: differs });
        }
    }
    await page.mouse.move(1, 1);
    return failures;
}

/**
 * THE REAL MOUSE ON THE LIST ITEMS OF THE PAGE TILES (3. Infrastructure & Capability; docs/ai/layout-rules.md, "The page tile's slot"): every
 * list item of every tile of a group's FIRST ROW, with the page scrolled to its top, is pressed with real mouse events (move, down, up -- not a
 * scripted click). A tile grows to 150% under the pointer; the press moves the focus; the old code measured the tile again then (the tile already
 * grown, its transition still on its first frame), took another origin and slid the tile under the pointer between the press and the release, so
 * the click never landed -- worst on the tiles whose origin is moved to keep them inside the card (the first row of Offering's Capability in a low
 * window, Infrastructure's Activities near the foot of its card). Each press must: not move the item under the pointer (0.5px), open its card or
 * dialog, and -- on Escape -- return to the default page: no tile grown, no focus ring on the opener (a mouse opened it). One opened with the keyboard
 * keeps its ring, and still no tile grown.
 */
export async function checkRealMouse(page, where) {
    const failures = [];
    const fail = (rule, detail) => failures.push({ page: where, rule, detail });
    const count = await page.locator(".section-tile-slot").count();
    const page3 = () => page.evaluate(() => {
        const grown = [...document.querySelectorAll(".section-tile-slot")].filter(slot => getComputedStyle(slot).transform !== "none").map(slot => slot.querySelector(".section-tile-title").textContent);
        const active = document.activeElement;
        return {
            grown,
            open: !!document.querySelector(".floating-card-host, .section-tile-dialog"),
            ring: active && active !== document.body ? { tag: active.tagName, text: (active.textContent || "").slice(0, 30), visible: active.matches(":focus-visible"), outline: getComputedStyle(active).outlineStyle }  : null
        };
    });
    const close = async () => {
        for (let round = 0; round < 4 && (await page3()).open; round++) {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(250);
        }
    };
    let keyboardDone = false;
    for (let at = 0; at < count; at++) {
        const info = await page.locator(".section-tile-slot").nth(at).evaluate(node => ({ title: node.querySelector(".section-tile-title").textContent, row: node.getAttribute("data-row"), links: node.querySelectorAll("button.section-tile-link").length }));
        if (info.row !== "0") {
            continue;
        }
        for (let k = 0; k < info.links; k++) {
            await close();
            await page.mouse.move(1, 1);
            await page.evaluate(() => document.querySelectorAll(".card-scroll").forEach(body => { body.scrollTop = 0; }));
            await page.waitForTimeout(200);
            const link = page.locator(".section-tile-slot").nth(at).locator("button.section-tile-link").nth(k);
            // (The squeezed Inventory / Completed row shows titles only: its list items are not drawn.)
            if (await page.locator(".section-tiles-completed[data-squeezed] .section-tile-slot").nth(0).count() && (await link.evaluate(node => !!node.closest(".section-tiles-completed[data-squeezed]")))) {
                continue;
            }
            const name = info.title + " > item " + (k + 1);
            let box = await link.boundingBox();
            if (!box) {
                fail("a list item of a first-row tile has a box at the top of the page", { item: name });
                continue;
            }
            // (An item below the foot of its card's scrolling body at the top of the page is out of reach until the card is scrolled: not tried.)
            const inView = await link.evaluate(node => {
                const body = node.closest(".card-scroll");
                const at = node.getBoundingClientRect();
                const room = body ? body.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
                return at.top + at.height / 2 > room.top && at.top + at.height / 2 < room.bottom;
            });
            if (!inView) {
                continue;
            }
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(450);
            box = await link.boundingBox();
            if (!box) {
                fail("a list item of a first-row tile stays in view under the pointer", { item: name });
                continue;
            }
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            const before = await link.boundingBox();
            await page.mouse.down();
            const during = await link.boundingBox();
            await page.mouse.up();
            await page.waitForTimeout(350);
            if (before && during && Math.abs(before.x - during.x) + Math.abs(before.y - during.y) > 0.5) {
                fail("a press on a list item does not move it from under the pointer", { item: name, before: [before.x, before.y], during: [during.x, during.y] });
            }
            const opened = await page3();
            if (!opened.open) {
                fail("a real click on a list item of a first-row tile opens its card", { item: name });
                continue;
            }
            await page.keyboard.press("Escape");
            await page.waitForTimeout(250);
            await close();
            const after = await page3();
            if (after.grown.length > 0) {
                fail("closing returns to the default page: no tile stays grown", { item: name, grown: after.grown });
            }
            if (after.ring && after.ring.visible && after.ring.outline !== "none") {
                fail("closing a mouse-opened card draws no ring on its opener", { item: name, ring: after.ring });
            }
            // Once: opened with the keyboard (Enter), the opener keeps its ring and no tile grows.
            if (!keyboardDone) {
                keyboardDone = true;
                await page.mouse.move(1, 1);
                await link.focus();
                await page.keyboard.press("Shift+Tab");
                await page.keyboard.press("Tab");
                await page.keyboard.press("Enter");
                await page.waitForTimeout(350);
                if (!(await page3()).open) {
                    fail("Enter on a list item opens its card", { item: name });
                } else {
                    await page.keyboard.press("Escape");
                    await page.waitForTimeout(300);
                    await close();
                    const back = await page3();
                    if (back.grown.length > 0) {
                        fail("closing a keyboard-opened card grows no tile", { item: name, grown: back.grown });
                    }
                    if (!back.ring || !back.ring.visible || back.ring.outline === "none") {
                        fail("closing a keyboard-opened card leaves the ring on its opener", { item: name, ring: back.ring });
                    }
                }
            }
        }
    }
    await close();
    await page.mouse.move(1, 1);
    return failures;
}

/** The whole check: a list of failures (empty is a pass). */
export async function runLayoutCheck(page, { base = "http://localhost:1420", probe, pages = PAGES, widths, sizes = (widths ?? WIDTHS).map(width => [width, 1000]), themes = THEMES } = {}) {
    const failures = [];
    // The reference x: the first Legal Entity card's.
    let referenceX = null;
    if (await openPage(page, base, "Identity System", "^2\\. Organization")) {
        const card = page.locator(".legal-entity-card .strategy-box-remove").first();
        if (await card.count()) {
            referenceX = await removeLook(page, card);
        }
    }
    for (const [system, names] of pages) {
        for (const name of names) {
            if (!(await openPage(page, base, system, name))) {
                failures.push({ page: system + " › " + name, rule: "page opens", detail: "not found" });
                continue;
            }
            await page.addScriptTag({ content: probe });
            await page.setViewportSize({ width: 1920, height: 1000 });
            failures.push(...(await checkReactions(page, system + " › " + name)));
            if (referenceX) {
                failures.push(...(await checkRemoveLook(page, system + " › " + name, referenceX)));
            }
            for (const theme of themes) {
                await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
                for (const [width, height] of sizes) {
                    await page.setViewportSize({ width, height });
                    await page.waitForTimeout(300);
                    // The page as drawn, then every section tile's dialog opened in turn
                    // (a page with no tiles is just the page).
                    const found = await page.evaluate(spec => window.__layoutProbe.checkWithTiles(spec), SPEC);
                    failures.push(...found.map(failure => ({ page: system + " › " + name, theme, width, ...(height !== 1000 ? { height } : {}), ...failure })));
                }
            }
            // The real mouse on the list items of the first-row tiles (3. Infrastructure & Capability), in a tall and a low window.
            if (/Infrastructure/.test(name)) {
                await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
                for (const [width, height] of [[1366, 1000], [1366, 700], [1920, 1000]]) {
                    await page.setViewportSize({ width, height });
                    await page.waitForTimeout(300);
                    failures.push(...(await checkRealMouse(page, system + " › " + name + " (" + width + " x " + height + ")")));
                }
            }
        }
    }
    return failures;
}

// As a script: node scripts/layout-check/run.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
    const page = await browser.newPage();
    const probe = readFileSync(new URL("./layout-probe.js", import.meta.url), "utf8");
    const base = process.env.BASE_URL ?? "http://localhost:1420";
    const failures = [];
    // A quick run: CHECK_PAGES="Customer Engagement,Roadmap" CHECK_WIDTHS=1920 CHECK_THEMES=light CHECK_EXAMPLES=lumen node scripts/layout-check/run.mjs
    // --quick: the one setting the baseline is made at (the Quillfield example, 1920 wide, the light page); the full check is the same command without it.
    if (process.argv.includes("--quick")) {
        process.env.CHECK_WIDTHS ??= "1920";
        process.env.CHECK_THEMES ??= "light";
        process.env.CHECK_EXAMPLES ??= "quillfield";
    }
    const only = (name) => process.env[name]?.split(",").map(entry => entry.trim()).filter(Boolean);
    const pageFilter = only("CHECK_PAGES");
    const pages = pageFilter ? PAGES.map(([system, names]) => [system, names.filter(name => pageFilter.some(entry => name.includes(entry)))]).filter(([, names]) => names.length > 0) : PAGES;
    // --wide: the three reading modes and the screen classes (WIDE_SIZES); CHECK_SIZES="768x1024,1440x864" picks the windows by hand.
    const wide = process.argv.includes("--wide");
    const sizeText = only("CHECK_SIZES")?.map(entry => entry.split("x").map(Number));
    const widths = only("CHECK_WIDTHS")?.map(Number);
    const sizes = sizeText ?? (widths ? widths.map(width => [width, 1000]) : wide ? WIDE_SIZES : SIZES);
    const themes = only("CHECK_THEMES") ?? (wide ? WIDE_THEMES : THEMES);
    const exampleFilter = only("CHECK_EXAMPLES");
    for (const example of ["lumen-and-loom-studio.json", "quillfield-automation-llc.json"].filter(name => !exampleFilter || exampleFilter.some(entry => name.includes(entry)))) {
        await seedExample(page, base, readFileSync(new URL("../../src/data/examples/" + example, import.meta.url), "utf8"));
        failures.push(...(await runLayoutCheck(page, { base, probe, pages, sizes, themes })).map(failure => ({ example, ...failure })));
    }
    await browser.close();
    // THE BASELINE: the findings known today (BASELINE_FILE). The check fails only on a finding that is NOT in it, so it can run after every change; a finding that is gone is said, and the baseline is rewritten with --write-baseline.
    // (A card made by a "+" gets a random id each run: an id -- eight letters and digits after a hyphen -- is not part of a finding's key.)
    const plain = text => text.replace(/(?<=-)[a-z0-9]{8}(?![a-z0-9])/g, "~");
    const BASELINE_FILE = wide ? fileURLToPath(new URL("./baseline-wide.json", import.meta.url)) : STANDARD_BASELINE_FILE;
    const keyOf = failure => plain([failure.example, failure.page, failure.theme, failure.width, ...(failure.height ? [failure.height] : []), failure.rule, failure.where, failure.tile].join("|"));
    if (process.argv.includes("--write-baseline")) {
        const merged = new Map();
        if (existsSync(BASELINE_FILE)) {
            // (A run of some pages only keeps the others' findings.)
            for (const entry of JSON.parse(readFileSync(BASELINE_FILE, "utf8"))) {
                merged.set(entry.key, entry);
            }
            const ran = new Set(failures.map(failure => failure.example + "|" + failure.page));
            for (const [key, entry] of [...merged]) {
                if (ran.has(entry.example + "|" + entry.page)) {
                    merged.delete(key);
                }
            }
        }
        failures.forEach(failure => merged.set(keyOf(failure), { key: keyOf(failure), example: failure.example, page: failure.page, rule: failure.rule }));
        writeFileSync(BASELINE_FILE, JSON.stringify([...merged.values()], null, 1) + "\n");
        console.log("Baseline written: " + merged.size + " known findings.");
        process.exit(0);
    }
    const known = existsSync(BASELINE_FILE) && !process.argv.includes("--no-baseline") ? new Set(JSON.parse(readFileSync(BASELINE_FILE, "utf8")).map(entry => plain(entry.key))) : null;
    const shown = known ? failures.filter(failure => !known.has(keyOf(failure))) : failures;
    shown.forEach(failure => console.log(JSON.stringify(failure)));
    if (known) {
        const now = new Set(failures.map(keyOf));
        const ran = new Set(failures.map(failure => failure.example + "|" + failure.page));
        const gone = JSON.parse(readFileSync(BASELINE_FILE, "utf8")).filter(entry => ran.has(entry.example + "|" + entry.page) && !now.has(plain(entry.key))).length;
        console.log("Layout check: " + shown.length + " NEW findings (" + (failures.length - shown.length) + " known in the baseline" + (gone > 0 ? ", " + gone + " of the baseline gone: rewrite it with --write-baseline" : "") + ").");
    } else {
        console.log(failures.length === 0 ? "Layout check: 0 failures." : "Layout check: " + failures.length + " failures.");
    }
    process.exit(shown.length === 0 ? 0 : 1);
}
