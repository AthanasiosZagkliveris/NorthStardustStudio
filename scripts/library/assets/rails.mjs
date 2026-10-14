import { focusByKeyboard, settle } from "../helpers.mjs";

/**
 * Rails (src/library/assets/rails.ts): the Pages rail (left) and the Sections
 * rail (right), the BulletRail component. At rest, in each screen class: the
 * item's gap and padding, the list's gap, the 12px bullet, its ink (status
 * shapes and plain bullets, lit and unlit), the label's ink, the lit item's
 * bold (text shadow and tracking), its bloom and growth, aria-current, the
 * label as a tooltip below 1700px and inline from it, the target size (24px or
 * the spacing exception) and the contrast of the shapes and labels. With the
 * real pointer and keyboard: the hover look (link colour, underline, hover
 * ink, ring, growth), the lit item keeping its look, the focus ring, and the
 * tooltip appearing in the narrow layout.
 */
export const name = "Rails";

/** The page's colour expressions each look should show, probed where the item stands. */
const INK = {
    rest: { label: "var(--text-subtle)", plain: "var(--rail-dot)", status: "var(--rail-status)" },
    active: { label: "var(--text-strong)", plain: "var(--rail-dot-active)", status: "var(--rail-dot-active)" },
    hover: { label: "var(--text-primary)", plain: "var(--rail-dot-hover)", status: "var(--rail-status-hover)" }
};

