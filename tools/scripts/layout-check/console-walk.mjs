/**
 * THE CONSOLE WALK: opens every Foundation page of both examples and every tile's dialog in turn (the layout check's own walk, one window: 1920 wide, light) and lists
 * what the browser console and the page reported while it did: an error, an uncaught exception, a failed request, a React warning. It fails on any of them.
 *
 *   npm run check:console         (starts npm run dev itself when nothing answers)
 *
 * A layout can be right while a page throws; this is the check for that. The two examples are src/data/examples.
 */
import { readFileSync } from "node:fs";
import { execSync, spawn } from "node:child_process";
import { PAGES, openPage, seedExample } from "./run.mjs";

const base = process.env.BASE_URL ?? "http://localhost:1420";
const up = async () => { try { return (await fetch(base)).ok; } catch { return false; } };
let child = null;
if (!(await up())) {
    console.error("No server at " + base + ": starting npm run dev for the walk.");
    child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], { stdio: "ignore", shell: process.platform === "win32" });
    for (let waited = 0; !(await up()); waited += 1) {
        if (waited > 90) { console.error("The dev server did not start in 90 seconds."); process.exit(2); }
        await new Promise((done) => setTimeout(done, 1000));
    }
}
const stop = () => {
    if (!child) return;
    try { if (process.platform === "win32") execSync("taskkill /pid " + child.pid + " /T /F", { stdio: "ignore" }); else child.kill(); } catch { /* gone */ }
};
process.on("exit", stop);

const { chromium } = await import("playwright");
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1000 });
const probe = readFileSync(new URL("./layout-probe.js", import.meta.url), "utf8");
const SPEC_FOR_PROBE = (await import("./run.mjs")).SPEC;

let where = "start";
let visited = 0;
const seen = new Map();
const note = (kind, text) => {
    const key = kind + " | " + text.slice(0, 300);
    const entry = seen.get(key) ?? { kind, text: text.slice(0, 300), where: new Set(), count: 0 };
    entry.where.add(where);
    entry.count += 1;
    seen.set(key, entry);
};
page.on("pageerror", (error) => note("uncaught exception", String(error.stack ?? error).split("\n").slice(0, 3).join(" ")));
page.on("console", (message) => { if (["error", "warning"].includes(message.type())) note("console " + message.type(), message.text()); });
page.on("requestfailed", (request) => { if (!/\.(woff2?|ttf)$/.test(request.url())) note("request failed", request.url()); });

// (The walk proves its own listener: a message the page prints on purpose is seen.)
await page.evaluate(() => console.warn("console-walk self-test"));
if (![...seen.keys()].some(key => key.includes("console-walk self-test"))) { console.error("The console listener did not see the self-test message."); }
seen.clear();

for (const example of ["lumen-and-loom-studio.json", "quillfield-automation-llc.json"]) {
    await seedExample(page, base, readFileSync(new URL("../../../src/data/examples/" + example, import.meta.url), "utf8"));
    const pages = [["Identity System", ["^2\\. Organization"]], ...PAGES];
    for (const [system, names] of pages) {
        for (const name of names) {
            where = example.replace(".json", "") + " > " + system + " > " + name;
            if (!(await openPage(page, base, system, name))) { note("page did not open", where); continue; }
            visited += 1;
            await page.addScriptTag({ content: probe });
            await page.evaluate((spec) => window.__layoutProbe.checkWithTiles(spec), SPEC_FOR_PROBE);
        }
    }
}
await browser.close();

if (seen.size === 0) {
    console.log("Console walk: nothing reported (" + visited + " pages opened, every tile dialog on each).");
    process.exit(0);
}
for (const entry of seen.values()) {
    console.log(entry.kind + " (" + entry.count + "x) in " + [...entry.where].slice(0, 3).join("; ") + (entry.where.size > 3 ? " and " + (entry.where.size - 3) + " more" : "") + ":\n    " + entry.text);
}
console.log("Console walk: " + seen.size + " different messages.");
process.exit(1);
