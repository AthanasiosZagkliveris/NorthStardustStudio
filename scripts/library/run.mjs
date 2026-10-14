/**
 * The library runner (docs/design/05, 5.13, layer D): opens the gallery
 * (/library, served by `npm run dev`) in every reading mode and every
 * screen class, and measures each asset against its contract
 * (src/library/assets/*.ts). Seconds for one asset, instead of a page
 * run of minutes.
 *
 *   PW_CHANNEL=msedge node scripts/library/run.mjs [--base http://localhost:1420]
 *
 * Needs the dev server running. Prints one line per failed check and a
 * count; exits 1 on any failure. Auto is dark or light, so the modes are
 * light, dark and sepia. Needs Node 22.18 or later (it reads the
 * TypeScript contracts directly).
 *
 * For the label arrow it measures, at rest, in every variant, palette
 * hue and ground, closed and open: the triangle's size against the
 * label's letters (0.611em x 1em, turned when open), the button's hit
 * area (24px at least), the triangle's place in it, the outline at rest,
 * the line width, the label's size against the contract, the ink against
 * its ground (3:1), and that nothing overflows its sample. With the real
 * pointer and the keyboard it measures that hover and focus fill the
 * triangle and that focus draws no ring.
 */
import { chromium } from "playwright";
import { THEME_KEY } from "./theme-key.mjs";
import { assets } from "../../src/library/index.ts";

const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://localhost:1420";
const MODES = ["light", "dark", "sepia"];
/** Tablet at the minimum width, Laptop (1440 x 864), Desktop (1920 x 1250): the website's classes. */
const SIZES = [[768, 1024], [1440, 864], [1920, 1250]];

const failures = [];
let checks = 0;
const check = (ok, where, what, detail = "") => {
    checks++;
    if (!ok) failures.push(where + ": " + what + (detail ? " (" + detail + ")" : ""));
};

/** Runs in the page: every sample at rest. */
function measureSamplesInPage({ variants }) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const rgb = value => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "#000";
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        return [r, g, b];
    };
    const luminance = ([r, g, b]) => {
        const [x, y, z] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
        return 0.2126 * x + 0.7152 * y + 0.0722 * z;
    };
    const ratio = (one, other) => {
        const [high, low] = [luminance(one), luminance(other)].sort((a, b) => b - a);
        return (high + 0.05) / (low + 0.05);
    };
    return [...document.querySelectorAll("[data-sample]")].map(sample => {
        const button = sample.querySelector("button.label-arrow");
        const svg = button.querySelector("svg");
        const polygon = svg.querySelector("polygon");
        const buttonRect = button.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const sampleRect = sample.getBoundingClientRect();
        const buttonStyle = getComputedStyle(button);
        const polygonStyle = getComputedStyle(polygon);
        const variant = variants.find(item => item.id === sample.dataset.variant);
        const fontSize = parseFloat(buttonStyle.fontSize);
        const open = sample.dataset.state === "open";
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            variant: sample.dataset.variant,
            hue: sample.dataset.hue,
            open,
            expanded: button.getAttribute("aria-expanded"),
            fontSize,
            expectedFontSize: variant.fontSizePx,
            svg: { width: svgRect.width, height: svgRect.height },
            button: { width: buttonRect.width, height: buttonRect.height },
            dx: svgRect.left + svgRect.width / 2 - (buttonRect.left + buttonRect.width / 2),
            dy: svgRect.top + svgRect.height / 2 - (buttonRect.top + buttonRect.height / 2),
            fill: polygonStyle.fill,
            strokeWidth: polygonStyle.strokeWidth,
            outlineStyle: buttonStyle.outlineStyle,
            inside: buttonRect.left >= sampleRect.left - 0.5 && buttonRect.right <= sampleRect.right + 0.5 && buttonRect.top >= sampleRect.top - 0.5 && buttonRect.bottom <= sampleRect.bottom + 0.5,
            overflows: sample.scrollWidth > sample.clientWidth + 1,
            contrast: ratio(rgb(buttonStyle.color), rgb(getComputedStyle(sample).backgroundColor)),
            ground: sample.dataset.ground
        };
    });
}

