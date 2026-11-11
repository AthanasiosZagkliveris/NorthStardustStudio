/*
    THE SCREEN SNAPSHOT (owner, 2026-11-10: "optimise the app and the folders ... avoid any mistakes"): the final style of every element the app
    draws, on every Foundation page, in every section tile's dialog and in the floating cards its tiles open, for both examples, in the three reading modes,
    and on every page of every other System (the light page; --foundation for the Foundation pages only). Taken before and after a
    change that must not change the screen (CSS moved between files, a component split), the two snapshots must be the same; any element whose
    style differs is listed, with its path and what changed.

        node tools/scripts/layout-check/style-snapshot.mjs --out exports/snapshots/before.json
        node tools/scripts/layout-check/style-snapshot.mjs --out exports/snapshots/after.json
        node tools/scripts/layout-check/style-snapshot.mjs --compare exports/snapshots/before.json exports/snapshots/after.json

    It needs the dev server (npm run dev, http://localhost:1420). An element is named by its place in the page (its tags, classes and position
    among its siblings), so the names stay the same while the markup does; each element's computed values are kept whole, so a difference is
    shown property by property. exports/ is ignored by git.
*/

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright";
import { ALL_SYSTEMS, EXAMPLES, PAGES, openPage, pagesOf, seedExample } from "./run.mjs";

const arg = name => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : null);
const base = arg("base") ?? "http://localhost:1420";
const THEMES = ["light", "dark", "sepia"];
const PROPS = [
    "display", "position", "box-sizing", "width", "height", "min-width", "max-width", "min-height", "max-height",
    "margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", "border-top-style", "border-top-color",
    "border-right-color", "border-bottom-color", "border-left-color", "border-top-left-radius", "border-top-right-radius",
    "border-bottom-right-radius", "border-bottom-left-radius", "outline-style", "outline-width", "outline-color", "outline-offset",
    "color", "background-color", "background-image", "box-shadow", "opacity", "filter", "transform", "z-index", "overflow-x", "overflow-y",
    "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-transform", "text-decoration-line",
    "text-align", "white-space", "flex-direction", "flex-wrap", "justify-content", "align-items", "row-gap", "column-gap",
    "grid-template-columns", "grid-template-rows", "visibility", "cursor"
];

// ---- compare two snapshots -------------------------------------------------------------------------------------------------
if (process.argv.includes("--compare")) {
    const i = process.argv.indexOf("--compare");
    const [a, b] = [JSON.parse(readFileSync(process.argv[i + 1], "utf8")), JSON.parse(readFileSync(process.argv[i + 2], "utf8"))];
    let differences = 0;
    const scenes = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const scene of scenes) {
        const [x, y] = [a[scene] ?? {}, b[scene] ?? {}];
        if (!a[scene] || !b[scene]) {
            console.log("scene only in " + (a[scene] ? "the first" : "the second") + ": " + scene);
            differences++;
            continue;
        }
        for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
            if (x[key] === y[key]) continue;
            differences++;
            if (differences > 60) continue;
            if (!x[key] || !y[key]) {
                console.log(scene + "\n  " + key + ": only in " + (x[key] ? "the first" : "the second"));
                continue;
            }
            const [p, q] = [x[key].split("|"), y[key].split("|")];
            const changed = PROPS.map((prop, n) => (p[n] !== q[n] ? "    " + prop + ": " + p[n] + " -> " + q[n] : null)).filter(Boolean);
            console.log(scene + "\n  " + key + "\n" + changed.join("\n"));
        }
    }
    console.log(differences === 0 ? "The two snapshots are the same." : differences + " difference(s).");
    process.exit(differences === 0 ? 0 : 1);
}

// ---- take a snapshot -------------------------------------------------------------------------------------------------------
const out = arg("out");
if (!out) {
    console.log("usage: --out FILE | --compare FIRST SECOND");
    process.exit(1);
}
const browser = await chromium.launch();
const snapshot = {};

/** A page of its own (a browser context of its own: its own storage), with the same clock and no transitions, so two runs of the same code are the same. */
const newPage = async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    // (The same screen on every run: one fixed clock, so a "Recorded" date is always the same width, and no transition or animation caught half-way.)
    await context.clock.setFixedTime(new Date("2026-11-10T12:00:00"));
    await context.addInitScript(() => {
        const still = () => { const style = document.createElement("style"); style.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }"; document.head.appendChild(style); };
        if (document.head) still(); else document.addEventListener("DOMContentLoaded", still);
    });
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    return page;
};

