import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Back button (src/library/assets/backButton.ts), the dialog foot's
 * ".section-tile-back" and the rail tab's ".carousel-rail-back". At rest, in
 * both forms, every hue and both grounds: the arrow (a solid triangle 0.8em
 * high and 22/28 of it wide, pointing left, in the word's colour), the gap, the
 * padding, the type size, the capitals of the rail form, the arrow's box in the
 * rail form (as wide as a bullet), the ink, and the contrast at rest and under
 * the pointer. With the real pointer and keyboard: the colour of the hover
 * (the card's tint, or the "+" box colour in the rail), the thickening (a text
 * shadow and tracking), the arrow growing 20% in the rail form, and the focus.
 */
export const name = "Back button";

function readInPage({ sampleIndex }) {
    const { colour, same, rgb, ratio } = window.__lib;
    const sample = document.querySelectorAll("[data-asset='Back button'] [data-sample]")[sampleIndex];
    const rail = sample.dataset.variant === "rail";
    const button = sample.querySelector(rail ? "button.carousel-rail-back" : "button.section-tile-back");
    const arrow = button.querySelector(".back-arrow");
    const word = rail ? button.querySelector(".carousel-rail-back-word") : button;
    const style = getComputedStyle(button);
    const arrowStyle = getComputedStyle(arrow);
    const wordStyle = getComputedStyle(word);
    const fontSize = parseFloat(style.fontSize);
    const matrix = (arrowStyle.transform.match(/matrix\(([^)]+)\)/) || [0, "1,0,0,1,0,0"])[1].split(",").map(Number);
    const rect = button.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();
    const ground = getComputedStyle(sample).backgroundColor;
    const hoverColour = rail
        ? colour("hsl(var(--strategy-theme-hue, 0) var(--plus-fill-saturation) var(--plus-fill-lightness))", button)
        : colour("color-mix(in srgb, hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent)) 55%, var(--text-default))", button);
    return {
        rail,
        gap: style.columnGap,
        paddingY: [style.paddingTop, style.paddingBottom],
        display: style.display,
        fontSize,
        expectedFontSize: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-body")),
        colour: style.color,
        expectedRest: colour(rail ? "var(--tab-ink)" : "var(--text-default)", button),
        tabEdge: rail ? colour("var(--tab-edge)", button) : null,
        hoverColour,
        textTransform: wordStyle.textTransform,
        letterSpacing: parseFloat(style.letterSpacing) || 0,
        textShadow: style.textShadow,
        arrow: {
            width: parseFloat(arrowStyle.width),
            height: parseFloat(arrowStyle.height),
            clip: arrowStyle.clipPath,
            colourIsWord: same(arrowStyle.backgroundColor, style.color),
            scale: matrix[0],
            origin: arrowStyle.transformOrigin,
            boxWidth: parseFloat(arrowStyle.marginLeft) + parseFloat(arrowStyle.width) + parseFloat(arrowStyle.marginRight),
            visibleWidth: arrowRect.width
        },
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
        outlineOffset: parseFloat(style.outlineOffset),
        outlineIsRing: same(style.outlineColor, colour("var(--focus-ring-ink)", button)),
        rect: { width: rect.width, height: rect.height },
        name: button.getAttribute("aria-label"),
        title: button.getAttribute("title"),
        text: button.textContent.trim(),
        ratios: {
            rest: ratio(rgb(style.color), rgb(ground)),
            hover: ratio(rgb(hoverColour), rgb(ground))
        }
    };
}

