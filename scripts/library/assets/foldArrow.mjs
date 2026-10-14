import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Fold arrow (src/library/assets/foldArrow.ts). At rest, closed and open, in
 * every hue and both grounds: the 36px square, its 1px transparent stroke and
 * 6px corner, the triangle (11 x 18 pointing right when closed, 18 x 11 pointing
 * down when open, centred to 0.01px, in the text colour), aria-expanded and the
 * name, and the contrast of the triangle. With the real pointer and keyboard:
 * a ground and a card-line stroke under the pointer, a primary stroke under the
 * keyboard focus, and no change of size.
 */
export const name = "Fold arrow";

function measureInPage() {
    const { rgb, ratio, same, transparent, colour } = window.__lib;
    const px = value => parseFloat(value);
    return [...document.querySelectorAll("[data-asset='Fold arrow'] [data-sample]")].map(sample => {
        const button = sample.querySelector("button.strategy-box-toggle");
        const style = getComputedStyle(button);
        const t = getComputedStyle(button, "::before");
        const open = button.getAttribute("aria-expanded") === "true";
        const rect = button.getBoundingClientRect();
        const border = px(style.borderLeftWidth);
        const width = px(t.borderLeftWidth) + px(t.borderRightWidth);
        const height = px(t.borderTopWidth) + px(t.borderBottomWidth);
        const cx = border + px(t.left) + px(t.marginLeft) + width / 2;
        const cy = border + px(t.top) + px(t.marginTop) + height / 2;
        const triangleColour = open ? t.borderTopColor : t.borderLeftColor;
        const ground = getComputedStyle(sample).backgroundColor;
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            ground: sample.dataset.ground,
            open,
            width: rect.width,
            height: rect.height,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
            strokeTransparent: transparent(style.borderTopColor),
            backgroundTransparent: transparent(style.backgroundColor),
            radius: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius],
            triangle: { width, height },
            centreDx: cx - rect.width / 2,
            centreDy: cy - rect.height / 2,
            triangleIsInk: same(triangleColour, colour("var(--text-default)", button)),
            contrast: ratio(rgb(triangleColour), rgb(ground)),
            label: button.getAttribute("aria-label"),
            expanded: button.getAttribute("aria-expanded"),
            transition: style.transitionDuration
        };
    });
}

export async function run(page, contract, where, check) {
    const g = contract.geometry;
    await settle(page);
    const measured = await page.evaluate(measureInPage);
    check(measured.length > 0, where, "the gallery draws samples");
    for (const m of measured) {
        const at = where + " / " + m.id;
        check(Math.abs(m.width - g.size) <= g.tolerancePx && Math.abs(m.height - g.size) <= g.tolerancePx, at, "square of " + g.size + "px", m.width + " x " + m.height);
        check(m.borders.every(w => parseFloat(w) === g.strokeWidth) && m.strokeTransparent && m.backgroundTransparent, at, "a " + g.strokeWidth + "px transparent stroke and no ground at rest", m.borders.join(" "));
        check(m.radius.every(r => parseFloat(r) === g.radius), at, g.radius + "px corners", m.radius.join(" "));
        const [expectedWidth, expectedHeight] = m.open ? [g.triangleLong, g.triangleShort] : [g.triangleShort, g.triangleLong];
        check(m.triangle.width === expectedWidth && m.triangle.height === expectedHeight, at, "the triangle is " + expectedWidth + " x " + expectedHeight + (m.open ? " (open, pointing down)" : " (closed, pointing right)"), m.triangle.width + " x " + m.triangle.height);
        check(Math.abs(m.centreDx) <= g.centreTolerancePx && Math.abs(m.centreDy) <= g.centreTolerancePx, at, "the triangle is centred to " + g.centreTolerancePx + "px", m.centreDx.toFixed(3) + " " + m.centreDy.toFixed(3));
        check(m.triangleIsInk, at, "the triangle is the text colour");
        check(m.expanded === String(m.open) && /^(Minimize|Maximize) /.test(m.label) && m.label.startsWith(m.open ? "Minimize" : "Maximize"), at, "aria-expanded and the name follow the state", m.expanded + " " + m.label);
        const need = contract.accessibility.contrast.find(item => item.ground === m.ground).min;
        check(m.contrast >= need, at, "the triangle on the " + m.ground + " ground holds " + need + ":1", m.contrast.toFixed(2) + ":1");
    }

    /* Hover and focus: the real pointer and keyboard, one hue (the reaction does not depend on the hue). */
    const samples = page.locator("[data-asset='Fold arrow'] [data-sample][data-hue='" + await firstHue(page) + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.strategy-box-toggle");
        const read = () => button.evaluate(element => {
            const { same, transparent, colour } = window.__lib;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                strokeIsCardLine: same(style.borderTopColor, colour("var(--line-card)", element)),
                strokeIsPrimary: same(style.borderTopColor, colour("var(--line-primary)", element)),
                strokeTransparent: transparent(style.borderTopColor),
                groundIsSurface: same(style.backgroundColor, colour("var(--bg-surface)", element)) && !transparent(style.backgroundColor),
                outline: style.outlineStyle,
                shadow: style.boxShadow
            };
        });
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await read();
        await button.hover();
        await settle(page);
        const hovered = await read();
        check(hovered.strokeIsCardLine && hovered.groundIsSurface, where + " / " + label, "under the pointer a white ground and a stroke in the card line");
        check(hovered.width === rest.width && hovered.height === rest.height, where + " / " + label, "the pointer does not change the size");
        await page.mouse.move(0, 0);
        const reached = await focusByKeyboard(page, button);
        check(reached, where + " / " + label, "the keyboard reaches the arrow");
        if (reached) {
            await settle(page);
            const focused = await read();
            check(focused.strokeIsPrimary && focused.outline === "none", where + " / " + label, "under the keyboard focus the stroke is primary and there is no outline", "primary " + focused.strokeIsPrimary + ", outline " + focused.outline);
            check(focused.width === rest.width && focused.height === rest.height, where + " / " + label, "focus does not change the size");
        }
    }
}
