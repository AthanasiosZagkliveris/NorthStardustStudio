/**
 * A snapshot of how the running app is drawn, to prove that a clean-up of the stylesheets changes nothing: for every
 * page of the four Foundation systems, every master tile opened and the first card of each view, in each context
 * (light 1920, dark 1920, light 768), the box and the computed style of every visible element. Two snapshots are
 * compared with --compare; the summary names the properties and the classes that differ.
 *
 *   PW_CHANNEL=msedge node tools/scripts/catalogue/style-snapshot.mjs --out FILE.json.gz
 *   node tools/scripts/catalogue/style-snapshot.mjs --compare BEFORE.json.gz AFTER.json.gz
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";

const arg = (name, fallback) => (process.argv.includes("--" + name) ? process.argv[process.argv.indexOf("--" + name) + 1] : fallback);
const read = file => JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));

if (process.argv.includes("--compare")) {
    const i = process.argv.indexOf("--compare");
    const before = read(process.argv[i + 1]), after = read(process.argv[i + 2]);
    let same = 0, different = 0, missing = 0, added = 0;
    const byProp = new Map(), byClass = new Map(), examples = [];
    for (const [scene, list] of Object.entries(before.scenes)) {
        const other = after.scenes[scene];
        if (!other) { missing += Object.keys(list).length; continue; }
        for (const [key, rec] of Object.entries(list)) {
            const o = other[key];
            if (!o) { missing++; continue; }
            if (o === rec) { same++; continue; }
            different++;
            const a = Object.fromEntries(rec.split(";").map(x => x.split("=")));
            const b = Object.fromEntries(o.split(";").map(x => x.split("=")));
            const props = Object.keys({ ...a, ...b }).filter(p => a[p] !== b[p]);
            for (const p of props) byProp.set(p, (byProp.get(p) ?? 0) + 1);
            const cls = key.split("|")[0];
            byClass.set(cls, (byClass.get(cls) ?? 0) + 1);
            if (examples.length < 25) examples.push(scene + " :: " + key + " :: " + props.map(p => p + " " + a[p] + " -> " + b[p]).join("; "));
        }
        for (const key of Object.keys(other)) if (!(key in list)) added++;
    }
    console.log("elements: " + same + " identical, " + different + " different, " + missing + " missing after, " + added + " new after");
    console.log("properties that differ: " + ([...byProp].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([p, n]) => p + " " + n).join("; ") || "none"));
    console.log("classes that differ: " + ([...byClass].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([c, n]) => c + " " + n).join("; ") || "none"));
    for (const e of examples) console.log("  " + e.slice(0, 300));
    process.exit(different || missing ? 1 : 0);
}

const base = arg("base", "http://localhost:1420");
const out = arg("out", "snapshot.json.gz");
const org = JSON.parse(readFileSync(new URL("../../../src/data/examples/quillfield-automation-llc.json", import.meta.url), "utf8"));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const CONTEXTS = [{ name: "light-1920", theme: "light", width: 1920 }, { name: "dark-1920", theme: "dark", width: 1920 }, { name: "light-768", theme: "light", width: 768 }];
const PROPS = ["display", "position", "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderTopStyle", "borderTopColor", "borderTopLeftRadius", "color", "backgroundColor", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textTransform", "textDecorationLine", "textAlign", "opacity", "boxShadow", "gap", "flexGrow", "flexShrink", "flexBasis", "gridTemplateColumns", "transform", "overflowX", "overflowY", "zIndex", "cursor", "verticalAlign", "alignItems", "justifyContent"];
const snapshot = { when: new Date().toISOString(), scenes: {} };

/** In the page: every visible element, as a key and a record of its box and style. */
function capture(props) {
    const out = {};
    const used = new Map();
    const round = v => Math.round(v * 10) / 10;
    for (const el of document.querySelectorAll("body *")) {
        if (["SCRIPT", "STYLE", "NOSCRIPT", "PATH", "svg", "defs", "g"].includes(el.tagName)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const s = getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") continue;
        const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 3).join(".") || el.tagName.toLowerCase();
        const parent = el.parentElement;
        const index = parent ? [...parent.children].indexOf(el) : 0;
        let key = cls + "|" + (parent && parent.getAttribute("class") ? parent.getAttribute("class").split(/\s+/)[0] : parent ? parent.tagName.toLowerCase() : "") + "|" + index;
        const n = used.get(key) ?? 0;
        used.set(key, n + 1);
        if (n) key += "#" + n;
        out[key] = "box=" + round(r.left) + "," + round(r.top) + "," + round(r.width) + "," + round(r.height) + ";" + props.map(p => p + "=" + String(s[p]).replace(/[;=]/g, "_")).join(";");
    }
    return out;
}

async function run(context) {
    const page = await (await browser.newContext({ viewport: { width: context.width, height: 1000 } })).newPage();
    page.setDefaultTimeout(6000);
    const wait = ms => page.waitForTimeout(ms);
    async function open(system, name) {
        await page.goto(base + "/");
        await page.evaluate(([o, theme]) => { localStorage.clear(); localStorage.setItem("northstardust-theme", theme); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, [org, context.theme]);
        await page.goto(base + "/assistant");
        await wait(600);
        await page.getByText("Foundation", { exact: true }).first().click();
        await wait(200);
        await page.keyboard.press("Escape");
        await page.locator("li.system-item", { hasText: system }).press("Enter");
        await wait(800);
        const start = page.getByRole("button", { name: /Start Interview/i });
        if (await start.count()) { await start.first().click(); await wait(500); }
        if (name) { await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(name) }).first().evaluate(n => n.click()); await wait(800); }
        await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }" });
    }
    const take = async where => { snapshot.scenes[context.name + " / " + where] = await page.evaluate(capture, PROPS); };
    const attempt = async (name, fn) => { try { await fn(); } catch (error) { console.log("skipped " + context.name + " " + name + ": " + String(error).slice(0, 70)); } };
    const PAGES = { "Identity System": ["1. Definition", "2. Organization"], "Brand System": [null], "Business System": ["1. Foundation", "Customer Engagement", "Infrastructure", "Financial Foundation", "Sustainability"], "Strategy System": [null] };
    for (const [system, pages] of Object.entries(PAGES)) for (const name of pages) {
        const where = system + " / " + (name ?? "main");
        await attempt(where, async () => {
            await open(system, name);
            await take(where + " / page");
            const count = await page.locator(".section-tile-slot button.section-tile").count();
            for (let i = 0; i < count; i++) await attempt(where + " tile " + i, async () => {
                await open(system, name);
                await page.locator(".section-tile-slot button.section-tile").nth(i).evaluate(n => n.click());
                await wait(900);
                await take(where + " / tile " + i);
                const nested = page.locator(".section-tile-overlay:not(.floating-overlay) button.section-tile");
                if (await nested.count()) { await nested.first().evaluate(n => n.click()); await wait(900); await take(where + " / tile " + i + " / card 1"); }
            });
        });
    }
    await page.close();
}
for (const context of CONTEXTS) await run(context);
await browser.close();
const elements = Object.values(snapshot.scenes).reduce((n, s) => n + Object.keys(s).length, 0);
writeFileSync(out, gzipSync(Buffer.from(JSON.stringify(snapshot))));
console.log(Object.keys(snapshot.scenes).length + " scenes, " + elements + " elements -> " + out);
