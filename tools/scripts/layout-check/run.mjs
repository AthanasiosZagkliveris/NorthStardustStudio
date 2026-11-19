/*
    THE LAYOUT CHECK (docs/ai/layout-rules.md): every Foundation page,
    every card unfolded, at 1920, 1366 and 768, in light and dark,
    checked by layout-probe.js against the rulebook. Any failure fails.

    Run it with the dev server up (npm run dev) and an Organization
    open -- the two examples in src/data/examples are the reference:

        npx playwright test is not needed: this is a plain script.
        node tools/scripts/layout-check/run.mjs            (needs the
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
    /** Where a number drawn inside its name cell stands: this far in from the cell's left edge. */
    numberInName: 10,
    /** The closed set of control widths (XS, Code, Date, S, M, L); a control may also fill its column or its container. */
    widths: [80, 128, 160, 220, 300, 420],
    /** The square variant: as wide as a control is tall (a Text Hierarchy px box). */
    square: 45,
    /** A label to its control (--space-label), and one field or row to the next (--space-field). */
    labelGap: 6,
    fieldGap: 12,
    /** Every card's and section box's inner side margin (--card-padding). */
    cardPadding: 12,
    /** The one single-line control height. */
    controlHeight: 44,
    tolerance: 0.5
};

/**
 * EVERY SYSTEM OF THE APP, read from src/data/systems.ts and src/data/capabilities.ts (so a new System is found without a list to keep): [capability title,
 * System title], in the order the app lists them. The screen snapshot opens every page of each (pagesOf).
 */
export const ALL_SYSTEMS = (() => {
    const read = name => readFileSync(new URL("../../../src/data/" + name, import.meta.url), "utf8");
    const capabilities = new Map([...read("capabilities.ts").matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g)].map(m => [m[1], m[2]]));
    return [...read("systems.ts").matchAll(/title:\s*"([^"]+)",\s*capability:\s*"([^"]+)"/g)].map(m => [capabilities.get(m[2]), m[1]]);
})();