export async function run(page, contract, where, check) {
    const g = contract.geometry;
    await settle(page);
    const samples = page.locator("[data-asset='Back button'] [data-sample]");
    const total = await samples.count();
    check(total > 0, where, "the gallery draws samples");
    const hue = await firstHue(page);

    for (let sampleIndex = 0; sampleIndex < total; sampleIndex++) {
        const info = await samples.nth(sampleIndex).evaluate(element => ({ variant: element.dataset.variant, ground: element.dataset.ground, hue: element.dataset.hue }));
        const at = where + " / " + info.variant + " / hue " + info.hue + " / " + info.ground;
        const m = await page.evaluate(readInPage, { sampleIndex });
        const rail = info.variant === "rail";
        check(m.display === "inline-flex" || m.display === "flex", at, "the button is a flex row (inline-flex, blockified inside a flex parent)", m.display);
        check(Math.abs(m.fontSize - m.expectedFontSize) <= 0.01, at, "the type is the body size", m.fontSize + "px");
        check(Math.abs(m.arrow.height - g.arrowHeightEm * m.fontSize) <= g.tolerancePx && Math.abs(m.arrow.width - g.arrowHeightEm * m.fontSize * g.arrowRatio) <= g.tolerancePx, at, "the arrow is 0.8em high and 22/28 of it wide", m.arrow.width.toFixed(2) + " x " + m.arrow.height.toFixed(2));
        check(m.arrow.clip.startsWith("polygon(") && m.arrow.colourIsWord, at, "the arrow is a solid triangle in the word's colour", m.arrow.clip);
        /* The rail form's colours are read from the dialog card's frame at run time; the gallery's tab colours are stand-ins, so no contrast is asserted for it. */
        if (!rail) {
            check(m.ratios.rest >= contract.accessibility.contrast[0].min, at, "the word at rest holds " + contract.accessibility.contrast[0].min + ":1", m.ratios.rest.toFixed(2) + ":1");
            check(m.ratios.hover >= contract.accessibility.contrast[1].min, at, "the word under the pointer holds " + contract.accessibility.contrast[1].min + ":1", m.ratios.hover.toFixed(2) + ":1");
        }
        check(m.rect.height >= g.minTargetPx, at, "the target is at least " + g.minTargetPx + "px high", m.rect.height.toFixed(1));
        if (rail) {
            check(m.gap === g.railGap + "px" && m.paddingY.every(p => p === g.railPaddingY + "px"), at, "the rail form has a " + g.railGap + "px gap and " + g.railPaddingY + "px padding above and below", m.gap + " " + m.paddingY.join(" "));
            check(m.textTransform === "uppercase", at, "the word is in capitals", m.textTransform);
            check(Math.abs(m.arrow.boxWidth - g.railArrowBox) <= g.tolerancePx, at, "the arrow's box is as wide as a bullet (" + g.railArrowBox + "px)", m.arrow.boxWidth.toFixed(2));
            check(m.arrow.origin.startsWith(m.arrow.width + "px") || m.arrow.origin.split(" ")[0] === m.arrow.width + "px", at, "the arrow grows from its right edge", m.arrow.origin);
            check(m.name === "Back" && m.title === "Back", at, "named Back (aria-label and title)");
            check(m.colour === m.tabEdge || m.colour.replace(/\s/g, "") === m.tabEdge.replace(/\s/g, ""), at, "at rest the word is the tab's edge colour (the mid tone), as the stylesheet's comment says", m.colour + " vs " + m.tabEdge);
        } else {
            check(m.gap === g.footGap + "px" && m.paddingY.every(p => p === g.footPaddingY + "px"), at, "the foot form has a " + g.footGap + "px gap and " + g.footPaddingY + "px padding above and below", m.gap + " " + m.paddingY.join(" "));
            check(m.text.endsWith("Back"), at, "the word is Back", m.text);
            check(m.colour === m.expectedRest, at, "at rest the word is the default ink", m.colour + " vs " + m.expectedRest);
        }

        /* Hover and focus: the first hue only (the reaction is the same for every hue). */
        if (info.hue !== hue) continue;
        const button = samples.nth(sampleIndex).locator(rail ? "button.carousel-rail-back" : "button.section-tile-back");
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await page.evaluate(readInPage, { sampleIndex });
        await button.hover();
        await settle(page);
        const hovered = await page.evaluate(readInPage, { sampleIndex });
        const same = (one, other) => {
            const parse = text => (text.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
            const a = parse(one);
            const b = parse(other);
            return a.length === 3 && b.length === 3 && a.every((value, index) => Math.abs(value - b[index]) < 1.5);
        };
        check(same(hovered.colour, rest.hoverColour), at, "under the pointer the word takes " + (rail ? "the \"+\" box colour" : "the card's tint"), hovered.colour + " vs " + rest.hoverColour);
        check(hovered.textShadow !== "none" && hovered.letterSpacing > rest.letterSpacing, at, "under the pointer the word is thickened and tracked", hovered.textShadow + " " + rest.letterSpacing + " -> " + hovered.letterSpacing);
        if (rail) check(Math.abs(hovered.arrow.scale - g.railArrowGrow) < 0.01, at, "under the pointer the arrow grows " + Math.round((g.railArrowGrow - 1) * 100) + "%", String(hovered.arrow.scale));
        else check(Math.abs(hovered.arrow.scale - 1) < 0.001, at, "the foot form's arrow does not grow");
        await page.mouse.move(0, 0);
        const reached = await focusByKeyboard(page, button);
        check(reached, at, "the keyboard reaches the button");
        if (reached) {
            await settle(page);
            const focused = await page.evaluate(readInPage, { sampleIndex });
            check(same(focused.colour, rest.hoverColour) && focused.textShadow !== "none", at, "under the focus the word has the hover look");
            if (rail) {
                check(Math.abs(focused.arrow.scale - g.railArrowGrow) < 0.01, at, "under the focus the arrow grows 20%", String(focused.arrow.scale));
            } else {
                check(focused.outlineStyle === "solid" && focused.outlineWidth === g.outlineWidth && focused.outlineOffset === g.outlineOffset && focused.outlineIsRing, at, "focus draws a " + g.outlineWidth + "px ring, " + g.outlineOffset + "px out, in the focus ring ink",
                    [focused.outlineStyle, focused.outlineWidth, focused.outlineOffset, focused.outlineIsRing].join(" "));
            }
        }
    }
}