export async function run(page, contract, where, check) {
    const g = contract.geometry;
    await settle(page);
    const samples = page.locator("[data-asset='Rails'] [data-sample]");
    const total = await samples.count();
    check(total > 0, where, "the gallery draws the rails");

    for (let sampleIndex = 0; sampleIndex < total; sampleIndex++) {
        const variant = await samples.nth(sampleIndex).evaluate(element => element.dataset.variant);
        const read = () => page.evaluate(readInPage, { sampleIndex, wideFrom: g.wideFrom, ink: INK });
        const rest = await read();
        const at = where + " / " + variant;
        check(rest.listGap === g.listGap + "px", at, "the list's gap is " + g.listGap + "px", rest.listGap);
        check(rest.items.filter(item => item.active).length === 1, at, "exactly one item is lit");
        for (const item of rest.items) {
            const here = at + " / " + item.text.trim();
            const e = item.expected;
            check(item.gap === g.itemGap + "px" && item.paddingY.every(p => p === g.itemPaddingY + "px"), here, "item gap " + g.itemGap + "px, padding " + g.itemPaddingY + "px above and below", item.gap + " " + item.paddingY.join(" "));
            check(item.dotWidth === g.bullet && item.dotHeight === g.bullet && item.dotRadius === "50%", here, "a round " + g.bullet + "px bullet", item.dotWidth + " x " + item.dotHeight + " " + item.dotRadius);
            check(item.current === (item.active ? "true" : null), here, "aria-current marks the lit item only", String(item.current));
            if (item.active) {
                check(Math.abs(item.dotScale - g.activeScale) < 0.01 && item.dotRing.includes(e.active.bloom.replace(/ /g, " ")) && item.dotRing.includes(g.activeRing + "px"), here, "the lit bullet grows to " + g.activeScale + " with a " + g.activeRing + "px bloom", item.dotScale + " " + item.dotRing);
                check(window_same(item.labelColour, e.active.label) && item.textShadow !== "none" && item.letterSpacing > 0, here, "the lit label is the strong ink, thickened, tracked", item.labelColour + " " + item.textShadow + " " + item.letterSpacing);
                check(window_same(item.dotInk, e.active.ink), here, "the lit bullet is the app's blue", item.dotInk);
            } else {
                check(Math.abs(item.dotScale - 1) < 0.001 && (item.dotRing === "none" || /rgba\(0, 0, 0, 0\)/.test(item.dotRing) === false && item.dotRing === "none"), here, "an unlit bullet is not grown and has no ring", item.dotScale + " " + item.dotRing);
                check(window_same(item.labelColour, e.rest.label), here, "an unlit label is the subtle ink", item.labelColour);
                check(window_same(item.dotInk, e.rest.ink), here, "an unlit bullet has its rest ink (the status ink, or the ice blue)", item.dotInk + " vs " + e.rest.ink);
                check(item.textShadow === "none", here, "an unlit label is not thickened");
            }
            check(item.labelDecoration === "none", here, "no underline at rest", item.labelDecoration);
            // Where the label stands.
            if (rest.wide) {
                check(item.labelPosition === "static" && item.labelOpacity === 1, here, "from " + g.wideFrom + "px the label stands inline", item.labelPosition + " " + item.labelOpacity);
                check(item.ratios.label >= contract.accessibility.contrast[1].min, here, "the label holds " + contract.accessibility.contrast[1].min + ":1 on the page", item.ratios.label.toFixed(2) + ":1");
            } else {
                check(item.labelPosition === "absolute" && item.labelOpacity === 0, here, "below " + g.wideFrom + "px the label is a hidden tooltip", item.labelPosition + " " + item.labelOpacity);
                check(item.ratios.tooltip >= contract.accessibility.contrast[3].min, here, "the tooltip text holds " + contract.accessibility.contrast[3].min + ":1 on its block", item.ratios.tooltip.toFixed(2) + ":1");
            }
            // The bullet's contrast against the page.
            if (item.status && !item.active) {
                check(item.ratios.ink >= contract.accessibility.contrast[0].min, here, "a status shape holds " + contract.accessibility.contrast[0].min + ":1 on the page", item.ratios.ink.toFixed(2) + ":1");
            } else if (!item.active) {
                check(item.ratios.ink >= 3, here, "an unlit plain bullet holds 3:1 on the page", item.ratios.ink.toFixed(2) + ":1", "plain-bullet-contrast");
            } else {
                check(item.ratios.ink >= 3, here, "the lit bullet holds 3:1 on the page", item.ratios.ink.toFixed(2) + ":1");
            }
            check(item.rect.width >= g.minTargetPx && item.rect.height >= g.minTargetPx || item.targetClear, here, "the target is " + g.minTargetPx + "px or has the spacing exception", item.rect.width.toFixed(1) + " x " + item.rect.height.toFixed(1));
        }

        /* Hover and focus: one unlit item with a status (or a plain one), and the lit item. */
        const pick = rest.items.filter(item => !item.active).slice(0, 1).concat(rest.items.filter(item => item.active));
        for (const item of pick) {
            const here = at + " / " + item.text.trim() + (item.active ? " (lit)" : "");
            const button = samples.nth(sampleIndex).locator("button.bullet-rail-item").nth(item.index);
            await page.mouse.move(0, 0);
            await button.hover();
            await settle(page);
            const after = (await read()).items[item.index];
            const e = item.expected;
            const underlined = after.labelDecoration.includes("underline");
            check(underlined, here, "under the pointer the label is underlined", after.labelDecoration);
            if (item.active) {
                check(window_same(after.labelColour, e.active.label) && Math.abs(after.dotScale - g.activeScale) < 0.01, here, "the lit item keeps its look under the pointer", after.labelColour + " " + after.dotScale);
            } else {
                check(window_same(after.labelColour, e.hover.label), here, "under the pointer the label takes the link colour", after.labelColour + " vs " + e.hover.label);
                check(window_same(after.dotInk, e.hover.ink) && Math.abs(after.dotScale - g.hoverScale) < 0.01 && after.dotRing.includes(e.hover.ring) && after.dotRing.includes(g.hoverRing + "px"), here, "under the pointer the bullet takes the hover ink, a " + g.hoverRing + "px ring and grows to " + g.hoverScale, after.dotInk + " " + after.dotScale + " " + after.dotRing);
                check(after.ratios.hover >= contract.accessibility.contrast[2].min, here, "the link colour holds " + contract.accessibility.contrast[2].min + ":1 on the page", after.ratios.hover.toFixed(2) + ":1");
            }
            if (!rest.wide) check(after.labelOpacity === 1, here, "the tooltip appears under the pointer", String(after.labelOpacity));
            check(after.rect.width === item.rect.width && after.rect.height === item.rect.height, here, "the pointer does not change the button's size");
            await page.mouse.move(0, 0);
            const reached = await focusByKeyboard(page, button);
            check(reached, here, "the keyboard reaches the item");
            if (reached) {
                await settle(page);
                const focused = (await read()).items[item.index];
                check(focused.outlineStyle === "solid" && focused.outlineWidth === g.outlineWidth && focused.outlineOffset === g.outlineOffset && focused.outlineColourIsLine, here, "focus draws a " + g.outlineWidth + "px ring, " + g.outlineOffset + "px out, in the primary line colour",
                    [focused.outlineStyle, focused.outlineWidth, focused.outlineOffset, focused.outlineColourIsLine].join(" "));
                check(focused.labelDecoration.includes("underline"), here, "under the focus the label is underlined");
                if (!rest.wide) check(focused.labelOpacity === 1, here, "the tooltip appears under the focus", String(focused.labelOpacity));
            }
        }
    }
}

