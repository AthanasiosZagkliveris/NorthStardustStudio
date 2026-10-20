import { useLayoutEffect } from "react";

import { channelPresetNames, fittedColumns, journeyStageLabels, shareTheRest, widest } from "../../../framework/engine/ChannelTableColumns.ts";

/*
    FITS THE CUSTOMER CHANNEL TABLE'S JOURNEY STAGE AND CHANNEL COLUMNS
    to their dropdowns (ChannelTableColumns.ts).

    Measured from the table as it is drawn: the options' text widths in the
    font of the picker that shows them (a canvas, once per font and text),
    the picker's own padding and border, and what stands beside it in its
    row. The two widths are set as --col-stage / --col-channel on the table
    (conversation.css gives its heads those widths while the table has its
    four columns), so nothing is drawn from a guess: a different font, size
    or padding gives different widths, and the columns follow. Measured
    again when the fonts have loaded.
*/

const widths = new Map<string, number>();
let canvas: CanvasRenderingContext2D | null | undefined;

/** The measuring canvas, asked for once (none where there is no layout engine: a test). */
function measuring(): CanvasRenderingContext2D | null {
    if (canvas === undefined) {
        canvas = document.createElement("canvas").getContext("2d");
    }
    return canvas;
}

function textWidth(font: string, text: string): number {
    const key = font + "\u0000" + text;
    let width = widths.get(key);
    if (width === undefined) {
        const context = measuring();
        if (!context) {
            return 0;
        }
        context.font = font;
        width = context.measureText(text).width;
        widths.set(key, width);
    }
    return width;
}

function fontOf(element: Element): string {
    const style = getComputedStyle(element);
    return style.fontStyle + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
}

/** An element's padding and border at both sides. */
function chromeOf(element: Element): number {
    const style = getComputedStyle(element);
    return ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]
        .reduce((sum, side) => sum + (parseFloat(style[side as "paddingLeft"]) || 0), 0);
}

/** Everything in a grid row but its "control" track, with the gaps between the tracks. */
function besideControl(row: Element): number {
    const style = getComputedStyle(row);
    const tracks = style.gridTemplateColumns.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).map(parseFloat);
    const gap = parseFloat(style.columnGap) || 0;
    return tracks.reduce((sum, track, at) => sum + (at === 1 || !Number.isFinite(track) ? 0 : track), 0) + gap * Math.max(0, tracks.length - 1);
}

/**
 * The Journey Stage column's measures, from a HIDDEN COPY of one stage row in
 * the table (position:absolute, never seen, removed at once): its picker
 * (font, padding, border), the x beside it and the "+ Add Journey Stage"
 * button on one line. A copy, because the real row is not always there -- a
 * table with every category folded has no stage row at all, an isolated one no
 * add button -- and the columns must be the same whichever rows are drawn.
 */
function stageMeasures(table: HTMLElement) {

    const holder = document.createElement("div");
    holder.className = "business-channel-cell";
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:max-content;left:0;top:0;";
    holder.innerHTML =
        '<div class="business-channel-pick business-channel-pick-stage">' +
        '<div class="option-picker" data-size="hug"><button type="button" tabindex="-1" class="interview-input option-picker-trigger"><span class="option-picker-value">Select a stage</span></button></div>' +
        '<div class="business-channel-steps"><button type="button" tabindex="-1" class="strategy-box-remove">×</button></div>' +
        '</div>' +
        '<div class="business-step-add-row" style="width:max-content"><button type="button" tabindex="-1" class="strategy-add-button" style="flex:none;white-space:nowrap">+ Add Journey Stage</button></div>';
    table.appendChild(holder);

    try {
        const trigger = holder.querySelector<HTMLElement>(".option-picker-trigger")!;
        const steps = holder.querySelector<HTMLElement>(".business-channel-steps")!;
        const button = holder.querySelector<HTMLElement>(".strategy-add-button")!;
        const stepsStyle = getComputedStyle(steps);
        return {
            font: fontOf(trigger),
            chrome: chromeOf(trigger),
            beside: (steps.getBoundingClientRect().width || 32) + (parseFloat(stepsStyle.marginLeft) || 0),
            button: button.getBoundingClientRect().width
        };
    } finally {
        holder.remove();
    }

}

function fit(table: HTMLElement) {

    const cell = table.querySelector(".business-channel-cell");
    const padding = cell ? parseFloat(getComputedStyle(cell).paddingLeft) || 12 : 12;

    const name = table.querySelector(".business-channel-name, .business-channel-category");
    const field = name?.querySelector("textarea");

    if (!field || !name || !measuring()) {
        return;
    }

    const stage = stageMeasures(table);

    const columns = fittedColumns({
        cellPadding: padding,
        stageText: widest(journeyStageLabels().map(label => textWidth(stage.font, label))),
        stageChrome: stage.chrome,
        stageBeside: stage.beside,
        stageButton: stage.button,
        nameText: widest(channelPresetNames().map(label => textWidth(fontOf(field), label))),
        nameChrome: chromeOf(field),
        // The widest of the rows (a channel with no options has no "i" beside its name).
        nameBeside: Math.max(...[...table.querySelectorAll(".business-channel-name, .business-channel-category")].map(besideControl))
    });

    // Offerings and Action share what is left of the table (less its 1px left edge).
    const rest = shareTheRest(table.getBoundingClientRect().width - 1, columns);

    table.style.setProperty("--col-stage", columns.stage + "px");
    table.style.setProperty("--col-channel", columns.channel + "px");
    table.style.setProperty("--col-offerings", rest.offerings + "px");
    table.style.setProperty("--col-action", rest.action + "px");

}

/** Fits every Customer Channel table on the page after each render, and again once the fonts are in. */
export function useChannelColumns(): void {

    useLayoutEffect(() => {

        const tables = [...document.querySelectorAll<HTMLElement>(".business-channel-table:not(.business-relationship-table)")];
        const run = () => tables.forEach(fit);

        run();

        let live = true;
        document.fonts?.ready.then(() => {
            if (live) {
                run();
            }
        });

        // The rest is shared again as the window (and so the table) changes width.
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(run);
        tables.forEach(table => observer?.observe(table));

        return () => {
            live = false;
            observer?.disconnect();
        };

    });

}
