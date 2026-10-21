import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Remove x (src/library/assets/removeX.ts). At rest, in both variants, every
 * hue, both grounds, enabled and disabled: the 32px square, the 2px stroke, the
 * 6px corner, the two bars (14 x 2, turned +45 and -45 degrees, centred to
 * 0.01px), the colours (the danger red, transparent behind it by the global
 * rule for wired buttons), the 150ms swap, the accessible name, the disabled
 * look and the contrast of the red on the ground. With the real pointer and
 * keyboard: the swap (filled red, no stroke, the X in the ground colour), no
 * change of size, the 2px focus ring, and no reaction when disabled.
 */
export const name = "Remove x";

function measureInPage() {
    const { rgb, ratio, same, transparent } = window.__lib;
    const px = value => parseFloat(value);
    return [...document.querySelectorAll("[data-asset='Remove x'] [data-sample]")].map(sample => {
        const box = sample.querySelector("button.strategy-box-remove");
        const style = getComputedStyle(box);
        const before = getComputedStyle(box, "::before");
        const after = getComputedStyle(box, "::after");
        const rect = box.getBoundingClientRect();
        const sampleStyle = getComputedStyle(sample);
        const red = getComputedStyle(document.documentElement).getPropertyValue("--x-red");
        const ground = style.getPropertyValue("--x-ground") || getComputedStyle(document.documentElement).getPropertyValue("--bg-surface");
        const border = px(style.borderLeftWidth);
        const turn = bar => {
            const parts = bar.transform.match(/matrix\(([^)]+)\)/);
            const n = parts ? parts[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
            return Math.round(Math.atan2(n[1], n[0]) * 180 / Math.PI);
        };
        /* A bar's centre in the box's outer frame: border + its offset (50%) + its margin + half its size (rotation is about the centre). */
        const centre = bar => ({
            x: border + px(bar.left) + px(bar.marginLeft) + px(bar.width) / 2,
            y: border + px(bar.top) + px(bar.marginTop) + px(bar.height) / 2
        });
        const c1 = centre(before);
        const c2 = centre(after);
        const disabled = sample.dataset.state === "disabled";
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            disabled,
            ground: sample.dataset.ground,
            width: rect.width,
            height: rect.height,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
            borderStyle: style.borderTopStyle,
            radius: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius],
            borderIsRed: same(style.borderTopColor, red),
            colourIsRed: same(style.color, red),
            colourIsFaint: same(style.color, getComputedStyle(document.documentElement).getPropertyValue("--text-faint")),
            borderIsCard: same(style.borderTopColor, getComputedStyle(document.documentElement).getPropertyValue("--line-card")),
            backgroundTransparent: transparent(style.backgroundColor),
            backgroundIsSurface: same(style.backgroundColor, getComputedStyle(document.documentElement).getPropertyValue("--bg-surface")),
            bars: { w: px(before.width), h: px(before.height), w2: px(after.width), h2: px(after.height), turns: [turn(before), turn(after)], coloursAreRed: same(before.backgroundColor, red) && same(after.backgroundColor, red) },
            centreDx: [c1.x - rect.width / 2, c2.x - rect.width / 2],
            centreDy: [c1.y - rect.height / 2, c2.y - rect.height / 2],
            transition: style.transitionDuration,
            opacity: style.opacity,
            cursor: style.cursor,
            name: box.getAttribute("aria-label"),
            title: box.getAttribute("title"),
            redOnGround: ratio(rgb(red), rgb(sampleStyle.backgroundColor)),
            groundOnRed: ratio(rgb(ground), rgb(red))
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
        check(m.radius.every(r => parseFloat(r) === g.radius), at, g.radius + "px corners", m.radius.join(" "));
        check(m.bars.w === g.barLength && m.bars.h === g.barThickness && m.bars.w2 === g.barLength && m.bars.h2 === g.barThickness, at, "two bars of " + g.barLength + " x " + g.barThickness, JSON.stringify(m.bars));
        check(m.bars.turns[0] === 45 && m.bars.turns[1] === -45, at, "the bars are turned +45 and -45 degrees", m.bars.turns.join(" "));
        check([...m.centreDx, ...m.centreDy].every(d => Math.abs(d) <= g.centreTolerancePx), at, "the X is centred in the box to " + g.centreTolerancePx + "px", [...m.centreDx, ...m.centreDy].map(d => d.toFixed(3)).join(" "));
        check(m.transition.split(",").every(d => d.trim() === "0.15s"), at, "colours swap in 150ms", m.transition);
        check(Boolean(m.name) && m.title === m.name, at, "has an accessible name (aria-label = title)", m.name + " / " + m.title);
        if (m.disabled) {
            check(m.borders.every(w => parseFloat(w) === g.disabledStrokeWidth) && m.borderStyle === "solid" && m.borderIsCard, at, "disabled: " + g.disabledStrokeWidth + "px solid card-line stroke", m.borders.join(" "));
            check(m.colourIsFaint && m.backgroundIsSurface && parseFloat(m.opacity) === 1 && m.cursor === "not-allowed", at, "disabled: faint X on the surface, not-allowed cursor");
        } else {
            check(m.borders.every(w => parseFloat(w) === g.strokeWidth) && m.borderStyle === "solid", at, g.strokeWidth + "px solid stroke", m.borders.join(" ") + " " + m.borderStyle);
            check(m.borderIsRed && m.colourIsRed && m.bars.coloursAreRed, at, "at rest the stroke and the X are the danger red");
            check(m.backgroundTransparent, at, "at rest an enabled x is transparent: it takes the colour behind it");
            const groundNeed = contract.accessibility.contrast.find(item => item.ground === m.ground).min;
            check(m.redOnGround >= groundNeed, at, "the red on the " + m.ground + " ground holds " + groundNeed + ":1", m.redOnGround.toFixed(2) + ":1");
            const fillNeed = contract.accessibility.contrast.find(item => item.ground === "fill").min;
            check(m.groundOnRed >= fillNeed, at, "under the pointer the X on the red holds " + fillNeed + ":1", m.groundOnRed.toFixed(2) + ":1");
        }
    }

    /* The swap, with the real pointer and keyboard, one hue (it does not depend on the hue). */
    const samples = page.locator("[data-asset='Remove x'] [data-sample][data-hue='" + await firstHue(page) + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.variant, element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.strategy-box-remove");
        const disabled = await button.isDisabled();
        const read = () => button.evaluate(element => {
            const { same, transparent } = window.__lib;
            const style = getComputedStyle(element);
            const red = getComputedStyle(document.documentElement).getPropertyValue("--x-red");
            const ground = style.getPropertyValue("--x-ground") || getComputedStyle(document.documentElement).getPropertyValue("--bg-surface");
            const rect = element.getBoundingClientRect();
            const before = getComputedStyle(element, "::before");
            const ring = getComputedStyle(document.documentElement).getPropertyValue("--focus-ring-ink");
            return {
                width: rect.width,
                height: rect.height,
                filledRed: same(style.backgroundColor, red) && !transparent(style.backgroundColor),
                strokeGone: transparent(style.borderTopColor),
                xIsGround: same(before.backgroundColor, ground),
                outlineWidth: parseFloat(style.outlineWidth),
                outlineStyle: style.outlineStyle,
                outlineOffset: parseFloat(style.outlineOffset),
                outlineIsRing: same(style.outlineColor, ring),
                shadow: style.boxShadow
            };
        });
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await read();
        await button.hover();
        await settle(page);
        const hovered = await read();
        if (disabled) {
            check(!hovered.filledRed, where + " / " + label, "a disabled x does not react to the pointer");
        } else {
            check(hovered.filledRed && hovered.strokeGone && hovered.xIsGround, where + " / " + label, "hover fills red, no stroke, the X in the ground colour");
            check(hovered.width === rest.width && hovered.height === rest.height, where + " / " + label, "hover does not change the size", hovered.width + " x " + hovered.height);
            await page.mouse.move(0, 0);
            const reached = await focusByKeyboard(page, button);
            check(reached, where + " / " + label, "the keyboard reaches the x");
            if (reached) {
                await settle(page);
                const focused = await read();
                check(focused.filledRed && focused.strokeGone && focused.xIsGround, where + " / " + label, "focus fills red, no stroke, the X in the ground colour");
                check(focused.width === rest.width && focused.height === rest.height, where + " / " + label, "focus does not change the size");
                check(focused.outlineStyle === "solid" && focused.outlineWidth === g.outlineWidth && focused.outlineOffset === g.outlineOffset && focused.outlineIsRing, where + " / " + label, "focus draws a " + g.outlineWidth + "px ring, " + g.outlineOffset + "px out, in the focus ring ink",
                    [focused.outlineStyle, focused.outlineWidth, focused.outlineOffset, focused.outlineIsRing].join(" "));
            }
        }
    }
}
