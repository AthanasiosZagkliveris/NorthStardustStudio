import { BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_JOURNEY_STAGES } from "./AnswerUtils.ts";

/*
    THE CUSTOMER CHANNEL TABLE'S TWO FITTED COLUMNS.

    Journey Stage and Channel are columns of dropdowns, and a dropdown is
    only ever as wide as its longest option: "Support & Follow Up" for a
    stage, "Booking / Registration Page" for a channel. So the column is
    exactly that wide -- the picker, what stands beside it (the x, the "i",
    the nesting mark) and 12px of cell padding each side -- and the two
    columns that hold sentences, Offerings and Action, share what is left.

    Two things also keep a word whole: the Journey Stage column is never
    narrower than its "+ Add Journey Stage" button on ONE line, and the
    Channel column holds the widest Channel Category ("Physical Delivery")
    and channel name, in the category row's own picker -- whether or not any
    category is open (a folded table has no stage rows to measure, so the
    measures come from a hidden copy of one; useChannelColumns.ts).

    The widths are MEASURED (the editor measures the options in the font
    the table is drawn in, once per font) and given here as sums, so the
    arithmetic is testable on its own. The measured numbers come in; the
    pixel widths go out.
*/

/** Every journey stage's label, in the journey's order. */
export function journeyStageLabels(): string[] {
    return BUSINESS_JOURNEY_STAGES.map(stage => stage.label);
}

/**
 * Every Channel Category and every channel name the pickers can offer
 * (the presets, and "Other"), each once.
 */
export function channelPresetNames(): string[] {
    return [...new Set([
        ...BUSINESS_CHANNEL_CATEGORIES.map(category => category.label),
        ...BUSINESS_CHANNEL_CATEGORIES.flatMap(category => category.channels.map(channel => channel.label)),
        BUSINESS_CHANNEL_OTHER
    ])];
}

/** The widest of some measured widths (0 for none). */
export function widest(widths: readonly number[]): number {
    return widths.reduce((most, width) => Math.max(most, width), 0);
}

/** How Offerings and Action divide the rest of the table: Action, the column of sentences, the larger part. */
export const OFFERINGS_SHARE = 0.45;
export const ACTION_SHARE = 1 - OFFERINGS_SHARE;

/**
 * What is left of the table's width after the two fitted columns, shared
 * between Offerings and Action (whole pixels, Action the larger part). 0
 * each when the fitted columns leave nothing.
 */
export function shareTheRest(tableWidth: number, fitted: ColumnWidths): { offerings: number; action: number } {
    const rest = Math.max(0, Math.floor(tableWidth - fitted.stage - fitted.channel));
    const offerings = Math.floor(rest * OFFERINGS_SHARE);
    return { offerings, action: rest - offerings };
}

export interface ColumnMeasures {
    /** A cell's padding at each side (12px, --space-field). */
    cellPadding: number;
    /** The widest option of the Journey Stage picker (text only), and the picker's own padding, chevron and border. */
    stageText: number;
    stageChrome: number;
    /** What stands beside the stage picker in its row: the gap and the x. */
    stageBeside: number;
    /** The "+ Add Journey Stage" button on one line, border to border (0 when not measured). */
    stageButton?: number;
    /** The widest category or channel name (text only), and its box's padding (the list's chevron side included) and border. */
    nameText: number;
    nameChrome: number;
    /** What stands around the name's box in its row: the nesting mark, the "i", the x, and the gaps between. */
    nameBeside: number;
}

export interface ColumnWidths {
    stage: number;
    channel: number;
}

/**
 * The two fitted columns' widths in px: each is its picker (the widest
 * option and the picker's chrome, rounded up, with 2px of slack for the
 * difference between a canvas's measure and a layout's), what stands
 * beside it, and the cell padding at both sides -- the Journey Stage one
 * at least its add button's width (with the same slack) and the padding.
 */
export function fittedColumns(measures: ColumnMeasures): ColumnWidths {
    const slack = 2;
    const padding = 2 * measures.cellPadding;
    return {
        stage: Math.max(
            Math.ceil(measures.stageText + measures.stageChrome + slack) + measures.stageBeside,
            Math.ceil((measures.stageButton ?? 0) + slack)
        ) + padding,
        channel: Math.ceil(measures.nameText + measures.nameChrome + slack) + measures.nameBeside + padding
    };
}
