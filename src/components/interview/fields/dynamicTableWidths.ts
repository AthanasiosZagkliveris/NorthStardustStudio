/*
    THE TABLE'S WIDTHS (DynamicTable.tsx): the fixed widths of its columns and parts, and the measuring of a text's width in a font (one canvas,
    a cache). Moved out of DynamicTable.tsx as they were (2026-11-10, the owner: "optimise the app and the folders"): the same values and the
    same code; the table imports them.
*/
import type { TableColumn } from "./DynamicTable.tsx";

// Fallback/minimum width for the automatic row-number
// column when its label is the default "#" -- a Table
// declaring a longer label (e.g. "Phase") measures its
// actual text width instead (see rowNumberColumnWidth
// below), so the label is never clipped.
export const ROW_NUMBER_COLUMN_MIN_WIDTH = 48;

// A small inline "-" sits next to each entry in a repeatable
// column's own list of values (see renderRepeatableList) --
// this is its fixed footprint, added on top of that column's
// own width so the button never squeezes the select control
// itself.
export const REPEATABLE_BUTTON_WIDTH = 30;

// Width of the separate actions table (see the return
// statement) -- the Up/Down controls stack in one narrow
// column and the Remove/Add controls stack in a second,
// slightly wider one right next to it, so this only needs to
// fit two columns' worth of buttons side by side, not four
// buttons in a row.
export const ACTIONS_COLUMN_WIDTH = 92;

// The minimum height a body row needs to fit the stacked
// Up/Down + Remove/Add controls: the taller of the two
// stacks (Remove/Add: 28px button + 6px gap + 28px button =
// 62px) plus the cell's own 10px top/bottom padding. A row
// this short only happens with a single short line of text,
// but the controls still need the room regardless of how
// little text a row holds.
export const ACTIONS_MIN_ROW_HEIGHT = 82;

export const HEADER_CELL_PADDING = 26;
export const MIN_COLUMN_WIDTH = 90;

// The width a resizable column renders at until the user
// manually drags it -- deliberately NOT based on the
// browser's own auto table layout, which was free to hand
// an empty column all of a wide table's unused space (an
// empty cell could stretch to fill hundreds of extra
// pixels with nothing in it). A column keeps exactly this
// width, regardless of how many rows or how many other
// columns the table has, until it's dragged.
export const DEFAULT_COLUMN_WIDTH = 220;

// A Field (dropdown) or Date column holds a fixed
// control -- a select, or a text field + calendar
// button -- that doesn't benefit from being resized
// and looks broken if squeezed. These columns keep a
// constant width instead of participating in manual
// column resize at all.
export const TYPE_FIXED_WIDTH: Partial<Record<TableColumn["type"], number>> = {

    date: 190,

    field: 170,

    "dynamic-select": 190

};

export function isFixedWidthColumn(column: TableColumn): boolean {
    return column.type in TYPE_FIXED_WIDTH;
}

// Extra room added on top of a column's measured
// content so text doesn't sit flush against the
// cell's edges once resized down to its natural
// maximum.
export const CONTENT_WIDTH_PADDING = 48;

let measureCanvas: HTMLCanvasElement | null = null;

// Memoizes measureTextWidth by its exact (font, text) input. Every
// Table's contentMaxWidths recomputes over EVERY cell on EVERY
// keystroke anywhere in that Table (see the useMemo below) -- with
// this cache, only the cell whose text actually changed since the
// last measurement pays for a real canvas `measureText` call; every
// other cell's unchanged text is a plain Map lookup instead. Shared
// across every Table on the page (keyed by the exact text, so
// identical content in different Tables/columns reuses the same
// entry too) since they all measure against the same handful of
// fonts. Left unbounded: a session's worth of distinct strings typed
// into form fields is a tiny amount of memory to hold as `string ->
// number`, nowhere near worth adding eviction complexity for.
const textWidthCache = new Map<string, number>();

/**
 * Measures the pixel width of the longest line in
 * some text, using the same font as a table cell's
 * text input. Used to cap column resize at "wide
 * enough to show the longest line with no wrapping",
 * rather than leaving the column unbounded.
 */
export function measureTextWidth(text: string, font: string): number {

    const cacheKey = font + " " + text;
    const cached = textWidthCache.get(cacheKey);

    if (cached !== undefined) {
        return cached;
    }

    if (!measureCanvas) {
        measureCanvas = document.createElement("canvas");
    }

    const context = measureCanvas.getContext("2d");

    if (!context) {
        return 0;
    }

    context.font = font;

    let max = 0;

    for (const line of text.split("\n")) {

        const width = context.measureText(line).width;

        if (width > max) {
            max = width;
        }

    }

    textWidthCache.set(cacheKey, max);

    return max;

}

// Matches the font declared on .dynamic-table-textarea /
// .interview-input (font-size:var(--font-small), 14px,
// inherited font-family "Inter", normal weight) in conversation.css.
export const CELL_FONT = "400 14px Inter, sans-serif";

// Fallback used only if a header cell hasn't rendered yet
// when this is read -- .dynamic-table th declares
// font-weight:600 and inherits the body's default size.
export const HEADER_FONT_FALLBACK = "600 16px Inter, sans-serif";

/**
 * Reads the actual font a rendered element is using, so
 * text measurement matches reality instead of a guessed
 * font string.
 */
export function computedFont(el: Element | null | undefined, fallback: string): string {

    if (!el) {
        return fallback;
    }

    const style = window.getComputedStyle(el);

    return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

}

