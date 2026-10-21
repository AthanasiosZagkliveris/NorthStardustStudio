import { focusByKeyboard, firstHue } from "../helpers.mjs";

/**
 * Label arrow (src/library/assets/labelArrow.ts): at rest, in every variant,
 * palette hue and ground, closed and open: the triangle's size against the
 * label's letters, the hit area, the triangle's place, the outline, the line,
 * the label's size, the ink against its ground, overflow. With the real
 * pointer and keyboard: the fill on hover and focus, and no focus ring.
 */
export const name = "Label arrow";

function measureInPage({ variants }) {
    const { rgb, ratio } = window.__lib;
    return [...document.querySelectorAll("[data-asset='Label arrow'] [data-sample]")].map(sample => {
        const button = sample.querySelector("button.label-arrow");
        const svg = button.querySelector("svg");
        const polygon = svg.querySelector("polygon");
        const buttonRect = button.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const sampleRect = sample.getBoundingClientRect();
        const buttonStyle = getComputedStyle(button);
        const polygonStyle = getComputedStyle(polygon);
        const variant = variants.find(item => item.id === sample.dataset.variant);
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            hue: sample.dataset.hue,
            open: sample.dataset.state === "open",
            expanded: button.getAttribute("aria-expanded"),
            fontSize: parseFloat(buttonStyle.fontSize),
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

export async function run(page, contract, where, check) {
    const { geometry } = contract;
    const tolerance = geometry.tolerancePx;
    const measured = await page.evaluate(measureInPage, { variants: contract.variants });
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
    const samples = page.locator("[data-asset='Label arrow'] [data-sample][data-hue='" + await firstHue(page) + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.variant, element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.label-arrow");
        const read = () => button.evaluate(element => {
            const polygon = getComputedStyle(element.querySelector("polygon"));
            const style = getComputedStyle(element);
            return { fill: polygon.fill, color: style.color, outline: style.outlineStyle, shadow: style.boxShadow };
        });
        await page.mouse.move(0, 0);
        await button.hover();
        const hovered = await read();
        check(hovered.fill !== "none" && hovered.fill === hovered.color, where + " / " + label, "hover fills the triangle with the tint", hovered.fill + " vs " + hovered.color);
        const reached = await focusByKeyboard(page, button);
        check(reached, where + " / " + label, "the keyboard reaches the arrow");
        if (reached) {
            const focused = await read();
            check(focused.fill !== "none" && focused.fill === focused.color, where + " / " + label, "focus fills the triangle with the tint", focused.fill + " vs " + focused.color);
            check(focused.outline === "none" && focused.shadow === "none", where + " / " + label, "focus draws no ring", focused.outline + " / " + focused.shadow);
        }
    }
}
