/**
 * HOW FAST THE APP ANSWERS ON A PHONE: the Quillfield example on a Pixel 7's screen, its processor slowed four times (a mid-range phone), the built app.
 *
 *   npm run build && npx vite preview          (the built app on http://localhost:4173; the dev server's React is slower and draws twice)
 *   npm run check:speed                        (or: node tools/scripts/layout-check/speed.mjs --base http://localhost:4173)
 *
 * For each of three pages (Foundation & Engagement, Identity, Strategy) it taps the first tile, which opens its dialog, then types 15 letters into the
 * dialog's first text box and takes them back. It reports:
 *
 *   openMs        how long the tap took to answer (the browser's Event Timing: from the tap to the next frame drawn)
 *   renders       how many times React drew the page while the dialog opened
 *   restyles      how many times the browser worked out the page's styles again while it opened (each a layout of the page forced by a measure)
 *   keyMedianMs   the middle of the times a key took to show, keyWorstMs the longest
 *
 * The numbers move a little from run to run (the machine's other work): compare two runs on the same machine, before and after a change. Measured on
 * 2026-11-28 (docs/design/records/01-log.md): before the speed round a key took 232 to 1,608ms (the middle) and a dialog opened in 82 to 85 renders; after,
 * 40 to 72ms and 7 to 10 renders.
 */
import { readFileSync } from "node:fs";
import { chromium, devices } from "playwright";
import { openPage, seedExample } from "./run.mjs";

const arg = name => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : null);
const base = arg("base") ?? "http://localhost:4173";
const SLOWDOWN = 4;
const PAGES = [["Business System", "Foundation & Engagement"], ["Identity System", "Identity System"], ["Strategy System", "Strategy System"]];

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["Pixel 7"] });
const page = await context.newPage();
// (React's commits are counted through the hook its developer tools use; the browser's own slow events through Event Timing.)
await page.addInitScript(() => {
    window.__speed = { commits: 0, events: [] };
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        supportsFiber: true, renderers: new Map(), inject(renderer) { this.renderers.set(1, renderer); return 1; },
        onCommitFiberRoot() { window.__speed.commits += 1; }, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, checkDCE() {}
    };
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__speed.events.push({ name: entry.name, duration: entry.duration }); })
        .observe({ type: "event", durationThreshold: 16, buffered: true });
});
await seedExample(page, base, readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
const restyles = async () => (await cdp.send("Performance.getMetrics")).metrics.find(metric => metric.name === "RecalcStyleCount").value;
const at = (values, share) => values.length ? Math.round([...values].sort((a, b) => a - b)[Math.floor(share * (values.length - 1))]) : null;

const rows = [];
for (const [system, name] of PAGES) {
    if (!(await openPage(page, base, system, name))) {
        rows.push({ page: name, note: "did not open" });
        continue;
    }
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: SLOWDOWN });
    await page.evaluate(() => { window.__speed.commits = 0; window.__speed.events = []; });
    const before = await restyles();
    await page.locator(".conversation-card .section-tile").first().tap();
    await page.waitForTimeout(2500);
    const opened = await page.evaluate(() => ({ commits: window.__speed.commits, taps: window.__speed.events.filter(event => /pointer|click/.test(event.name)).map(event => event.duration) }));
    const restyled = (await restyles()) - before;
    // (The dialog's first text box; where its first tile holds cards, the first card's.)
    const textBox = () => page.locator(".section-tile-overlay :is(textarea, input:not([type]), input[type=text])").filter({ visible: true }).first();
    let box = textBox();
    if (!(await box.count())) {
        await page.locator(".section-tile-overlay .section-tile").first().tap().catch(() => {});
        await page.waitForTimeout(2500);
        box = page.locator(":is(textarea, input:not([type]), input[type=text])").filter({ visible: true }).first();
    }
    let keys = [];
    if (await box.count()) {
        await box.tap();
        await page.waitForTimeout(500);
        await page.evaluate(() => { window.__speed.events = []; });
        await box.press("End");
        for (let i = 0; i < 15; i++) await page.keyboard.type("x");
        for (let i = 0; i < 15; i++) await page.keyboard.press("Backspace");
        await page.waitForTimeout(1500);
        keys = await page.evaluate(() => window.__speed.events.filter(event => /key|input/.test(event.name)).map(event => event.duration));
    }
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    rows.push({ page: name, openMs: at(opened.taps, 1), renders: opened.commits, restyles: restyled, keyMedianMs: at(keys, 0.5), keyWorstMs: at(keys, 1) });
}
await browser.close();
console.table(rows);
