import { focusByKeyboard, firstHue, settle } from "../helpers.mjs";

/**
 * Dropdown (src/library/assets/dropdown.ts), the OptionPicker. At rest, in each
 * variant (the three standard widths, hugging, disabled), hue and ground: the
 * 45px trigger, its width (220, 300 or 420px, or the width its widest option
 * needs when hugging), the 18px type, the drawn chevron, the name and the
 * collapsed state, and the contrast of the value. With the real pointer and
 * keyboard: the edge reaction under the pointer and the focus; opening by a
 * click: the list as wide as the trigger, 6px under it, 4px padding, 8px
 * corners, options 43px high, the chosen one bold and aria-selected, the active
 * row, the arrow keys, Escape closing it with the focus back on the trigger, and
 * choosing an option changing the value.
 */
export const name = "Dropdown";

const WIDTHS = { "step-s": "stepS", "step-m": "stepM", "step-l": "stepL", disabled: "stepS" };

function measureInPage() {
    const { rgb, ratio, same, transparent, colour } = window.__lib;
    const px = value => parseFloat(value);
    return [...document.querySelectorAll("[data-asset='Dropdown'] [data-sample]")].map(sample => {
        const picker = sample.querySelector(".option-picker");
        const trigger = picker.querySelector("button.option-picker-trigger");
        const style = getComputedStyle(trigger);
        const rect = trigger.getBoundingClientRect();
        const pickerRect = picker.getBoundingClientRect();
        const length = expression => {
            const probe = document.createElement("span");
            probe.style.cssText = "position:absolute;visibility:hidden;width:" + expression;
            trigger.appendChild(probe);
            const width = probe.getBoundingClientRect().width;
            probe.remove();
            return width;
        };
        // The width a hugging picker needs: its widest option and the trigger's padding and border (as OptionPicker's controlNeed).
        let widest = 0;
        trigger.querySelectorAll(".option-picker-sizer, .option-picker-value:not([data-empty])").forEach(span => {
            const range = document.createRange();
            range.selectNodeContents(span);
            widest = Math.max(widest, range.getBoundingClientRect().width);
        });
        const need = widest + px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth);
        const value = trigger.querySelector(".option-picker-value").textContent;
        const surface = getComputedStyle(sample).backgroundColor;
        const ground = transparent(style.backgroundColor) ? surface : style.backgroundColor;
        return {
            id: [sample.dataset.variant, "hue " + sample.dataset.hue, sample.dataset.ground].join(" / "),
            variant: sample.dataset.variant,
            ground: sample.dataset.ground,
            size: picker.dataset.size,
            width: rect.width,
            height: rect.height,
            pickerWidth: pickerRect.width,
            need,
            fontSize: px(style.fontSize),
            border: px(style.borderTopWidth),
            paddingLeft: px(style.paddingLeft),
            paddingRight: px(style.paddingRight),
            expectedPaddingLeft: length("var(--select-padding-left)"),
            expectedPaddingRight: length("var(--select-padding-right)"),
            chevron: { size: style.backgroundSize, image: style.backgroundImage.startsWith("url("), repeat: style.backgroundRepeat },
            letterSpacing: style.letterSpacing,
            label: trigger.getAttribute("aria-label"),
            value,
            haspopup: trigger.getAttribute("aria-haspopup"),
            expanded: trigger.getAttribute("aria-expanded"),
            disabled: trigger.disabled,
            colourIsInk: same(style.color, colour("var(--text-default)", trigger)),
            colourIsFaint: same(style.color, colour("var(--text-faint)", trigger)),
            borderIsCardLine: same(style.borderTopColor, colour("var(--line-card)", trigger)),
            cursor: style.cursor,
            contrast: ratio(rgb(style.color), rgb(ground))
        };
    });
}