/** Every drawn element under `rootSelector`, named by its path, with its computed values joined in PROPS order. */
const take = (page, rootSelector) => page.evaluate(([selector, props]) => {
    const root = document.querySelector(selector) ?? document.body;
    const name = element => {
        const parts = [];
        for (let e = element; e && e !== document.body; e = e.parentElement) {
            const same = e.parentElement ? [...e.parentElement.children].filter(c => c.tagName === e.tagName) : [e];
            const classes = [...e.classList].filter(c => !/^(is-|jump-|data-)/.test(c)).sort().join(".");
            parts.unshift(e.tagName.toLowerCase() + (classes ? "." + classes : "") + (same.length > 1 ? ":" + same.indexOf(e) : ""));
        }
        return parts.join(">");
    };
    const result = {};
    for (const element of [root, ...root.querySelectorAll("*")]) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const style = getComputedStyle(element);
        result[name(element)] = props.map(prop => style.getPropertyValue(prop)).join("|");
    }
    return result;
}, [rootSelector, PROPS]);

/** One page: the page, every section tile's dialog in turn and (with `cards`) the floating cards its tiles open, in each of `themes`. */
async function shoot(page, sceneBase, themes, cards) {
    for (const theme of themes) {
        await page.evaluate(value => document.documentElement.setAttribute("data-theme", value), theme);
        await page.mouse.move(1, 1);
        await page.waitForTimeout(250);
        const scene = sceneBase + " | " + theme;
        snapshot[scene] = await take(page, "body");
        const tiles = await page.locator("button.section-tile[data-tile]").count();
        for (let t = 0; t < tiles; t++) {
            const tile = page.locator("button.section-tile[data-tile]").nth(t);
            const id = await tile.getAttribute("data-tile");
            await tile.evaluate(node => node.click());
            await page.waitForTimeout(450);
            await page.mouse.move(1, 1);
            if (await page.locator(".section-tile-overlay").count()) {
                snapshot[scene + " | tile " + id] = await take(page, ".section-tile-overlay");
            }
            await page.keyboard.press("Escape");
            await page.waitForTimeout(300);
            // THE FLOATING CARDS the tile opens from its list (the first three of each tile), in the light page.
            if (cards && theme === "light") {
                // (The list stands in the tile's slot, over the tile button.)
                const links = page.locator(".section-tile-slot:has(button.section-tile[data-tile='" + id + "']) .section-tile-link");
                const count = Math.min(3, await links.count());
                for (let l = 0; l < count; l++) {
                    const name = ((await links.nth(l).textContent()) ?? "").trim().slice(0, 40);
                    await links.nth(l).evaluate(node => node.click());
                    await page.waitForTimeout(500);
                    await page.mouse.move(1, 1);
                    if (await page.locator(".floating-card-host").count()) {
                        snapshot[scene + " | tile " + id + " | card " + l + " " + name] = await take(page, ".section-tile-overlay");
                    }
                    await page.keyboard.press("Escape");
                    await page.waitForTimeout(300);
                }
            }
        }
    }
}

// THE JOBS: every Foundation page (three reading modes, its tiles' dialogs and floating cards), then every page of every other System (the light page), for
// both examples; checked side by side (SNAPSHOT_WORKERS, 4 by default), each in a page of its own with its example seeded afresh.
const foundationOnly = process.argv.includes("--foundation");
const jobs = [];
for (const example of EXAMPLES.slice(0, 2)) {
    for (const [system, names] of PAGES) {
        for (const pageName of names) {
            jobs.push({ example, capability: "Foundation", system, pageName, themes: THEMES, cards: true });
        }
    }
    if (!foundationOnly) {
        for (const [capability, system] of ALL_SYSTEMS.filter(([capability]) => capability !== "Foundation")) {
            jobs.push({ example, capability, system, pageName: null, themes: ["light"], cards: true });
        }
    }
}
let next = 0;
const worker = async () => {
    while (next < jobs.length) {
        const job = jobs[next++];
        const page = await newPage();
        try {
            await seedExample(page, base, readFileSync(job.example.file, "utf8"));
            // (A System of another capability: its pages as its rail lists them.)
            const names = job.pageName ? [job.pageName] : await pagesOf(page, base, job.capability, job.system);
            for (const pageName of names) {
                // (Once more where the first try finds no page: the first page after a cold start can still be drawing.)
                if (!(await openPage(page, base, job.system, pageName, job.capability)) && !(await openPage(page, base, job.system, pageName, job.capability))) {
                    console.log("not found: " + job.system + " > " + pageName);
                    continue;
                }
                await shoot(page, job.example.name + " | " + job.system + " > " + pageName, job.themes, job.cards);
                process.stdout.write(".");
            }
        } finally {
            await page.context().close();
        }
    }
};
await Promise.all(Array.from({ length: Math.max(1, Number(process.env.SNAPSHOT_WORKERS ?? 4)) }, worker));
await browser.close();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(snapshot));
console.log("\n" + Object.keys(snapshot).length + " scenes, " + Object.values(snapshot).reduce((n, s) => n + Object.keys(s).length, 0) + " elements written to " + out);
