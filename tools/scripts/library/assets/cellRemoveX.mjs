import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Cell remove x (src/library/assets/cellRemoveX.ts; owner, 2026-11-14 12:29 and 12:33). At rest, in both variants, every hue, both grounds, enabled and
 * disabled: the 24px target (--size-cell-x), no frame and no fill, the two bars (14 x 2, turned +45 and -45 degrees, centred), the danger red (the faint
 * ink when disabled), the accessible name and the red's contrast on its ground. With the real pointer and keyboard: it grows by a fifth (--hover-lift)
 * with one soft red glow and no fill; the focus adds the 2px ring 2px out; a disabled x does not react.
 */
export const name = "Cell remove x";

function measureInPage() {
    const { rgb, ratio, same, transparent } = window.__lib;
    const px = value => parseFloat(value);
    return [...document.querySelectorAll("[data-asset='Cell remove x'] [data-sample]")].map(sample => {
        const box = sample.querySelector("button.cell-remove");
        const style = getComputedStyle(box);
        const before = getComputedStyle(box, "::before");
        const after = getComputedStyle(box, "::after");
        const rect = box.getBoundingClientRect();
        const root = getComputedStyle(document.documentElement);
        const red = root.getPropertyValue("--x-red");
        const turn = bar => {
            const parts = bar.transform.match(/matrix\(([^)]+)\)/);
            const n = parts ? parts[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
            return Math.round(Math.atan2(n[1], n[0]) * 180 / Math.PI);
        };
        const centre = bar => ({ x: px(bar.left) + px(bar.marginLeft) + px(bar.width) / 2, y: px(bar.top) + px(bar.marginTop) + px(bar.height) / 2 });
        const c1 = centre(before);
        const c2 = centre(after);
        // (The ground the x stands on: the chip's or the line's, else the sample's.)
        let ground = "rgba(0, 0, 0, 0)";
        for (let node = box.parentElement; node && transparent(ground); node = node.parentElement) {
            ground = getComputedStyle(node).backgroundColor;
        }
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground, sample.dataset.state].join(" / "),
            disabled: sample.dataset.state === "disabled",
            width: rect.width,
            height: rect.height,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(px),
            backgroundTransparent: transparent(style.backgroundColor),
            colourIsRed: same(style.color, red),
            colourIsFaint: same(style.color, root.getPropertyValue("--text-faint")),
            bars: { w: px(before.width), h: px(before.height), w2: px(after.width), h2: px(after.height), turns: [turn(before), turn(after)] },
            centreDx: [c1.x - rect.width / 2, c2.x - rect.width / 2],
            centreDy: [c1.y - rect.height / 2, c2.y - rect.height / 2],
            cursor: style.cursor,
            name: box.getAttribute("aria-label"),
            redOnGround: ratio(rgb(red), rgb(ground))
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
        check(Math.abs(m.width - g.size) <= g.tolerancePx && Math.abs(m.height - g.size) <= g.tolerancePx, at, "a target of " + g.size + "px", m.width + " x " + m.height);
        check(m.borders.every(width => width === g.strokeWidth) && m.backgroundTransparent, at, "no frame and no fill", m.borders.join(" "));
        check(m.bars.w === g.barLength && m.bars.h === g.barThickness && m.bars.w2 === g.barLength && m.bars.h2 === g.barThickness, at, "two bars of " + g.barLength + " x " + g.barThickness, JSON.stringify(m.bars));
        check(m.bars.turns[0] === 45 && m.bars.turns[1] === -45, at, "the bars are turned +45 and -45 degrees", m.bars.turns.join(" "));
        check([...m.centreDx, ...m.centreDy].every(d => Math.abs(d) <= g.tolerancePx), at, "the X is centred in its target to " + g.tolerancePx + "px", [...m.centreDx, ...m.centreDy].map(d => d.toFixed(3)).join(" "));
        check(Boolean(m.name), at, "has an accessible name (aria-label)", String(m.name));
        if (m.disabled) {
            check(m.colourIsFaint && m.cursor === "not-allowed", at, "disabled: the faint ink, a not-allowed cursor");
        } else {
            check(m.colourIsRed, at, "at rest the X is the danger red");
            const need = contract.accessibility.contrast[0].min;
            check(m.redOnGround >= need, at, "the red on its ground holds " + need + ":1", m.redOnGround.toFixed(2) + ":1");
        }
    }

    /* The reaction, with the real pointer and keyboard, one hue (it does not depend on the hue). */
    const samples = page.locator("[data-asset='Cell remove x'] [data-sample][data-hue='" + await firstHue(page) + "']");
    const count = await samples.count();
    for (let at = 0; at < count; at++) {
        const sample = samples.nth(at);
        const label = await sample.evaluate(element => [element.dataset.variant, element.dataset.ground, element.dataset.state].join(" / "));
        const button = sample.locator("button.cell-remove");
        const disabled = await button.isDisabled();
        const read = () => button.evaluate(element => {
            const { same, transparent } = window.__lib;
            const style = getComputedStyle(element);
            const ring = getComputedStyle(document.documentElement).getPropertyValue("--focus-ring-ink");
            return {
                transform: style.transform,
                filter: style.filter,
                fillTransparent: transparent(style.backgroundColor),
                outlineWidth: parseFloat(style.outlineWidth),
                outlineStyle: style.outlineStyle,
                outlineOffset: parseFloat(style.outlineOffset),
                outlineIsRing: same(style.outlineColor, ring)
            };
        });
        const scale = transform => { const parts = transform.match(/matrix\(([^)]+)\)/); return parts ? Number(parts[1].split(",")[0]) : 1; };
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await read();
        await button.hover();
        await settle(page);
        const hovered = await read();
        if (disabled) {
            check(scale(hovered.transform) === 1 && hovered.filter === "none", where + " / " + label, "a disabled x does not react to the pointer");
            continue;
        }
        check(Math.abs(scale(hovered.transform) - g.growth) < 0.01 && hovered.filter !== "none" && hovered.fillTransparent, where + " / " + label, "under the pointer it grows by a fifth with a glow, no fill", hovered.transform + " " + hovered.filter);
        check(scale(rest.transform) === 1, where + " / " + label, "at rest it is its own size");
        await page.mouse.move(0, 0);
        const reached = await focusByKeyboard(page, button);
        check(reached, where + " / " + label, "the keyboard reaches the x");
        if (reached) {
            await settle(page);
            const focused = await read();
            check(Math.abs(scale(focused.transform) - g.growth) < 0.01, where + " / " + label, "the focus grows it as the pointer does");
            check(focused.outlineStyle === "solid" && focused.outlineWidth === g.outlineWidth && focused.outlineOffset === g.outlineOffset && focused.outlineIsRing, where + " / " + label, "focus draws a " + g.outlineWidth + "px ring, " + g.outlineOffset + "px out, in the focus ring ink",
                [focused.outlineStyle, focused.outlineWidth, focused.outlineOffset, focused.outlineIsRing].join(" "));
        }
    }
}