/** Runs in the page: the open list of one sample. */
function readListInPage({ sampleIndex }) {
    const { rgb, ratio, same, transparent, colour } = window.__lib;
    const px = value => parseFloat(value);
    const sample = document.querySelectorAll("[data-asset='Dropdown'] [data-sample]")[sampleIndex];
    const trigger = sample.querySelector("button.option-picker-trigger");
    const list = sample.querySelector(".option-picker-list");
    if (!list) return null;
    const tr = trigger.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    const style = getComputedStyle(list);
    const options = [...list.querySelectorAll(".option-picker-option")];
    const surface = style.backgroundColor;
    return {
        role: list.getAttribute("role"),
        width: lr.width,
        triggerWidth: tr.width,
        leftOffset: lr.left - tr.left,
        // The list opens downwards where there is room (the gap is then its top less the trigger's bottom), else upwards.
        gap: lr.top > tr.top ? lr.top - tr.bottom : tr.top - lr.bottom,
        below: lr.top > tr.top,
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        radius: style.borderTopLeftRadius,
        surfaceIsSurface: same(surface, colour("var(--bg-surface)", list)),
        count: options.length,
        heights: options.map(option => option.getBoundingClientRect().height),
        optionPadding: options.length ? [getComputedStyle(options[0]).paddingTop, getComputedStyle(options[0]).paddingLeft] : [],
        selectedCount: options.filter(option => option.getAttribute("aria-selected") === "true").length,
        chosenWeights: options.filter(option => option.getAttribute("aria-selected") === "true").map(option => getComputedStyle(option).fontWeight),
        otherWeights: options.filter(option => option.getAttribute("aria-selected") !== "true").map(option => getComputedStyle(option).fontWeight),
        activeIndex: options.findIndex(option => option.classList.contains("option-picker-option-active")),
        activeBackgroundSet: options.some(option => option.classList.contains("option-picker-option-active") && !transparent(getComputedStyle(option).backgroundColor)),
        contrasts: options.map(option => ratio(rgb(getComputedStyle(option).color), rgb(surface))),
        expandedAttribute: trigger.getAttribute("aria-expanded"),
        texts: options.map(option => option.textContent)
    };
}

