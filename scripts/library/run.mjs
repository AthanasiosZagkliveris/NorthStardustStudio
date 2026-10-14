/**
 * The library runner (docs/design/05, 5.13, layer D): opens the gallery
 * (/library, served by `npm run dev`) in every reading mode and every
 * screen class, and measures each asset against its contract
 * (src/library/assets/*.ts). Seconds for one asset, instead of a page
 * run of minutes.
 *
 *   PW_CHANNEL=msedge node scripts/library/run.mjs [--base http://localhost:1420] [--asset "Label arrow"]
 *
 * Needs the dev server running. Prints one line per failed check and a
 * count; exits 1 on any failure. Auto is dark or light, so the modes are
 * light, dark and sepia. Needs Node 22.18 or later (it reads the
 * TypeScript contracts directly).
 *
 * Each asset has a module in scripts/library/assets/ that says what is
 * measured: run(page, contract, where, check). The in-page helpers
 * (colour maths) are window.__lib (inpage.mjs).
 */
import { chromium } from "playwright";
import { THEME_KEY } from "./theme-key.mjs";
import { INPAGE } from "./inpage.mjs";
import { assets } from "../../src/library/index.ts";
import * as labelArrow from "./assets/labelArrow.mjs";
import * as plusBox from "./assets/plusBox.mjs";

const modules = [labelArrow, plusBox];

const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://localhost:1420";
const only = process.argv.includes("--asset") ? process.argv[process.argv.indexOf("--asset") + 1] : null;
const MODES = ["light", "dark", "sepia"];
/** Tablet at the minimum width, Laptop (1440 x 864), Desktop (1920 x 1250): the website's classes. */
const SIZES = [[768, 1024], [1440, 864], [1920, 1250]];

const failures = [];
let checks = 0;
const check = (ok, where, what, detail = "") => {
    checks++;
    if (!ok) failures.push(where + ": " + what + (detail ? " (" + detail + ")" : ""));
};

const run = assets.filter(asset => !only || asset.name === only);
for (const asset of run) {
    if (!modules.some(module => module.name === asset.name)) {
        console.error("No runner module for the asset " + asset.name);
        process.exit(2);
    }
}

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
try {
    for (const mode of MODES) {
        const context = await browser.newContext();
        await context.addInitScript(([key, value]) => { try { localStorage.setItem(key, value); } catch { /* none */ } }, [THEME_KEY, mode]);
        await context.addInitScript({ content: INPAGE });
        const page = await context.newPage();
        for (const [width, height] of SIZES) {
            await page.setViewportSize({ width, height });
            await page.goto(base + "/library", { waitUntil: "load" });
            await page.waitForSelector("[data-sample]", { timeout: 20000 });
            const theme = await page.evaluate(() => document.documentElement.dataset.theme);
            check(theme === mode, mode + " " + width + "x" + height, "the page is drawn in " + mode, String(theme));
            for (const contract of run) {
                const module = modules.find(item => item.name === contract.name);
                await module.run(page, contract, contract.name + " / " + mode + " / " + width + "x" + height, check);
            }
        }
        await context.close();
    }
} finally {
    await browser.close();
}

for (const failure of failures) console.error("FAIL " + failure);
console.log(checks + " checks, " + failures.length + " failed (" + run.map(a => a.name).join(", ") + "; " + MODES.join(", ") + "; " + SIZES.map(s => s.join("x")).join(", ") + ").");
process.exit(failures.length ? 1 : 0);
