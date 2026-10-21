import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Plus box (src/library/assets/plusBox.ts). At rest, in both variants, every
 * hue, both grounds, enabled and disabled: the square's size, the 2px stroke,
 * the corner, the colours of the swap (an enabled box is transparent at rest, by
 * the global rule for wired buttons; a disabled one keeps the ground colour), the two bars' size,
 * colour and centre (to 0.01px), the 150ms transition, the tile's 12px inset,
 * the disabled look, the accessible name, and the contrast of the plus and of
 * the stroke. With the real pointer and keyboard: the swap (filled with the
 * darker tone, no stroke, the plus in the ground colour), no change of size,
 * the focus outline, and no reaction when disabled.
 */
export const name = "Plus box";

function measureInPage() {
    const { rgb, ratio } = window.__lib;
    const px = value => parseFloat(value);
    return [...document.querySelectorAll("[data-asset='Plus box'] [data-sample]")].map(sample => {
        const box = sample.querySelector("button.plus-box");
        const style = getComputedStyle(box);
        const before = getComputedStyle(box, "::before");
        const after = getComputedStyle(box, "::after");
        const rect = box.getBoundingClientRect();
        const sampleRect = sample.getBoundingClientRect();
        const sampleStyle = getComputedStyle(sample);
        const fill = style.getPropertyValue("--plus-fill");
        const ground = style.getPropertyValue("--plus-ground");
        const matrix = bar => {
            const parts = bar.transform.match(/matrix\(([^)]+)\)/);
            const numbers = parts ? parts[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
            return { tx: numbers[4], ty: numbers[5] };
        };
        const border = px(style.borderLeftWidth);
        /* A bar's centre in the box's outer frame: border + its offset in the padding box + its translation + half its size. */
        const centre = bar => ({
            x: border + px(bar.left) + matrix(bar).tx + px(bar.width) / 2,
            y: border + px(bar.top) + matrix(bar).ty + px(bar.height) / 2
        });
        const c1 = centre(before);
        const c2 = centre(after);
        const sampleBorder = px(sampleStyle.borderRightWidth);
        const groundRgb = rgb(ground);
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            variant: sample.dataset.variant,
            disabled: sample.dataset.state === "disabled",
            width: rect.width,
            height: rect.height,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
            borderStyle: style.borderTopStyle,
            borderColourIsFill: window.__lib.same(style.borderTopColor, fill),
            radius: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius],
            backgroundIsGround: window.__lib.same(style.backgroundColor, ground),
            colourIsFill: window.__lib.same(style.color, fill),
            barHorizontal: { w: px(before.width), h: px(before.height), colourIsFill: window.__lib.same(before.backgroundColor, fill) },
            barVertical: { w: px(after.width), h: px(after.height), colourIsFill: window.__lib.same(after.backgroundColor, fill) },
            centreDx: [c1.x - rect.width / 2, c2.x - rect.width / 2],
            centreDy: [c1.y - rect.height / 2, c2.y - rect.height / 2],
            transition: [style.transitionProperty, style.transitionDuration],
            opacity: style.opacity,
            cursor: style.cursor,
            name: box.getAttribute("aria-label"),
            rightGap: sampleRect.right - sampleBorder - rect.right,
            bottomGap: sampleRect.bottom - sampleBorder - rect.bottom,
            insideSample: rect.left >= sampleRect.left && rect.right <= sampleRect.right && rect.top >= sampleRect.top && rect.bottom <= sampleRect.bottom,
            ground: sample.dataset.ground,
            backgroundTransparent: window.__lib.transparent(style.backgroundColor),
            hoverPlusOnFill: ratio(groundRgb, rgb(fill)),
            strokeOnGround: ratio(rgb(fill), rgb(sampleStyle.backgroundColor))
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
        const small = m.variant === "small";
        const size = small ? g.sizeSmall : g.sizeTile;
        const bar = small ? g.barSmall : g.barTile;
        check(Math.abs(m.width - size) <= g.tolerancePx && Math.abs(m.height - size) <= g.tolerancePx, at, "square of " + size + "px", m.width + " x " + m.height);
        check(m.borders.every(w => parseFloat(w) === g.strokeWidth) && m.borderStyle === "solid", at, g.strokeWidth + "px solid stroke", m.borders.join(" ") + " " + m.borderStyle);
        check(m.radius.every(r => parseFloat(r) === g.radius), at, g.radius + "px corners", m.radius.join(" "));
        check(m.borderColourIsFill && m.colourIsFill, at, "at rest the stroke and the plus are the darker tone");
        if (m.disabled) check(m.backgroundIsGround, at, "a disabled box is the ground colour");
        else check(m.backgroundTransparent, at, "at rest an enabled box is transparent: it takes the colour behind it");
        check(m.barHorizontal.w === bar && m.barHorizontal.h === g.barThickness && m.barVertical.w === g.barThickness && m.barVertical.h === bar, at,
            "two bars of " + bar + " x " + g.barThickness, JSON.stringify([m.barHorizontal, m.barVertical]));
        check(m.barHorizontal.colourIsFill && m.barVertical.colourIsFill, at, "the bars are the darker tone");
        check([...m.centreDx, ...m.centreDy].every(d => Math.abs(d) <= g.centreTolerancePx), at, "the plus is centred in the box to " + g.centreTolerancePx + "px", [...m.centreDx, ...m.centreDy].map(d => d.toFixed(3)).join(" "));
        check(m.transition[1].split(",").every(d => d.trim() === "0.15s"), at, "colours swap in " + g.transitionMs + "ms", m.transition.join(" "));
        check(m.name && m.name.length > 0, at, "has an accessible name");
        check(m.insideSample, at, "the box stands inside its sample");
        if (m.variant === "tile") {
            check(Math.abs(m.rightGap - g.insetTile) <= g.tolerancePx && Math.abs(m.bottomGap - g.insetTile) <= g.tolerancePx, at, g.insetTile + "px from the tile's right and bottom edges", m.rightGap.toFixed(2) + " / " + m.bottomGap.toFixed(2));
        }
        if (m.disabled) {
            check(parseFloat(m.opacity) === g.disabledOpacity && m.cursor === "not-allowed", at, "disabled is half opaque with a not-allowed cursor", m.opacity + " " + m.cursor);
        } else {
            check(parseFloat(m.opacity) === 1, at, "enabled is fully opaque", m.opacity);
        }
        const need = contract.accessibility.contrast;
        const groundNeed = need.find(item => item.ground === m.ground).min;
        check(m.strokeOnGround >= groundNeed, at, "the plus and the stroke on the " + m.ground + " ground hold " + groundNeed + ":1", m.strokeOnGround.toFixed(2) + ":1");
        const hoverNeed = need.find(item => item.ground === "fill").min;
        check(m.hoverPlusOnFill >= hoverNeed, at, "under the pointer the plus on the fill holds " + hoverNeed + ":1", m.hoverPlusOnFill.toFixed(2) + ":1");
    }

    /* The swap, with the real pointer and keyboard, one hue (it does not depend on the hue). */
    const samples = page.locator("[data-asset='Plus box'] [data-sample][data-hue='" + await firstHue(page) + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.variant, element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.plus-box");
        const disabled = await button.isDisabled();
        const read = () => button.evaluate(element => {
            const { same, transparent } = window.__lib;
            const style = getComputedStyle(element);
            const fill = style.getPropertyValue("--plus-fill");
            const ground = style.getPropertyValue("--plus-ground");
            const rect = element.getBoundingClientRect();
            const before = getComputedStyle(element, "::before");
            const ring = getComputedStyle(document.documentElement).getPropertyValue("--focus-ring-ink");
            return {
                width: rect.width,
                height: rect.height,
                filled: same(style.backgroundColor, fill),
                grounded: same(style.backgroundColor, ground),
                strokeGone: transparent(style.borderTopColor),
                plusIsGround: same(before.backgroundColor, ground),
                plusIsFill: same(before.backgroundColor, fill),
                outlineWidth: parseFloat(style.outlineWidth),
                outlineStyle: style.outlineStyle,
                outlineOffset: parseFloat(style.outlineOffset),
                outlineIsRing: same(style.outlineColor, ring)
            };
        });
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await read();
        await button.hover();
        await settle(page);
        const hovered = await read();
        if (disabled) {
            check(hovered.grounded && !hovered.filled, where + " / " + label, "a disabled box does not react to the pointer");
        } else {
            check(hovered.filled && hovered.strokeGone && hovered.plusIsGround, where + " / " + label, "hover fills with the darker tone, no stroke, the plus in the ground colour");
            check(hovered.width === rest.width && hovered.height === rest.height, where + " / " + label, "hover does not change the size", hovered.width + " x " + hovered.height);
            await page.mouse.move(0, 0);
            const reached = await focusByKeyboard(page, button);
            check(reached, where + " / " + label, "the keyboard reaches the box");
            if (reached) {
                await settle(page);
                const focused = await read();
                check(focused.filled && focused.strokeGone && focused.plusIsGround, where + " / " + label, "focus fills with the darker tone, no stroke, the plus in the ground colour");
                check(focused.width === rest.width && focused.height === rest.height, where + " / " + label, "focus does not change the size");
                check(focused.outlineStyle === "solid" && focused.outlineWidth === g.outlineWidth && focused.outlineOffset === g.outlineOffset && focused.outlineIsRing, where + " / " + label, "focus draws a " + g.outlineWidth + "px ring, " + g.outlineOffset + "px out, in the focus ring ink",
                    [focused.outlineStyle, focused.outlineWidth, focused.outlineOffset, focused.outlineIsRing].join(" "));
            }
        }
    }
}