export async function run(page, contract, where, check) {
    const g = contract.geometry;
    await settle(page);
    const measured = await page.evaluate(measureInPage);
    check(measured.length > 0, where, "the gallery draws samples");
    for (const m of measured) {
        const at = where + " / " + m.id;
        check(Math.abs(m.height - g.height) <= g.tolerancePx, at, "the trigger is " + g.height + "px high", String(m.height));
        if (m.variant === "hug") {
            check(m.size === "hug" && Math.abs(m.pickerWidth - Math.min(m.need, m.pickerWidth)) <= g.hugTolerancePx && Math.abs(m.width - Math.ceil(m.need)) <= g.hugTolerancePx, at, "a hugging trigger is as wide as its widest option needs", "width " + m.width.toFixed(1) + ", need " + m.need.toFixed(1));
        } else {
            const key = WIDTHS[m.variant];
            const step = key === "stepS" ? "s" : key === "stepM" ? "m" : "l";
            check(m.size === step && Math.abs(m.width - g[key]) <= g.tolerancePx, at, "the width step is " + step + " (" + g[key] + "px)", "step " + m.size + ", width " + m.width.toFixed(1));
        }
        check(Math.abs(m.fontSize - g.fontSize) <= 0.01 && m.letterSpacing === "normal", at, "the value is " + g.fontSize + "px with normal tracking", m.fontSize + " " + m.letterSpacing);
        check(Math.abs(m.paddingLeft - m.expectedPaddingLeft) <= 0.5 && Math.abs(m.paddingRight - m.expectedPaddingRight) <= 0.5, at, "the padding is the select padding tokens'", m.paddingLeft + "/" + m.paddingRight + " vs " + m.expectedPaddingLeft + "/" + m.expectedPaddingRight);
        // A disabled trigger is drawn without the chevron (its rule resets the background); an enabled one has the drawn chevron.
        if (m.variant === "disabled") check(!m.chevron.image, at, "a disabled trigger has no chevron", JSON.stringify(m.chevron));
        else check(m.chevron.size === g.chevronWidth + "px " + g.chevronHeight + "px" && m.chevron.image && m.chevron.repeat === "no-repeat", at, "a drawn chevron of " + g.chevronWidth + " x " + g.chevronHeight, JSON.stringify(m.chevron));
        check(m.label === "Choice (" + m.variant + "): " + m.value && m.haspopup === "listbox" && m.expanded === "false", at, "named with its value, aria-haspopup listbox, collapsed", m.label + " " + m.haspopup + " " + m.expanded);
        if (m.variant === "disabled") {
            check(m.disabled && m.colourIsFaint && m.borderIsCardLine && m.cursor === "not-allowed", at, "disabled: faint text, the card-line edge, not-allowed cursor");
        } else {
            check(!m.disabled && m.colourIsInk, at, "enabled: the value in the text colour");
            const need = contract.accessibility.contrast.find(item => item.ground === m.ground).min;
            check(m.contrast >= need, at, "the value on its ground holds " + need + ":1", m.contrast.toFixed(2) + ":1");
        }
    }

    /* The reactions and the open list, with the real pointer and keyboard: the first hue only. */
    const samples = page.locator("[data-asset='Dropdown'] [data-sample]");
    const total = await samples.count();
    const hue = await firstHue(page);
    for (let index = 0; index < total; index++) {
        const info = await samples.nth(index).evaluate(element => ({ variant: element.dataset.variant, hue: element.dataset.hue, ground: element.dataset.ground }));
        if (info.hue !== hue) continue;
        const at = where + " / " + info.variant + " / " + info.ground;
        const sample = samples.nth(index);
        const trigger = sample.locator("button.option-picker-trigger");
        const edge = () => trigger.evaluate(element => { const s = getComputedStyle(element); return s.borderTopColor + "|" + s.boxShadow; });
        await sample.evaluate(element => element.scrollIntoView({ block: "center" }));
        await page.mouse.move(0, 0);
        await settle(page);
        const rest = await edge();
        if (info.variant === "disabled") {
            await trigger.hover({ force: true });
            await settle(page);
            check((await edge()) === rest, at, "a disabled dropdown does not react to the pointer");
            continue;
        }
        await trigger.hover();
        await settle(page);
        check((await edge()) !== rest, at, "under the pointer the edge reacts", rest);
        await page.mouse.move(0, 0);
        const reached = await focusByKeyboard(page, trigger);
        check(reached, at, "the keyboard reaches the trigger");
        if (reached) {
            await settle(page);
            check((await edge()) !== rest, at, "under the keyboard focus the edge shows a ring");
        }

        /* Open it with a click and read the list. */
        await trigger.click();
        await settle(page);
        const open = await page.evaluate(readListInPage, { sampleIndex: index });
        check(open !== null, at, "a click opens the list");
        if (open) {
            check(open.role === "listbox" && open.expandedAttribute === "true", at, "the list is a listbox and the trigger says expanded");
            check(Math.abs(open.width - open.triggerWidth) <= 1 && Math.abs(open.leftOffset) <= 1, at, "the list is exactly as wide as the trigger, on its left edge", "width " + open.width.toFixed(1) + " vs " + open.triggerWidth.toFixed(1) + ", left " + open.leftOffset.toFixed(1));
            check(Math.abs(open.gap - g.listGap) <= 1, at, "the list stands " + g.listGap + "px from the trigger (below it where there is room, else above it)", "gap " + open.gap.toFixed(1) + (open.below ? ", below" : ", above"));
            check(open.padding.every(p => p === g.listPadding + "px") && open.radius === g.listRadius + "px" && open.surfaceIsSurface, at, "the list has " + g.listPadding + "px padding, " + g.listRadius + "px corners and the surface ground", open.padding.join(" ") + " " + open.radius);
            check(open.heights.length > 0 && open.heights.every(h => Math.abs(h - g.optionHeight) <= g.tolerancePx), at, "every option is " + g.optionHeight + "px high", open.heights.join(" "));
            check(open.optionPadding[0] === g.optionPaddingY + "px" && open.optionPadding[1] === g.optionPaddingX + "px", at, "an option has " + g.optionPaddingY + "px by " + g.optionPaddingX + "px of padding", open.optionPadding.join(" "));
            check(open.selectedCount === 1 && open.chosenWeights.every(w => Number(w) === g.chosenWeight) && open.otherWeights.every(w => Number(w) < g.chosenWeight), at, "exactly one option is chosen (aria-selected) and it is bold", open.chosenWeights.join(" ") + " | " + open.otherWeights.join(" "));
            const need = contract.accessibility.contrast.find(item => item.ground === "list").min;
            check(open.contrasts.every(c => c >= need), at, "every option holds " + need + ":1 on the list's surface", open.contrasts.map(c => c.toFixed(2)).join(" "));
            await page.keyboard.press("ArrowDown");
            await settle(page);
            const moved = await page.evaluate(readListInPage, { sampleIndex: index });
            check(moved && moved.activeIndex >= 0 && moved.activeBackgroundSet, at, "an arrow key moves the active row, which has its own ground", String(moved && moved.activeIndex));
            await page.keyboard.press("Escape");
            await settle(page);
            const closed = await page.evaluate(readListInPage, { sampleIndex: index });
            const focusOnTrigger = await trigger.evaluate(element => element === document.activeElement);
            check(closed === null && focusOnTrigger, at, "Escape closes the list and the focus is back on the trigger", "closed " + (closed === null) + ", focused " + focusOnTrigger);

            /* Choose the second option with a click. */
            await trigger.click();
            await settle(page);
            const reopened = await page.evaluate(readListInPage, { sampleIndex: index });
            const target = reopened.texts[1];
            await sample.locator(".option-picker-option").nth(1).click();
            await settle(page);
            const value = await trigger.evaluate(element => element.querySelector(".option-picker-value").textContent);
            const gone = await page.evaluate(readListInPage, { sampleIndex: index });
            check(value === target && gone === null, at, "choosing an option sets the value and closes the list", value + " vs " + target);
            // Put the first option back, so a later run on the same page is not affected (the page is reloaded per run).
        }
    }
}
