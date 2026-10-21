import { focusByKeyboard, settle } from "../helpers.mjs";

/**
 * Info note, the "i" (src/library/assets/infoNote.ts). At rest, in each
 * variant (plain, tinted, page-3), hue and ground: the 22px round disc, the
 * 24px hit area, the 6px gap after the label's last word, the disc on the
 * label line's centre, the letter (small size, bold, italic), the stroke and
 * the colours of the variant, and the letter's contrast. With the real
 * pointer and keyboard: the swap under the pointer, the focus indication,
 * the look while its note is open, Escape closing it and the focus coming
 * back, and no change of size.
 */
export const name = "Info note";

/** The colours each variant should show at rest and swapped, as CSS expressions read on a probe element in the sample. */
const EXPECTED = {
    plain: {
        rest: { border: "var(--line-primary)", fill: "transparent", ink: "var(--text-primary)" },
        swapped: { fill: "var(--bg-primary)", ink: "var(--text-on-fill)" }
    },
    tinted: {
        rest: { border: "hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent))", fill: "transparent", ink: "color-mix(in srgb, hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent)) 60%, var(--text-default))" },
        swapped: { fill: "hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent))", ink: "var(--text-on-fill)" }
    },
    "page-3": {
        rest: { border: "var(--info-ink)", fill: "transparent", ink: "var(--info-ink)" },
        swapped: { fill: "var(--info-ink)", ink: "var(--info-fill)" }
    }
};

/** Runs in the page: the state of the button at this moment. */
function readInPage({ sampleIndex, expected }) {
    const { rgb, ratio, same } = window.__lib;
    const sample = document.querySelectorAll("[data-asset='Info note'] [data-sample]")[sampleIndex];
    const button = sample.querySelector("button.info-note-button");
    const style = getComputedStyle(button);
    const probe = document.createElement("span");
    button.parentElement.appendChild(probe);
    const evaluate = expression => {
        probe.style.color = "#000";
        probe.style.color = expression;
        const value = getComputedStyle(probe).color;
        return value;
    };
    // custom properties (--info-ink) are set on the button itself in the page-3 variant, so probe from the button
    const evaluateOnButton = expression => {
        button.appendChild(probe);
        probe.style.color = "#000";
        probe.style.color = expression;
        return getComputedStyle(probe).color;
    };
    const colour = expression => (expression.includes("--info-") ? evaluateOnButton(expression) : evaluate(expression));
    const rect = button.getBoundingClientRect();
    const result = {
        width: rect.width,
        height: rect.height,
        borderWidth: parseFloat(style.borderTopWidth),
        borderIsExpected: expected.border ? same(style.borderTopColor, colour(expected.border)) : null,
        fillIsExpected: expected.fill === "transparent" ? window.__lib.transparent(style.backgroundColor) : same(style.backgroundColor, colour(expected.fill)),
        inkIsExpected: same(style.color, colour(expected.ink)),
        borderTransparent: window.__lib.transparent(style.borderTopColor),
        contrast: ratio(rgb(style.color), rgb(window.__lib.transparent(style.backgroundColor) ? getComputedStyle(sample).backgroundColor : style.backgroundColor)),
        dpr: window.devicePixelRatio,
        boxShadow: style.boxShadow,
        outlineStyle: style.outlineStyle,
        expanded: button.getAttribute("aria-expanded"),
        active: document.activeElement === button
    };
    probe.remove();
    return result;
}

function measureRestInPage() {
    const root = getComputedStyle(document.documentElement);
    return [...document.querySelectorAll("[data-asset='Info note'] [data-sample]")].map((sample, index) => {
        const button = sample.querySelector("button.info-note-button");
        const note = sample.querySelector(".info-note");
        const glue = sample.querySelector(".info-note-glue");
        const line = sample.querySelector(".library-label-line");
        const style = getComputedStyle(button);
        const after = getComputedStyle(button, "::after");
        const buttonRect = button.getBoundingClientRect();
        const noteRect = note.getBoundingClientRect();
        const lineRect = line.getBoundingClientRect();
        const word = document.createRange();
        const textNode = [...glue.childNodes].find(node => node.nodeType === 3);
        word.selectNodeContents(textNode);
        const wordRect = word.getBoundingClientRect();
        return {
            index,
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground].join(" / "),
            variant: sample.dataset.variant,
            hue: sample.dataset.hue,
            ground: sample.dataset.ground,
            width: buttonRect.width,
            height: buttonRect.height,
            radius: style.borderTopLeftRadius,
            hit: { width: parseFloat(after.width), height: parseFloat(after.height), top: after.top, left: after.left },
            gap: noteRect.left - wordRect.right,
            centreOffset: buttonRect.top + buttonRect.height / 2 - (lineRect.top + lineRect.height / 2),
            fontSize: parseFloat(style.fontSize),
            expectedFontSize: parseFloat(root.getPropertyValue("--font-small")),
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            label: button.getAttribute("aria-label"),
            haspopup: button.getAttribute("aria-haspopup"),
            expanded: button.getAttribute("aria-expanded"),
            lineInside: lineRect.width >= 0
        };
    });
}