async function runLabelArrow(page, contract, where) {
    const { geometry } = contract;
    const tolerance = geometry.tolerancePx;
    const measured = await page.evaluate(measureSamplesInPage, { variants: contract.variants });
    check(measured.length > 0, where, "the gallery draws samples");
    for (const m of measured) {
        const at = where + " / " + m.id;
        const wide = geometry.glyphWidthEm * m.fontSize;
        const high = geometry.glyphHeightEm * m.fontSize;
        const [expectedWidth, expectedHeight] = m.open ? [high, wide] : [wide, high];
        check(Math.abs(m.fontSize - m.expectedFontSize) <= 0.01, at, "label size is the contract's", m.fontSize + "px, contract " + m.expectedFontSize + "px");
        check(m.expanded === String(m.open), at, "aria-expanded follows the state", m.expanded);
        check(Math.abs(m.svg.width - expectedWidth) <= tolerance && Math.abs(m.svg.height - expectedHeight) <= tolerance, at, "triangle size",
            m.svg.width.toFixed(2) + " x " + m.svg.height.toFixed(2) + ", rule " + expectedWidth.toFixed(2) + " x " + expectedHeight.toFixed(2));
        check(m.button.width >= geometry.minTargetPx - 0.01 && m.button.height >= geometry.minTargetPx - 0.01, at, "hit area at least " + geometry.minTargetPx + "px", m.button.width.toFixed(1) + " x " + m.button.height.toFixed(1));
        const shift = m.open ? geometry.openShiftEm * m.fontSize : 0;
        check(Math.abs(m.dx - shift) <= tolerance && Math.abs(m.dy) <= tolerance, at, "triangle's place in its button", "dx " + m.dx.toFixed(2) + " (rule " + shift.toFixed(2) + "), dy " + m.dy.toFixed(2));
        check(m.fill === "none", at, "an outline at rest (no fill)", m.fill);
        check(parseFloat(m.strokeWidth) === geometry.lineWidthPx, at, "line is " + geometry.lineWidthPx + "px", m.strokeWidth);
        check(m.outlineStyle === "none", at, "no outline at rest", m.outlineStyle);
        check(m.inside && !m.overflows, at, "nothing overflows the sample");
        const need = contract.accessibility.contrast.find(item => item.ground === m.ground).min;
        check(m.contrast >= need, at, "ink on its ground holds " + need + ":1", m.contrast.toFixed(2) + ":1");
    }

    /* Hover and focus: the real pointer and the real keyboard, one hue (the reaction does not depend on the hue). */
    const firstHue = measured[0].hue;
    const samples = page.locator("[data-sample][data-hue='" + firstHue + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.variant, element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.label-arrow");
        const read = () => button.evaluate(element => {
            const polygon = getComputedStyle(element.querySelector("polygon"));
            const style = getComputedStyle(element);
            return { fill: polygon.fill, stroke: polygon.stroke, color: style.color, outline: style.outlineStyle, shadow: style.boxShadow };
        });
        await page.mouse.move(0, 0);
        await button.hover();
        const hovered = await read();
        check(hovered.fill !== "none" && hovered.fill === hovered.color, where + " / " + label, "hover fills the triangle with the tint", hovered.fill + " vs " + hovered.color);
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.activeElement && document.activeElement.blur());
        let reached = false;
        for (let press = 0; press < 400 && !reached; press++) {
            await page.keyboard.press("Tab");
            reached = await button.evaluate(element => element === document.activeElement);
        }
        check(reached, where + " / " + label, "the keyboard reaches the arrow");
        if (reached) {
            const focused = await read();
            check(focused.fill !== "none" && focused.fill === focused.color, where + " / " + label, "focus fills the triangle with the tint", focused.fill + " vs " + focused.color);
            check(focused.outline === "none" && focused.shadow === "none", where + " / " + label, "focus draws no ring", focused.outline + " / " + focused.shadow);
        }
    }
}

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
try {
    for (const mode of MODES) {
        const context = await browser.newContext();
        await context.addInitScript(([key, value]) => { try { localStorage.setItem(key, value); } catch { /* none */ } }, [THEME_KEY, mode]);
        const page = await context.newPage();
        for (const [width, height] of SIZES) {
            await page.setViewportSize({ width, height });
            await page.goto(base + "/library", { waitUntil: "load" });
            await page.waitForSelector("[data-sample]", { timeout: 20000 });
            const theme = await page.evaluate(() => document.documentElement.dataset.theme);
            check(theme === mode, mode + " " + width + "x" + height, "the page is drawn in " + mode, String(theme));
            for (const contract of assets) {
                if (contract.name === "Label arrow") await runLabelArrow(page, contract, contract.name + " / " + mode + " / " + width + "x" + height);
            }
        }
        await context.close();
    }
} finally {
    await browser.close();
}

for (const failure of failures) console.error("FAIL " + failure);
console.log(checks + " checks, " + failures.length + " failed (" + assets.map(a => a.name).join(", ") + "; " + MODES.join(", ") + "; " + SIZES.map(s => s.join("x")).join(", ") + ").");
process.exit(failures.length ? 1 : 0);