/** The pages of a System as its Pages rail names them ("Definition & Purpose", "Legal Entity", ...), opened from its capability. */
export async function pagesOf(page, base, capability, system) {
    await page.goto(base + "/assistant");
    await page.waitForTimeout(600);
    await page.getByText(capability, { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(800);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) {
        await start.first().click();
        await page.waitForTimeout(600);
    }
    const labels = await page.getByRole("navigation", { name: "Pages" }).getByRole("button").allTextContents();
    // (Each page by its NAME, whatever number the rail gives it now: ai-collaboration-rules.md, "Read the app's structure by what a thing is".)
    // (openPage matches a name after the rail's number, so the name is handed on with its pattern's characters escaped.)
    return labels.map(label => label.match(/^\d+\. (.+)$/)).filter(Boolean).map(m => m[1].trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

export const PAGES = [
    // EACH PAGE BY ITS NAME (ai-collaboration-rules.md, "Read the app's structure by what a thing is"): matched from the start of the page's
    // button after the rail's number, whatever it is ("^(\d+\. )?Foundation"), so "Foundation" does not also find "Financial Foundation".
    ["Identity System", ["Definition", "Legal Entity"]],
    ["Brand System", ["Brand System"]],
    ["Business System", ["Foundation & Engagement", "Infrastructure", "Financials"]],
    ["Strategy System", ["Strategy System"]]
];

/**
 * THE ORGANISATIONS THE CHECK OPENS: the two examples (src/data/examples, every page), then the check-only fixtures (./fixtures, only the pages each is made for). A fixture is
 * never one of the examples: no test reads it, and the app never ships it. proxy-tutoring.json is a parent buying tutoring for a child (B2C Proxy, Parent or guardian, a Minor):
 * its Foundation page draws the Profile in two parts, "The buyer" and "The end user", which neither example has.
 */
export const EXAMPLES = [
    { name: "lumen-and-loom-studio.json", file: new URL("../../../src/data/examples/lumen-and-loom-studio.json", import.meta.url) },
    { name: "quillfield-automation-llc.json", file: new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url) },
    { name: "proxy-tutoring.json", file: new URL("./fixtures/proxy-tutoring.json", import.meta.url), pages: [["Business System", ["Foundation & Engagement"]]] }
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
export async function openPage(page, base, system, pageName, capability = "Foundation") {
    await page.goto(base + "/assistant");
    await page.waitForTimeout(600);
    await page.getByText(capability, { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.locator("li.system-item", { hasText: system }).press("Enter");
    await page.waitForTimeout(800);
    const start = page.getByRole("button", { name: /Start Interview/i });
    if (await start.count()) {
        await start.first().click();
        await page.waitForTimeout(600);
    }
    const target = page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp("^(\\d+\\. )?" + pageName) }).first();
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
    // A radio: as a tick box, under the pointer the round's glow ring.
    { kind: "radio", selector: "input[type=radio]:not(:disabled)", property: "boxShadow", on: "self" },
    // A box you write into: the glow round it (R1: the edge never changes under the pointer; the primary edge is the ring's). (An image's
    // name and description react as their one holder, .brand-image-text.)
    { kind: "text box", selector: "input.interview-input:not([type=checkbox]):not(:disabled):not(:focus):not(.brand-image-text *), textarea.interview-input:not(:disabled):not(:focus):not(.brand-image-text *)", property: "boxShadow", on: "self" },
    { kind: "text holder", selector: ".brand-image-text", property: "boxShadow", on: "self" },
    // A picker: the glow, as a box you write into.
    { kind: "picker", selector: ".option-picker-trigger:not(:disabled)", property: "boxShadow", on: "self" },
    // An add button: its ground.
    { kind: "add button", selector: ".strategy-add-button:not(:disabled)", property: "backgroundColor", on: "self" },
    // A card's ×: its ground.
    { kind: "remove", selector: ".strategy-box-remove:not(:disabled)", property: "backgroundColor", on: "self", same: true },
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
                // (An item the tile's own box cuts off is not drawn: out of reach, not tried.)
                const tile = node.closest(".section-tile-slot")?.getBoundingClientRect();
                const centre = at.top + at.height / 2;
                return centre > room.top && centre < room.bottom && (!tile || (centre > tile.top && centre < tile.bottom - 4));
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
                    if (back.ring && back.ring.visible && back.ring.outline !== "none") {
                        fail("closing a keyboard-opened card draws no ring on its opener either (the owner's rule)", { item: name, ring: back.ring });
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
/**
 * EVERY CHAPTER OF A PAGE IS DRAWN ALIKE (owner, 2026-11-19 22:47 UTC+2, the Segment chapters: "the tile content is clearly smaller in chapter 2 than in chapter 1"):
 * each chapter shown in turn from the chapters' rail, at 1920 x 1000 and at 2560 x 1200, each read for its tiles' side, the gap between them, the type of their titles and
 * lists, and the content on the tiles' faces; every chapter must match the first. And the rail itself: a lit name stays inside its tab (layout rules section 10,
 * "Names whole").
 */
export async function checkChapters(page, where) {
    const failures = [];
    const rail = page.locator("nav.bullet-rail-right .bullet-rail-item");
    const count = await rail.count();
    if (count < 2) {
        return failures;
    }
    await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
    for (const [width, height] of [[1920, 1000], [2560, 1200]]) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(300);
        let first = null;
        for (let at = 0; at < count; at++) {
            await rail.nth(at).click({ force: true });
            await page.mouse.move(2, height - 2);
            await page.waitForTimeout(700);
            const read = await page.evaluate(() => {
                const shown = element => element.getBoundingClientRect().width > 0;
                const quad = [...document.querySelectorAll(".section-tiles-quad")].find(shown);
                const tiles = quad ? [...quad.querySelectorAll(".section-tile")].filter(shown) : [];
                const one = (selector) => {
                    const sizes = new Set(tiles.flatMap(tile => [...tile.querySelectorAll(selector)].map(node => getComputedStyle(node).fontSize)));
                    return [...sizes].sort().join(" ");
                };
                const out = [];
                for (const nav of document.querySelectorAll("nav.bullet-rail")) {
                    const box = nav.getBoundingClientRect();
                    const style = getComputedStyle(nav);
                    const right = box.right - (parseFloat(style.paddingRight) || 0) + 0.5;
                    const left = box.left + (parseFloat(style.paddingLeft) || 0) - 0.5;
                    for (const label of nav.querySelectorAll(".bullet-rail-item.active .bullet-rail-label")) {
                        if (getComputedStyle(label).position === "absolute") {
                            continue;
                        }
                        const edge = label.getBoundingClientRect();
                        if (edge.right > right || edge.left < left) {
                            out.push(label.textContent.trim() + " reaches " + Math.round(Math.max(edge.right - right, left - edge.left)) + "px past its tab's padding");
                        }
                    }
                }
                return {
                    side: tiles[0] ? Math.round(tiles[0].getBoundingClientRect().width) : 0,
                    gap: quad ? getComputedStyle(quad).getPropertyValue("--space-card").trim() : "",
                    large: quad ? quad.hasAttribute("data-large") : false,
                    titles: one(".section-tile-title, .card-tile-title"),
                    lists: one(".section-tile-list"),
                    rail: out
                };
            });
            read.rail.forEach(detail => failures.push({ page: where + " › chapter " + (at + 1), width, height, rule: "the rail holds its lit name", detail }));
            if (first === null) {
                first = read;
                continue;
            }
            for (const key of ["side", "gap", "large", "titles", "lists"]) {
                if (String(read[key]) !== String(first[key])) {
                    failures.push({ page: where + " › chapter " + (at + 1), width, height, rule: "every chapter is drawn alike", detail: key + ": " + read[key] + ", the first chapter's " + first[key] });
                }
            }
        }
        await rail.nth(0).click({ force: true });
        await page.waitForTimeout(300);
    }
    await page.setViewportSize({ width: 1920, height: 1000 });
    return failures;
}

/**
 * EVERY DIALOG OPENS AT ITS FRAME'S TOP (owner, 2026-11-19 23:15 UTC+2: "The dialogue cards' level are different on the Segment. Fix it."; layout rules section 23,
 * "Every dialog opens at its frame's top"): each master tile of the page's first chapter opened in turn at 1920 x 1000, its dialog's top read against the top of the frame as it shows
 * (a Segment's chapter, a page's frame); every one within a pixel of it.
 */
export async function checkDialogLevel(page, where) {
    const failures = [];
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const count = await page.evaluate(() => [...document.querySelectorAll(".section-tiles-quad .section-tile")].filter(tile => tile.getBoundingClientRect().width > 0).length);
    for (let at = 0; at < count; at++) {
        const read = await page.evaluate(index => {
            const tile = [...document.querySelectorAll(".section-tiles-quad .section-tile")].filter(node => node.getBoundingClientRect().width > 0)[index];
            if (!tile) {
                return null;
            }
            const clear = colour => colour === "" || colour === "transparent" || /rgba\([^)]*,\s*0\)$/.test(colour);
            let frame = tile.closest(".business-foundation-input");
            for (let node = frame; node && !node.matches(".conversation-card"); node = node.parentElement) {
                if (!clear(getComputedStyle(node).backgroundColor)) {
                    frame = node;
                    break;
                }
            }
            tile.scrollIntoView({ block: "nearest" });
            return { title: tile.getAttribute("aria-label")?.split(",")[0] ?? "", frame: frame ? frame.getBoundingClientRect().top : null };
        }, at);
        if (!read || read.frame === null) {
            continue;
        }
        // (by the pointer, on the title: a click on a list line opens that line's card)
        await page.locator(".section-tiles-quad .section-tile:visible").nth(at).click({ position: { x: 60, y: 30 } }).catch(() => {});
        await page.waitForTimeout(700);
        const top = await page.evaluate(() => {
            const dialog = [...document.querySelectorAll(".section-tile-dialog, .floating-card-host")].find(node => node.getBoundingClientRect().width > 0);
            return dialog && dialog.matches(".section-tile-dialog") ? dialog.getBoundingClientRect().top : null;
        });
        const frame = read.frame;
        if (top !== null && Math.abs(top - Math.max(frame, 0)) > 1 && top > frame) {
            failures.push({ page: where, width: 1920, rule: "every dialog opens at its frame's top", detail: read.title + ": the dialog's top " + Math.round(top) + ", the frame's " + Math.round(frame) });
        }
        // (closed as a reader closes it, until no dialog or card stands open)
        for (let tries = 0; tries < 4 && await page.evaluate(() => [...document.querySelectorAll(".section-tile-dialog, .floating-card-host")].some(node => node.getBoundingClientRect().width > 0)); tries++) {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(400);
        }
    }
    return failures;
}

export async function runLayoutCheck(page, { base = "http://localhost:1420", probe, pages = PAGES, widths, sizes = (widths ?? WIDTHS).map(width => [width, 1000]), themes = THEMES, reference } = {}) {
    const failures = [];
    // The reference x: the first Legal Entity card's (measured here, or handed in by a run that measured it once).
    let referenceX = reference ?? null;
    if (reference === undefined && await openPage(page, base, "Identity System", "Legal Entity")) {
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
            failures.push(...(await checkChapters(page, system + " › " + name)));
            failures.push(...(await checkDialogLevel(page, system + " › " + name)));
            // The real mouse on the list items of the first-row tiles (3. Infrastructure & Capability), in a tall and a low window.
            if (/Infrastructure/.test(name)) {
                await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
                for (const [width, height] of [[1366, 1000], [1366, 700], [1920, 1000]]) {
                    await page.setViewportSize({ width, height });
                    await page.waitForTimeout(300);
                    failures.push(...(await checkRealMouse(page, system + " › " + name + " (" + width + " x " + height + ")")));
                }
            }
            // A SUBCHANNEL'S CARD WITH ITS ACTIONS (owner, 2026-11-16 14:24: "Ensure the cards align properly within each row"): from Customer Engagement, the
            // first chapter's Channels & Journey, its first channel, its first subchannel's card, read for the lists' edges and the action cards' lines in each theme.
            if (/Customer Engagement/.test(name)) {
                await page.setViewportSize({ width: 1920, height: 1000 });
                await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
                const master = page.locator(".section-tile", { hasText: "Channels &" }).first();
                if (await master.count()) {
                    await master.click({ position: { x: 150, y: 280 } });
                    await page.waitForTimeout(800);
                    // (The dialog by channel, whichever view the tiles' walk left it in.)
                    const byChannel = page.getByRole("radio", { name: "Channels", exact: true }).first();
                    if (await byChannel.count()) {
                        await byChannel.check();
                        await page.waitForTimeout(400);
                    }
                    const channel = page.locator(".section-tile-dialog .section-tile").first();
                    if (await channel.count()) {
                        await channel.click({ position: { x: 100, y: 30 } });
                        await page.waitForTimeout(900);
                        const sub = page.locator(".section-tile-overlay .card-tile").first();
                        if (await sub.count() && !(await page.locator(".floating-card-host").count())) {
                            await sub.click({ position: { x: 100, y: 20 } });
                            await page.waitForTimeout(900);
                        }
                        for (const theme of themes) {
                            await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
                            await page.waitForTimeout(200);
                            const found = await page.evaluate(spec => window.__layoutProbe.check(spec), SPEC);
                            failures.push(...found.filter(failure => /cards of a list|link line keeps|action card's/.test(failure.rule)).map(failure => ({ page: system + " › " + name + " › a subchannel's card", theme, width: 1920, ...failure })));
                        }
                    }
                    await page.keyboard.press("Escape");
                    await page.keyboard.press("Escape");
                    await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
                }
            }
            // THE DOCUMENTS' PAPER in every reading mode (owner, 2026-11-14 23:37): from Financials, the Workbook's three documents, each read for the
            // paper's contrast alone (rule 0e) in each theme.
            if (/Financials/.test(name)) {
                await page.setViewportSize({ width: 1920, height: 1000 });
                const workbook = page.getByRole("button", { name: /Workbook/i }).first();
                if (await workbook.count()) {
                    await workbook.click();
                    await page.waitForTimeout(800);
                    for (const tab of ["Business Plan", "Business Model Canvas", "Financial Forecast"]) {
                        const button = page.getByRole("tab", { name: tab }).first();
                        if (!(await button.count())) {
                            continue;
                        }
                        await button.click();
                        await page.waitForTimeout(500);
                        for (const theme of themes) {
                            await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
                            await page.waitForTimeout(200);
                            const found = await page.evaluate(spec => window.__layoutProbe.check(spec), SPEC);
                            failures.push(...found.filter(failure => /documents' paper/.test(failure.rule)).map(failure => ({ page: "Workbook › " + tab, theme, width: 1920, ...failure })));
                        }
                    }
                    await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), "light");
                }
            }
        }
    }
    return failures;
}

/**
 * THE DEV SERVER: the check needs the app running. Where nothing answers at the address, it starts `npm run dev` itself (and stops it at the end), so
 * "ERR_CONNECTION_REFUSED" never ends a run; the server it finds already running is left alone.
 */
async function ensureServer(base) {
    const up = async () => { try { return (await fetch(base)).ok; } catch { return false; } };
    if (await up() || !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(base)) {
        return () => {};
    }
    console.error("No server at " + base + ": starting npm run dev for the check.");
    const { spawn, execSync } = await import("node:child_process");
    const child = spawn("npm", ["run", "dev"], { shell: true, stdio: "ignore", cwd: fileURLToPath(new URL("../../../", import.meta.url)) });
    for (let wait = 0; wait < 90 && !(await up()); wait += 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!(await up())) {
        console.error("The dev server did not start in 90 seconds.");
    }
    return () => {
        try {
            if (process.platform === "win32") {
                execSync("taskkill /pid " + child.pid + " /T /F", { stdio: "ignore" });
            } else {
                child.kill();
            }
        } catch { /* already gone */ }
    };
}

// As a script: node tools/scripts/layout-check/run.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const stopServer = await ensureServer(process.env.BASE_URL ?? "http://localhost:1420");
    process.on("exit", stopServer);
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
    // STEADIER ON A BUSY MACHINE: every wait of the check is first the fonts being ready (a line measured before the font swaps has the wrong height), then its time times CHECK_SLOW
    // (1.5 by default; CHECK_SLOW=3 on a machine that is busy with other work, 1 on a quiet one).
    const slow = Number(process.env.CHECK_SLOW ?? 1.5);
    // A page of its own, in a context of its own (its own storage): the pages are checked side by side.
    const newCheckPage = async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const waitOnce = page.waitForTimeout.bind(page);
        page.waitForTimeout = async (milliseconds) => {
            await page.evaluate(() => document.fonts?.ready).catch(() => {});
            await waitOnce(Math.round(milliseconds * slow));
        };
        return page;
    };
    const probe = readFileSync(new URL("./layout-probe.js", import.meta.url), "utf8");
    const base = process.env.BASE_URL ?? "http://localhost:1420";
    const failures = [];
    // A quick run: CHECK_PAGES="Customer Engagement,Roadmap" CHECK_WIDTHS=1920 CHECK_THEMES=light CHECK_EXAMPLES=lumen node tools/scripts/layout-check/run.mjs
    // --quick: the one setting the baseline is made at (the Quillfield example and the proxy-tutoring fixture's Foundation page, 1920 wide, the light page); the full check is the same command without it.
    if (process.argv.includes("--quick")) {
        process.env.CHECK_WIDTHS ??= "1920";
        process.env.CHECK_THEMES ??= "light";
        process.env.CHECK_EXAMPLES ??= "quillfield,proxy-tutoring";
    }
    // --pages=Infrastructure,"Brand System": only those pages (the same as CHECK_PAGES), for a change made on one page.
    const pagesArg = process.argv.find(arg => arg.startsWith("--pages="));
    if (pagesArg) {
        process.env.CHECK_PAGES = pagesArg.slice("--pages=".length).replace(/"/g, "");
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
    // SIDE BY SIDE (CHECK_WORKERS, 4 by default): every page of every example is a job, checked in a page of its own with its example seeded afresh;
    // the findings are listed in the same order as before (by example, then page).
    const jobs = [];
    for (const { name: example, file, pages: ownPages } of EXAMPLES.filter(entry => !exampleFilter || exampleFilter.some(text => entry.name.includes(text)))) {
        // (A fixture opens only the pages it is made for, within CHECK_PAGES.)
        const examplePages = ownPages ? ownPages.map(([system, names]) => [system, names.filter(name => pages.some(([other, kept]) => other === system && kept.includes(name)))]).filter(([, names]) => names.length > 0) : pages;
        for (const [system, names] of examplePages) {
            for (const name of names) {
                jobs.push({ example, file, system, name });
            }
        }
    }
    // The reference x (the first Legal Entity card's), measured once for each example.
    const references = new Map();
    const referenceOf = (job) => {
        if (!references.has(job.example)) {
            references.set(job.example, (async () => {
                const page = await newCheckPage();
                try {
                    await seedExample(page, base, readFileSync(job.file, "utf8"));
                    if (await openPage(page, base, "Identity System", "Legal Entity")) {
                        const card = page.locator(".legal-entity-card .strategy-box-remove").first();
                        if (await card.count()) {
                            return await removeLook(page, card);
                        }
                    }
                    return null;
                } finally {
                    await page.context().close();
                }
            })());
        }
        return references.get(job.example);
    };
    const results = new Array(jobs.length);
    let next = 0;
    const worker = async () => {
        while (next < jobs.length) {
            const index = next++;
            const job = jobs[index];
            const reference = await referenceOf(job);
            // (A page that reloads under the script -- the dev server hot-reloading, a slow machine -- makes the job start again, twice at most, instead of ending the run.)
            for (let attempt = 1; ; attempt += 1) {
                const page = await newCheckPage();
                try {
                    await seedExample(page, base, readFileSync(job.file, "utf8"));
                    results[index] = (await runLayoutCheck(page, { base, probe, pages: [[job.system, [job.name]]], sizes, themes, reference })).map(failure => ({ example: job.example, ...failure }));
                    // (A page not found while the machine is busy with the other pages is looked for once more before it is reported.)
                    if (attempt < 2 && results[index].some(failure => failure.rule === "page opens")) {
                        continue;
                    }
                    break;
                } catch (error) {
                    if (attempt >= 3 || !/context was destroyed|Target closed|net::ERR/.test(String(error))) {
                        throw error;
                    }
                    console.error("The page changed under the check (" + String(error).split("\n")[0] + "): starting " + job.system + " › " + job.name + " again.");
                } finally {
                    await page.context().close();
                }
            }
        }
    };
    const workers = Math.max(1, Number(process.env.CHECK_WORKERS ?? 4));
    await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, worker));
    results.forEach(found => failures.push(...(found ?? [])));
    console.error("Checked " + jobs.length + " pages (" + [...new Set(jobs.map(job => job.example))].join(", ") + "), " + Math.min(workers, jobs.length) + " side by side.");
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