/** Two computed colours equal to within rounding. */
function window_same(one, other) {
    const parse = text => (text.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const a = parse(one);
    const b = parse(other);
    return a.length === 3 && b.length === 3 && a.every((value, at) => Math.abs(value - b[at]) < 1.5);
}

/** Runs in the page: everything measurable about the items of one rail, now. The colour expressions come in as an argument (a serialised function cannot close over module constants). */
function readInPage({ sampleIndex, wideFrom, ink }) {
    const { colour, same, rgb, ratio, transparent } = window.__lib;
    const INK_PLACEHOLDER = ink;
    const sample = document.querySelectorAll("[data-asset='Rails'] [data-sample]")[sampleIndex];
    const list = sample.querySelector(".bullet-rail-list");
    const listStyle = getComputedStyle(list);
    const ground = getComputedStyle(sample).backgroundColor;
    const wide = window.matchMedia("(min-width: " + wideFrom + "px)").matches;
    const buttons = [...list.querySelectorAll("button.bullet-rail-item")];
    const rects = buttons.map(button => button.getBoundingClientRect());
    return {
        wide,
        listGap: listStyle.rowGap,
        items: buttons.map((button, index) => {
            const style = getComputedStyle(button);
            const dot = button.querySelector(".bullet-rail-dot");
            const dotStyle = getComputedStyle(dot);
            const label = button.querySelector(".bullet-rail-label");
            const labelStyle = getComputedStyle(label);
            const matrix = (dotStyle.transform.match(/matrix\(([^)]+)\)/) || [0, "1,0,0,1,0,0"])[1].split(",").map(Number);
            const rect = rects[index];
            const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            // WCAG 2.5.8 spacing exception: a 24px circle on the target's centre touches no other target.
            const clear = rects.every((other, otherIndex) => {
                if (otherIndex === index) return true;
                const dx = Math.max(other.left - centre.x, 0, centre.x - other.right);
                const dy = Math.max(other.top - centre.y, 0, centre.y - other.bottom);
                return Math.hypot(dx, dy) >= 12;
            });
            const status = dot.dataset.status || null;
            return {
                index,
                text: label.textContent,
                active: button.classList.contains("active"),
                current: button.getAttribute("aria-current"),
                status,
                gap: style.columnGap,
                paddingY: [style.paddingTop, style.paddingBottom],
                labelColour: style.color,
                labelDecoration: labelStyle.textDecorationLine,
                textShadow: style.textShadow,
                letterSpacing: parseFloat(style.letterSpacing) || 0,
                dotWidth: dot.offsetWidth,
                dotHeight: dot.offsetHeight,
                dotRadius: dotStyle.borderTopLeftRadius,
                dotScale: matrix[0],
                dotRing: dotStyle.boxShadow,
                dotInk: colour(dotStyle.getPropertyValue("--status-ink"), button),
                labelPosition: labelStyle.position,
                labelOpacity: parseFloat(labelStyle.opacity),
                outlineStyle: style.outlineStyle,
                outlineWidth: parseFloat(style.outlineWidth),
                outlineOffset: parseFloat(style.outlineOffset),
                outlineColourIsLine: same(style.outlineColor, colour("var(--line-primary)", button)),
                rect: { width: rect.width, height: rect.height },
                targetClear: clear,
                expected: {
                    rest: { label: colour(INK_PLACEHOLDER.rest.label, button), ink: colour(status ? INK_PLACEHOLDER.rest.status : INK_PLACEHOLDER.rest.plain, button) },
                    active: { label: colour(INK_PLACEHOLDER.active.label, button), ink: colour(INK_PLACEHOLDER.active.plain, button), bloom: colour("var(--rail-bloom)", button) },
                    hover: { label: colour(INK_PLACEHOLDER.hover.label, button), ink: colour(status ? INK_PLACEHOLDER.hover.status : INK_PLACEHOLDER.hover.plain, button), ring: colour("var(--rail-hover-ring)", button) }
                },
                ratios: {
                    ink: ratio(rgb(dotStyle.getPropertyValue("--status-ink")), rgb(ground)),
                    label: ratio(rgb(style.color), rgb(ground)),
                    hover: ratio(rgb(colour("var(--text-primary)", button)), rgb(ground)),
                    tooltip: ratio(rgb(colour("var(--tooltip-text)", button)), rgb(colour("var(--tooltip-bg)", button)))
                },
                transparentBackground: transparent(style.backgroundColor)
            };
        })
    };
}