export async function run(page, contract, where, check) {
    const g = contract.geometry;
    await settle(page);
    const samples = await page.evaluate(measureRestInPage);
    check(samples.length > 0, where, "the gallery draws samples");
    for (const m of samples) {
        const at = where + " / " + m.id;
        const stroke = m.variant === "page-3" ? g.strokePage3 : g.strokePlain;
        check(Math.abs(m.width - g.disc) <= g.tolerancePx && Math.abs(m.height - g.disc) <= g.tolerancePx, at, "round disc of " + g.disc + "px", m.width + " x " + m.height);
        check(m.radius === "50%" || parseFloat(m.radius) >= g.disc / 2, at, "round (50% corners)", m.radius);
        check(m.hit.width === g.hitArea && m.hit.height === g.hitArea, at, "hit area " + g.hitArea + "px (::after)", m.hit.width + " x " + m.hit.height);
        check(Math.abs(m.gap - g.gap) <= g.tolerancePx, at, "the \"i\" stands " + g.gap + "px after the last word", m.gap.toFixed(2) + "px");
        check(Math.abs(m.centreOffset) <= g.centreTolerancePx, at, "the \"i\" is on the label line's centre", m.centreOffset.toFixed(2) + "px");
        check(Math.abs(m.fontSize - m.expectedFontSize) <= 0.01 && m.fontWeight === String(g.fontWeight) && m.fontStyle === "italic", at, "the letter is the small size, bold, italic", m.fontSize + " " + m.fontWeight + " " + m.fontStyle);
        check(m.label.endsWith(": what this means") && m.haspopup === "dialog" && m.expanded === "false", at, "named, aria-haspopup dialog, collapsed", m.label + " " + m.haspopup + " " + m.expanded);
        const expected = EXPECTED[m.variant];
        const rest = await page.evaluate(readInPage, { sampleIndex: m.index, expected: expected.rest });
        /* A border is drawn in whole device pixels: 1.5px is 1px at 100% zoom on a 1x screen. */
        const drawn = Math.floor(stroke * rest.dpr) / rest.dpr;
        check(rest.borderWidth === drawn, at, "stroke of " + stroke + "px (drawn " + drawn + "px at " + rest.dpr + "x) at rest", String(rest.borderWidth));
        const tintKey = m.variant === "tinted" ? "tinted-rule-overridden" : "";
        check(rest.borderIsExpected, at, "the stroke has the variant's colour at rest", "", tintKey);
        check(rest.fillIsExpected && rest.inkIsExpected, at, "the disc and the letter have the variant's colours at rest", "", tintKey);
        check(rest.contrast >= contract.accessibility.contrast[0].min, at, "the letter on the disc holds " + contract.accessibility.contrast[0].min + ":1 at rest", rest.contrast.toFixed(2) + ":1");
    }

    /* The swap: the first sample of each variant and ground, with the real pointer and keyboard. */
    const seen = new Set();
    for (const m of samples) {
        const key = m.variant + "|" + m.ground;
        if (seen.has(key)) continue;
        seen.add(key);
        const at = where + " / " + m.variant + " / " + m.ground;
        const button = page.locator("[data-asset='Info note'] [data-sample]").nth(m.index).locator("button.info-note-button");
        const expected = EXPECTED[m.variant];
        const read = swapped => page.evaluate(readInPage, { sampleIndex: m.index, expected: swapped });
        const sizeAtRest = (await read(expected.rest));
        await page.mouse.move(0, 0);
        await button.hover();
        await settle(page);
        const hovered = await read(expected.swapped);
        check(hovered.fillIsExpected && hovered.inkIsExpected, at, "under the pointer the disc is filled and the letter takes the ground colour", "", m.variant === "tinted" ? "tinted-rule-overridden" : "");
        check(hovered.width === sizeAtRest.width && hovered.height === sizeAtRest.height, at, "the pointer does not change the size");
        check(hovered.contrast >= contract.accessibility.contrast[1].min, at, "swapped, the letter holds " + contract.accessibility.contrast[1].min + ":1", hovered.contrast.toFixed(2) + ":1");
        if (m.variant === "page-3") check(hovered.borderTransparent, at, "the stroke is gone under the pointer");
        await page.mouse.move(0, 0);

        const reached = await focusByKeyboard(page, button);
        check(reached, at, "the keyboard reaches the \"i\"");
        if (reached) {
            await settle(page);
            const focused = await read(expected.swapped);
            check(focused.boxShadow !== "none" || focused.outlineStyle !== "none" || (m.variant === "page-3" && focused.fillIsExpected), at, "keyboard focus is shown (a ring, or the swap)", "shadow " + focused.boxShadow + ", outline " + focused.outlineStyle, "focus-" + m.variant);
            if (m.variant === "page-3") check(focused.fillIsExpected && focused.inkIsExpected, at, "focus swaps the two colours on the page-3 card");
            await page.keyboard.press("Enter");
            await settle(page);
            const open = await read(expected.swapped);
            check(open.expanded === "true", at, "Enter opens the note");
            if (m.variant !== "plain") check(open.fillIsExpected && open.inkIsExpected, at, "while its note is open the swap holds");
            await page.keyboard.press("Escape");
            await settle(page);
            const closed = await read(expected.rest);
            check(closed.expanded === "false" && closed.active, at, "Escape closes the note and the focus returns to the \"i\"", "expanded " + closed.expanded + ", focused " + closed.active);
        }
    }
}
