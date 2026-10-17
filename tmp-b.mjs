import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const base = "http://localhost:1420";
const org = JSON.parse(readFileSync("src/data/examples/lumen-and-loom-studio.json", "utf8"));
const browser = await chromium.launch({ channel: "msedge" });
const page = await (await browser.newContext({ viewport: { width: 1360, height: 1000 } })).newPage();
page.setDefaultTimeout(8000);
const wait = ms => page.waitForTimeout(ms);
const [theme, pageName, tile, inner, name] = process.argv.slice(2);
await page.goto(base + "/");
await page.evaluate(([o, t]) => { localStorage.clear(); localStorage.setItem("northstardust-theme", t); localStorage.setItem("northstardust-organization-" + o.id, JSON.stringify(o)); localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: o.id, name: o.name, createdAt: o.createdAt }])); localStorage.setItem("northstardust-selected-organization", o.id); }, [org, theme]);
await page.goto(base + "/assistant"); await wait(700);
await page.getByText("Foundation", { exact: true }).first().click(); await wait(250);
await page.keyboard.press("Escape");
await page.locator("li.system-item", { hasText: "Business System" }).press("Enter"); await wait(900);
const start = page.getByRole("button", { name: /Start Interview/i });
if (await start.count()) { await start.first().click(); await wait(600); }
await page.getByRole("navigation", { name: "Pages" }).getByRole("button", { name: new RegExp(pageName) }).first().evaluate(n => n.click()); await wait(900);
if (tile && tile !== "-") { await page.locator("button.section-tile").filter({ hasText: new RegExp(tile, "i") }).first().evaluate(n => n.click()); await wait(900); }
if (inner && inner !== "-") { const sel = inner.startsWith("css:") ? inner.slice(4) : null; if (sel) await page.locator(sel).first().evaluate(n => n.click()); else await page.locator("button.section-tile").filter({ hasText: new RegExp(inner, "i") }).first().evaluate(n => n.click()); await wait(1000); }
await page.screenshot({ path: process.env.TEMP + "/" + (name || "b") + ".png" });
await browser.close();
