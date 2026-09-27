import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import FieldRenderer from "./FieldRenderer";
import DateCellInput from "./DateCellInput.tsx";
import NotesField from "./NotesField.tsx";

import { FieldDefinition } from "../../framework/model/FieldDefinition.ts";
import { useDragToScroll } from "../../hooks/useDragToScroll.ts";
import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";

export interface TableColumn {

    /**
     * Unique column identifier.
     */
    id: string;

    /**
     * Column heading.
     */
    title: string;

    /**
     * Rendering type.
     */
    type:
        | "text"
        | "notes"
        | "number"
        | "field"
        | "date"
        | "dynamic-select"
        | "autofill";

    /**
     * Optional Framework Field.
     */
    field?: FieldDefinition;

    /**
     * Live dropdown options for a
     * "dynamic-select" column, resolved
     * from another Section's Card List
     * response.
     */
    options?: string[];

    /**
     * Optional width.
     */
    width?: string;

    /**
     * Marks this column as repeatable: each
     * row's cell for this column holds a
     * LIST of values rather than a single
     * value, rendered as a vertical list of
     * entries with its own per-entry remove
     * control and one "add another" control
     * for the row.
     */
    repeatable?: boolean;

    /**
     * Marks this column's value as a list of
     * values kept in lock-step with the
     * nearest preceding `repeatable` column
     * on the same row -- one entry per entry
     * of that column, added/removed
     * automatically alongside it, with no
     * add/remove controls of its own.
     */
    repeatableValue?: boolean;

    /**
     * Marks this numeric column as one whose
     * values should sum to 100 across the
     * whole table -- the table renders a
     * totals row summing every row's value
     * and flags whether it reaches 100.
     */
    sumCheck?: boolean;

    /**
     * Marks this `repeatable`/`repeatableValue`
     * numeric column as one whose own list of
     * values, within a single row, should sum
     * to 100 -- e.g. one Revenue Stream's
     * Method Mix % entries should add up to
     * 100, independently of every other
     * Stream. A small check appears once per
     * row.
     */
    groupSumCheck?: boolean;

}

export type TableRow =
    Record<string, unknown>;

interface DynamicTableProps {

    columns: TableColumn[];

    value: TableRow[];

    onChange: (rows: TableRow[]) => void;

    disabled?: boolean;

    /**
     * Overrides the header label shown
     * above the automatic row-number
     * column. Defaults to "#".
     */
    rowNumberLabel?: string;

    /**
     * Turns each row into a single-select picker: a small bullet
     * appears under the row-number column, and clicking anywhere
     * on the row (not just the bullet) selects it. Used by the
     * Product Development System's Product Register (item 7) so
     * picking which Product to work on happens directly in the
     * table instead of a separate list underneath it. Omitted for
     * every other Table in the app, which renders exactly as
     * before.
     */
    rowSelection?: {
        isSelected: (row: TableRow, index: number) => boolean;
        onSelect: (row: TableRow, index: number) => void;
    };

}

// Fallback/minimum width for the automatic row-number
// column when its label is the default "#" -- a Table
// declaring a longer label (e.g. "Phase") measures its
// actual text width instead (see rowNumberColumnWidth
// below), so the label is never clipped.
const ROW_NUMBER_COLUMN_MIN_WIDTH = 48;

// A small inline "-" sits next to each entry in a repeatable
// column's own list of values (see renderRepeatableList) --
// this is its fixed footprint, added on top of that column's
// own width so the button never squeezes the select control
// itself.
const REPEATABLE_BUTTON_WIDTH = 30;

// Width of the separate actions table (see the return
// statement) -- the Up/Down controls stack in one narrow
// column and the Remove/Add controls stack in a second,
// slightly wider one right next to it, so this only needs to
// fit two columns' worth of buttons side by side, not four
// buttons in a row.
const ACTIONS_COLUMN_WIDTH = 92;

// The minimum height a body row needs to fit the stacked
// Up/Down + Remove/Add controls: the taller of the two
// stacks (Remove/Add: 28px button + 6px gap + 28px button =
// 62px) plus the cell's own 10px top/bottom padding. A row
// this short only happens with a single short line of text,
// but the controls still need the room regardless of how
// little text a row holds.
const ACTIONS_MIN_ROW_HEIGHT = 82;

const HEADER_CELL_PADDING = 26;
const MIN_COLUMN_WIDTH = 90;

// The width a resizable column renders at until the user
// manually drags it -- deliberately NOT based on the
// browser's own auto table layout, which was free to hand
// an empty column all of a wide table's unused space (an
// empty cell could stretch to fill hundreds of extra
// pixels with nothing in it). A column keeps exactly this
// width, regardless of how many rows or how many other
// columns the table has, until it's dragged.
const DEFAULT_COLUMN_WIDTH = 220;

// A Field (dropdown) or Date column holds a fixed
// control -- a select, or a text field + calendar
// button -- that doesn't benefit from being resized
// and looks broken if squeezed. These columns keep a
// constant width instead of participating in manual
// column resize at all.
const TYPE_FIXED_WIDTH: Partial<Record<TableColumn["type"], number>> = {

    date: 190,

    field: 170,

    "dynamic-select": 190

};

function isFixedWidthColumn(column: TableColumn): boolean {
    return column.type in TYPE_FIXED_WIDTH;
}

// Extra room added on top of a column's measured
// content so text doesn't sit flush against the
// cell's edges once resized down to its natural
// maximum.
const CONTENT_WIDTH_PADDING = 48;

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
function measureTextWidth(text: string, font: string): number {

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
const CELL_FONT = "400 14px Inter, sans-serif";

// Fallback used only if a header cell hasn't rendered yet
// when this is read -- .dynamic-table th declares
// font-weight:600 and inherits the body's default size.
const HEADER_FONT_FALLBACK = "600 16px Inter, sans-serif";

/**
 * Reads the actual font a rendered element is using, so
 * text measurement matches reality instead of a guessed
 * font string.
 */
function computedFont(el: Element | null | undefined, fallback: string): string {

    if (!el) {
        return fallback;
    }

    const style = window.getComputedStyle(el);

    return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

}

/**
 * A <textarea> that grows tall enough to show its
 * entire value with no internal scrolling -- the
 * surrounding table row simply becomes taller, since
 * a table row's height already follows its tallest
 * cell.
 */
function AutoGrowTextarea({

    ariaLabel,

    value,

    disabled,

    onChange

}: {

    value: string;

    disabled?: boolean;

    onChange: (value: string) => void;

    ariaLabel?: string;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

    // "* "/"- " -> bullet, "1. " -> numbered list, Enter continues
    // or exits the current list line -- see useListAutoFormat.ts.
    const listAutoFormat = useListAutoFormat(value, onChange);

    // A stable merged-ref callback (not a fresh arrow function every
    // render) -- both `ref` and `listAutoFormat.textareaRef` are
    // themselves stable (useRef's own object identity never
    // changes), so this only needs to be created once. Without this,
    // React would call the old ref callback with `null` and the new
    // one with the element on every single keystroke (a fresh
    // function reference each render reads as "a different ref" to
    // React), which is harmless here but pure churn.
    const setRefs = useCallback((el: HTMLTextAreaElement | null) => {
        ref.current = el;
        listAutoFormat.textareaRef.current = el;
    }, [listAutoFormat.textareaRef]);

    function resize(el: HTMLTextAreaElement | null) {

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height = `${el.scrollHeight}px`;

    }

    useLayoutEffect(() => {

        resize(ref.current);

    }, [value]);

    return (

        <textarea

            ref={setRefs}

            className="dynamic-table-textarea"

            aria-label={ariaLabel}

            rows={1}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                listAutoFormat.onChange(event);

                resize(event.target);

            }}

            onKeyDown={listAutoFormat.onKeyDown}

        />

    );

}

function DynamicTable({

    columns,

    value,

    onChange,

    disabled = false,

    rowNumberLabel = "#",

    rowSelection

}: DynamicTableProps) {

    const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

    // Lets the user press anywhere on the scrollable data table's
    // own background (cell padding, the row-number column, header
    // background, ...) and drag left/right to scroll it, the same
    // as dragging a scrollbar thumb -- see useDragToScroll for the
    // full behavior (a click still works normally, and dragging
    // never hijacks an actual input/select/button/resize-handle).
    const scrollRef = useDragToScroll<HTMLDivElement>();

    // The Up/Down/Add/Remove controls render in a second,
    // completely separate <table> outside the scrollable/
    // resizable data table (see the return statement below)
    // -- not as a sticky last column of it -- so that
    // resizing or scrolling the data columns can never move
    // or reflow them. Since the two tables lay out their row
    // heights independently, each data row's actual rendered
    // height is measured here and applied to its counterpart
    // row in the actions table, keeping every row's controls
    // level with that row no matter how tall it grows (e.g.
    // wrapped text in an AutoGrowTextarea).
    const dataRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
    const [rowHeights, setRowHeights] = useState<Record<string, number>>({});

    const [minWidths, setMinWidths] = useState<Record<string, number>>({});
    const [colWidths, setColWidths] = useState<Record<string, number>>({});

    const dragState = useRef<{

        columnId: string;

        startX: number;

        startWidth: number;

    } | null>(null);

    // A table always shows at least one row -- an empty
    // table with nothing but an "Add" button reads as
    // broken, not as "nothing entered yet". This also
    // repairs any legacy saved response that somehow has
    // zero rows.
    useEffect(() => {

        if (value.length === 0) {

            onChange([createRow()]);

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value.length]);

    // The automatic row-number column's rendered width: wide
    // enough to fit its own label text (normally just "#",
    // but a Table may relabel it, e.g. "Phase"), never
    // narrower than the historical default. Measured the same
    // way header titles are (see the minWidths layout effect
    // below), just computed eagerly here since this column
    // isn't part of `columns` and has no header ref of its own.
    const rowNumberColumnWidth = useMemo(() => {

        const textWidth = measureTextWidth(rowNumberLabel, HEADER_FONT_FALLBACK);

        let width = Math.max(ROW_NUMBER_COLUMN_MIN_WIDTH, Math.ceil(textWidth) + HEADER_CELL_PADDING);

        // When this table renders a totals row (see sumCheckColumns
        // below), its first cell holds the word "Total" -- uppercase
        // and letter-spaced (see .dynamic-table-totals-label) --
        // which is usually wider than this column's own "#" label.
        // Sized only for "#", that cell would wrap onto two cramped
        // lines ("TOT" / "AL") instead of fitting on one, so widen
        // the whole column to fit it whenever a totals row exists.
        if (columns.some(column => column.sumCheck)) {

            // Measuring the visible "TOTAL" text (not "Total")
            // accounts for the label's CSS text-transform; the
            // small addition covers the letter-spacing canvas
            // measurement doesn't apply on its own.
            const totalsLabelWidth = measureTextWidth('TOTAL', HEADER_FONT_FALLBACK) + 8;

            width = Math.max(width, Math.ceil(totalsLabelWidth) + HEADER_CELL_PADDING);

        }

        return width;

    }, [rowNumberLabel, columns]);

    // Every `repeatableValue` column is kept in lock-step with the
    // nearest PRECEDING `repeatable` column on the same row (e.g.
    // Method Mix % pairs with Revenue Method) -- this maps each
    // `repeatable` driver column's id to the list of
    // `repeatableValue` columns that ride along with it, so removing
    // an entry from the driver (see `removeMethodEntry` below) can
    // splice the matching entry out of every paired column's own
    // list in the same go.
    const pairedValueColumnsByDriver = useMemo(() => {

        const result: Record<string, TableColumn[]> = {};

        let currentDriverId: string | null = null;

        columns.forEach(column => {

            if (column.repeatable) {

                currentDriverId = column.id;
                result[currentDriverId] = [];

            } else if (column.repeatableValue && currentDriverId) {

                result[currentDriverId].push(column);

            }

        });

        return result;

    }, [columns]);

    // The reverse of the map above: a `repeatableValue` column's own
    // id to its paired `repeatable` driver column's id -- used by
    // `getRowList` (below) so a `repeatableValue` column's list is
    // always READ at exactly its driver's own current length,
    // regardless of what its own raw stored value happens to be.
    // This is what keeps Method Mix's own list of entries visually
    // in step with Revenue Method's, even for a row whose data
    // predates this pairing (a legacy/stale saved response, or one
    // edited mid-session while the app was reloading) -- rather than
    // relying solely on `addMethodEntry`/`removeMethodEntry` to keep
    // the two arrays physically the same length at all times, which
    // silently stops working the moment anything else touches the
    // row's data out of step with them.
    const driverIdForValueColumn = useMemo(() => {

        const result: Record<string, string> = {};

        Object.entries(pairedValueColumnsByDriver).forEach(([driverId, pairedColumns]) => {

            pairedColumns.forEach(pairedColumn => {
                result[pairedColumn.id] = driverId;
            });

        });

        return result;

    }, [pairedValueColumnsByDriver]);

    // Every column marked `sumCheck` gets a totals row beneath
    // the data, summing every row's value and flagging whether
    // that sum reaches 100.
    const sumCheckColumns = useMemo(
        () => columns.filter(column => column.sumCheck),
        [columns]
    );

    function columnTotal(column: TableColumn): number {

        let total = 0;

        value.forEach(row => {

            const raw = row[column.id];
            const parsed = parseFloat(String(raw ?? "").replace(/[^0-9.-]/g, ""));

            if (!Number.isNaN(parsed)) {
                total += parsed;
            }

        });

        return Math.round(total * 100) / 100;

    }

    // For a `groupSumCheck` column (e.g. Method Mix %), sums just
    // this ONE row's own list of values -- every Revenue Stream is
    // now a single row, so its Methods' Mix % needs to add up to
    // 100 entirely on its own, independent of every other Stream's
    // row.
    function rowListTotal(column: TableColumn, row: TableRow): number {

        const list = getRowList(row, column.id);

        let total = 0;

        list.forEach(entry => {

            const parsed = parseFloat(String(entry ?? "").replace(/[^0-9.-]/g, ""));

            if (!Number.isNaN(parsed)) {
                total += parsed;
            }

        });

        return Math.round(total * 100) / 100;

    }

    function columnMinWidth(column: TableColumn): number {

        const titleMin = minWidths[column.id] ?? MIN_COLUMN_WIDTH;

        return Math.max(MIN_COLUMN_WIDTH, titleMin);

    }

    // The widest single line currently held by each
    // resizable (text/number) column, so a column can
    // never be dragged wider than its own content actually
    // needs. A column with nothing typed into it yet has no
    // entry here at all -- with nothing to size against, its
    // cap falls back to the column's own default width (see
    // columnMaxWidth), not an unlimited one: an empty cell
    // should never be draggable past its default length just
    // because there happens to be room in the table for it.
    const contentMaxWidths = useMemo(() => {

        const result: Record<string, number> = {};

        columns.forEach(column => {

            if (isFixedWidthColumn(column)) {
                return;
            }

            let max = 0;
            let hasContent = false;

            value.forEach(row => {

                // A `repeatable`/`repeatableValue` column holds a
                // LIST of values on each row (see getRowList) --
                // measure every one of that row's own entries
                // individually, rather than the array itself, so
                // resize caps reflect the longest single entry
                // actually typed, not "[object Object]"-style noise.
                const texts = column.repeatable || column.repeatableValue
                    ? getRowList(row, column.id)
                    : [String(row[column.id] ?? "")];

                texts.forEach(text => {

                    if (text.trim().length === 0) {
                        return;
                    }

                    hasContent = true;

                    const width = measureTextWidth(text, CELL_FONT);

                    if (width > max) {
                        max = width;
                    }

                });

            });

            if (hasContent) {
                result[column.id] = Math.ceil(max) + CONTENT_WIDTH_PADDING;
            }

        });

        return result;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, value]);

    function columnMaxWidth(column: TableColumn): number {

        const contentMax = contentMaxWidths[column.id];

        // No content typed into this column anywhere in the
        // table yet -- there's nothing to justify making it any
        // wider than its own default width, so that default
        // becomes the drag ceiling (it can still be dragged
        // narrower, down to its title's own minimum).
        if (contentMax === undefined) {
            return Math.max(columnMinWidth(column), DEFAULT_COLUMN_WIDTH);
        }

        return Math.max(columnMinWidth(column), contentMax);

    }

    // Measure each header's title text width directly (via
    // canvas, using the header's own actual font) so a
    // column can never be resized narrower than its own
    // title -- deliberately NOT th.scrollWidth, which
    // reflects the column's current *rendered* width
    // (already stretched by the table's auto layout) rather
    // than the title text's true minimum, and used to leave
    // a column stuck unable to shrink much below whatever
    // width it already happened to have.
    useLayoutEffect(() => {

        const next: Record<string, number> = {};

        columns.forEach(column => {

            const th = headerRefs.current[column.id];
            const label = th?.querySelector(".dynamic-table-header-label");

            const font = computedFont(label, HEADER_FONT_FALLBACK);
            const textWidth = measureTextWidth(column.title, font);

            next[column.id] = Math.ceil(textWidth) + HEADER_CELL_PADDING;

        });

        setMinWidths(next);

        // Column set changed (new Section) -- drop any
        // manual widths from the previous table.
        setColWidths({});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns.map(column => column.id).join("|")]);

    // Remembers what the row-height effect below last measured
    // against, so it can tell "just typing in one cell" (the
    // overwhelmingly common case, and the one worth optimizing)
    // apart from anything structural (a row added/removed/moved, or
    // a column definition/width changing) -- see the effect itself.
    const previousMeasureDepsRef = useRef<{
        value: TableRow[];
        columnsKey: string;
        colWidths: Record<string, number>;
        minWidths: Record<string, number>;
    } | null>(null);

    // Re-measure data row heights whenever anything that could
    // change them changes -- a row's own content (typing can wrap an
    // AutoGrowTextarea onto more lines), or a column width (narrowing
    // a column can force the same wrap). This runs as a layout effect
    // so it reads heights *after* AutoGrowTextarea's own layout
    // effect has already resized its textarea in the same commit
    // (React runs child layout effects before parent ones), and
    // completes before the browser paints, so the actions table's
    // rows never visibly lag a frame behind.
    //
    // Every body row's height is floored at
    // ACTIONS_MIN_ROW_HEIGHT and that floored value is applied
    // to *both* tables' rows (not just the actions table's) --
    // a short row (e.g. a single blank line of text) would
    // otherwise be shorter than the Up/Down/Remove/Add
    // controls actually need, and forcing only the actions
    // table's row taller would leave the two tables' rows out
    // of step for every row after it.
    //
    // Typing in one cell re-renders this whole component (see
    // Conversation.tsx's redraw()), which gives `columns` a brand
    // new array/object reference on every keystroke regardless of
    // whether the Section's actual columns changed -- comparing it
    // by identity would defeat this almost every time, so it's
    // compared by its column ids instead (same idiom the min-width
    // effect above already uses). `colWidths`/`minWidths` are plain
    // `useState` values that only get a new reference when actually
    // changed (a resize drag, or a Section switch resetting them),
    // so comparing THOSE by identity is reliable.
    //
    // When row count, columns, and both width maps are exactly what
    // they were last time this ran, every mutator in this file (see
    // updateCell/addMethodEntry/etc.) replaces only the row
    // object(s) it actually edited and leaves every other row's
    // object reference untouched -- so only rows whose reference
    // changed can possibly have a new rendered height, and only
    // those need a fresh `getBoundingClientRect()`. Anything
    // structural (a row added/removed/reordered, or a column
    // definition/width change) instead falls back to the exact
    // original full remeasure, unchanged, so this can only ever
    // remeasure a superset of what actually needs it -- never less.
    useLayoutEffect(() => {

        const columnsKey = columns.map(column => column.id).join("|");
        const previous = previousMeasureDepsRef.current;

        const canMeasureIncrementally =
            previous !== null &&
            previous.value.length === value.length &&
            previous.columnsKey === columnsKey &&
            previous.colWidths === colWidths &&
            previous.minWidths === minWidths;

        previousMeasureDepsRef.current = { value, columnsKey, colWidths, minWidths };

        if (canMeasureIncrementally) {

            const previousValue = previous.value;

            setRowHeights(previousHeights => {

                let next: Record<string, number> | null = null;

                value.forEach((row, rowIndex) => {

                    if (row === previousValue[rowIndex]) {
                        return;
                    }

                    const el = dataRowRefs.current[rowIndex];

                    if (!el) {
                        return;
                    }

                    if (!next) {
                        next = { ...previousHeights };
                    }

                    next[rowIndex] = Math.max(el.getBoundingClientRect().height, ACTIONS_MIN_ROW_HEIGHT);

                });

                return next ?? previousHeights;

            });

            return;

        }

        const next: Record<string, number> = {};

        Object.entries(dataRowRefs.current).forEach(([key, el]) => {

            if (!el) {
                return;
            }

            const height = el.getBoundingClientRect().height;

            next[key] = key === "header"
                ? height
                : Math.max(height, ACTIONS_MIN_ROW_HEIGHT);

        });

        setRowHeights(next);

    }, [value, columns, colWidths, minWidths]);

    function handleMouseMove(event: MouseEvent) {

        const drag = dragState.current;

        if (!drag) {
            return;
        }

        const column = columns.find(candidate => candidate.id === drag.columnId);

        if (!column) {
            return;
        }

        const min = columnMinWidth(column);
        const max = columnMaxWidth(column);

        const proposed = Math.round(drag.startWidth + (event.clientX - drag.startX));

        const next = Math.min(max, Math.max(min, proposed));

        setColWidths(prev => ({

            ...prev,

            [drag.columnId]: next

        }));

    }

    function handleMouseUp() {

        dragState.current = null;

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

    }

    function startResize(columnId: string, event: React.MouseEvent) {

        event.preventDefault();

        // The table is always rendered with an explicit,
        // deterministic width per column (see columnWidthPx) --
        // there's no separate "natural sizing" state to jump
        // from anymore, so the drag can simply start from
        // whatever that column is showing right now, whether
        // that's its default width or an earlier manual resize.
        const column = columns.find(candidate => candidate.id === columnId);

        const startWidth = column
            ? columnWidthPx(column)
            : MIN_COLUMN_WIDTH;

        dragState.current = {

            columnId,

            startX: event.clientX,

            startWidth

        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

    }

    // Clean up any dangling listeners on unmount (e.g. if the
    // user navigates away mid-drag).
    useEffect(() => {

        return () => {

            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function createRow(): TableRow {

        const row: TableRow = {};

        columns.forEach(column => {

            // A `repeatable`/`repeatableValue` column's cell holds
            // a LIST of values (rendered as a vertical list within
            // that one row's own cell -- see renderRepeatableList /
            // renderRepeatableValueList) -- it starts with exactly
            // one blank entry, same as every other column starts
            // with one blank value.
            row[column.id] = (column.repeatable || column.repeatableValue) ? [""] : "";

        });

        return row;

    }

    // Reads a `repeatable`/`repeatableValue` column's list of
    // values for one row -- tolerant of a legacy saved response
    // that still has a plain scalar there (wraps it as a single-
    // entry list) or nothing at all (falls back to one blank
    // entry), so an older saved Table never renders broken.
    //
    // For a `repeatableValue` column specifically, the returned list
    // is always padded (with blank entries) or trimmed to exactly
    // match its paired `repeatable` driver column's OWN current
    // length on this same row -- e.g. Method Mix always shows one
    // entry per Revenue Method, even for a row whose two arrays
    // happen to have drifted to different lengths (a legacy/stale
    // saved response, or a driver add/remove that ran before this
    // reconciliation existed) -- so the two lists can never visibly
    // disagree on how many entries this row has, no matter how the
    // underlying data got into that state.
    function getRowList(row: TableRow, columnId: string): string[] {

        const raw = row[columnId];

        let list: string[];

        if (Array.isArray(raw)) {
            list = raw.length > 0 ? raw.map(entry => String(entry ?? "")) : [""];
        } else if (raw === undefined || raw === null || raw === "") {
            list = [""];
        } else {
            list = [String(raw)];
        }

        const driverColumnId = driverIdForValueColumn[columnId];

        if (driverColumnId) {

            const driverLength = getRowList(row, driverColumnId).length;

            if (list.length < driverLength) {
                list = [...list, ...new Array(driverLength - list.length).fill("")];
            } else if (list.length > driverLength) {
                list = list.slice(0, driverLength);
            }

        }

        return list;

    }

    // Inserts a fully blank new row directly after `afterIndex`
    // (this table's own row-actions "+" -- the one outside the
    // scrollable data table, next to Up/Down/Remove -- calls this
    // with its own row's index), rather than always appending to
    // the very end of the table -- a "+" pressed next to row 2 of
    // 6 should add a row near row 2, not somewhere the user has to
    // scroll down to find. Omitting afterIndex appends to the end,
    // used only as a fallback.
    //
    // This is the "add a whole new Revenue Stream" action -- one
    // row is always exactly one Stream now, so this is also the
    // ONLY way a new Stream gets added; adding another Method for
    // an EXISTING Stream never touches table rows at all, see
    // `addMethodEntry` below.
    function addRow(afterIndex?: number) {

        const newRow = createRow();

        if (afterIndex === undefined) {

            onChange([...value, newRow]);

            return;

        }

        const rows = [...value];

        rows.splice(afterIndex + 1, 0, newRow);

        onChange(rows);

    }

    function clearRow(index: number) {

        const rows = [...value];

        rows[index] = createRow();

        onChange(rows);

    }

    function deleteRow(index: number) {

        // A table always keeps at least one row -- pressing
        // the minus button on the last remaining row clears
        // its contents back to blank instead of doing nothing.
        if (value.length <= 1) {
            clearRow(index);
            return;
        }

        const rows = value.filter((_, i) => i !== index);

        onChange(rows);

    }

    function moveRow(index: number, direction: -1 | 1) {

        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= value.length) {
            return;
        }

        const rows = [...value];

        const [moved] = rows.splice(index, 1);
        rows.splice(targetIndex, 0, moved);

        onChange(rows);

    }

    function updateCell(

        rowIndex: number,

        columnId: string,

        cellValue: unknown

    ) {

        const rows = [...value];

        rows[rowIndex] = {

            ...rows[rowIndex],

            [columnId]: cellValue

        };

        onChange(rows);

    }

    // Adds another entry to a `repeatable` driver column's own list
    // on this ONE row (e.g. another Revenue Method for this same
    // Stream) -- only the driver's own list needs to grow here.
    // Every paired `repeatableValue` column (e.g. Method Mix %)
    // automatically renders (and, once typed into, saves) one more
    // blank entry to match, via `getRowList`'s own driver-length
    // reconciliation above -- so there's nothing to keep in step by
    // hand here.
    function addMethodEntry(rowIndex: number, driverColumnId: string) {

        const rows = [...value];

        const row = { ...rows[rowIndex] };

        row[driverColumnId] = [...getRowList(row, driverColumnId), ""];

        rows[rowIndex] = row;

        onChange(rows);

    }

    // Removes one entry (by its position within the list) from a
    // `repeatable` driver column's own list on this row, and the
    // matching entry from every paired `repeatableValue` column's
    // list -- EXCEPT when it's the only entry left, in which case
    // removing it outright would leave the row with no Method at
    // all. In that one case, this clears the entry's value(s) back
    // to blank instead, keeping exactly one (empty) entry, so the
    // row always has somewhere to type a replacement Method into.
    function removeMethodEntry(rowIndex: number, driverColumnId: string, entryIndex: number) {

        const rows = [...value];

        const row = { ...rows[rowIndex] };

        const driverList = getRowList(row, driverColumnId);

        const pairedColumns = pairedValueColumnsByDriver[driverColumnId] ?? [];

        if (driverList.length <= 1) {

            row[driverColumnId] = [""];

            pairedColumns.forEach(pairedColumn => {
                row[pairedColumn.id] = [""];
            });

        } else {

            // Read each paired column's own list -- padded/trimmed
            // to the driver's CURRENT (pre-removal) length, so entry
            // `entryIndex` of the paired list still lines up with
            // the driver entry actually being removed -- BEFORE
            // shrinking the driver itself. Reading it after would
            // have `getRowList` pad/trim against the already-
            // shortened driver instead, silently dropping the wrong
            // entry off the end rather than the one the user clicked
            // "-" next to.
            const pairedListsBeforeRemove = pairedColumns.map(pairedColumn => getRowList(row, pairedColumn.id));

            row[driverColumnId] = driverList.filter((_entry, i) => i !== entryIndex);

            pairedColumns.forEach((pairedColumn, index) => {
                row[pairedColumn.id] = pairedListsBeforeRemove[index].filter((_entry, i) => i !== entryIndex);
            });

        }

        rows[rowIndex] = row;

        onChange(rows);

    }

    // Updates a single entry (by its position within the list)
    // of a `repeatable` or `repeatableValue` column's own list on
    // one row -- used for every keystroke/selection inside that
    // column's per-entry list items.
    function updateMethodEntry(rowIndex: number, columnId: string, entryIndex: number, entryValue: string) {

        const rows = [...value];

        const row = { ...rows[rowIndex] };

        const list = [...getRowList(row, columnId)];

        list[entryIndex] = entryValue;

        row[columnId] = list;

        rows[rowIndex] = row;

        onChange(rows);

    }

    // Renders a single value control (whatever `column.type` calls
    // for) against one raw value and one change handler -- used
    // both for an ordinary (non-list) cell, via `renderCell` below,
    // and for each individual entry inside a `repeatable`/
    // `repeatableValue` column's own list, via `renderRepeatableList`
    // / `renderRepeatableValueList`. `idSuffix` keeps generated ids
    // (e.g. an autofill <datalist>'s id) unique per control.
    function renderValueControl(

        column: TableColumn,

        cellValue: unknown,

        onValueChange: (value: unknown) => void,

        idSuffix: string

    ) {

        // Every control this funnel renders is a bare field with no
        // visible <label> -- the only thing naming it is its column
        // header, which a screen reader never associates automatically.
        // The column title becomes the control's accessible name, so
        // focusing a cell announces "Revenue Stream" rather than an
        // anonymous "edit text". Every Table in every System renders
        // through here, so naming it once covers all of them.
        const cellLabel = column.title;

        switch (column.type) {

            case "field":

                if (!column.field) {

                    return null;

                }

                return (

                    <FieldRenderer

                        ariaLabel={cellLabel}

                        field={column.field}

                        value={cellValue}

                        disabled={disabled}

                        onChange={onValueChange}

                    />

                );

            case "date":

                return (

                    <DateCellInput

                        ariaLabel={cellLabel}

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={onValueChange}

                    />

                );

            case "number":

                return (

                    <input

                        type="number"

                        className="interview-input"
                        aria-label={cellLabel}

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(event) => onValueChange(event.target.value)}

                    />

                );

            case "dynamic-select": {

                const options = column.options ?? [];

                return (

                    <select

                        className="interview-input"
                        aria-label={cellLabel}

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(event) => onValueChange(event.target.value)}

                    >

                        <option value="">

                            {options.length > 0 ? "Select" : "No options entered yet"}

                        </option>

                        {options.map(option => (

                            <option key={option} value={option}>

                                {option}

                            </option>

                        ))}

                    </select>

                );

            }

            case "autofill": {

                // Excel-style autofill: every distinct value
                // already entered anywhere else in this same
                // column becomes a suggestion, so a repeated
                // Category (or similar) can be picked instead
                // of retyped. Each control gets its own
                // <datalist> (same suggestion set, uniquely-
                // scoped id) rather than one shared element, so
                // ids stay unique without any extra plumbing.
                const columnId = column.id;

                const suggestions = Array.from(new Set(

                    value

                        .map(candidateRow => String(candidateRow[columnId] ?? "").trim())

                        .filter(text => text.length > 0)

                ));

                const datalistId = `autofill-${columnId}-${idSuffix}`;

                return (

                    <>

                        <input

                            type="text"

                            list={datalistId}

                            className="interview-input"

                            disabled={disabled}

                            value={String(cellValue ?? "")}

                            onChange={(event) => onValueChange(event.target.value)}

                        />

                        <datalist id={datalistId}>

                            {suggestions.map(option => (
                                <option key={option} value={option} />
                            ))}

                        </datalist>

                    </>

                );

            }

            case "notes":

                // A column literally titled "Notes" OR "Description"
                // (see resolveColumnType in AnswerRenderer.tsx) --
                // routed through the SAME shared NotesField component
                // every other Notes-purpose field in the app uses
                // (Operational Log, Roles & Responsibilities, the
                // Organization Calendar's per-task Note), so the
                // bullet/numbered-list authoring and guaranteed
                // regular font-weight are identical here too, instead
                // of this table growing its own slightly-different
                // fourth copy. `.dynamic-table-scroll .interview-input`
                // (conversation.css) already styles width/padding/
                // border/focus for any `.interview-input` in this
                // table, so NotesField needs no extra className here.
                //
                // The placeholder itself still tells the two apart --
                // "Add a description" for a Description column, only
                // NotesField's own default ("Add a note") for an
                // actual Notes column.
                return (

                    <NotesField

                        ariaLabel={cellLabel}

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={onValueChange}

                        placeholder={
                            column.title.trim().toLowerCase() === "description"
                                ? "Add a description"
                                : undefined
                        }

                    />

                );

            case "text":

            default:

                return (

                    <AutoGrowTextarea

                        ariaLabel={cellLabel}

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={onValueChange}

                    />

                );

        }

    }

    // A `repeatable` driver column (e.g. Revenue Method) renders as
    // a vertical list of entries within its own cell, each with its
    // own inline "-" remove control, plus one trailing "add
    // another" control for the row -- since a Revenue Stream now
    // always lives on exactly one table row, this list (not new
    // table rows) is how it holds more than one Method.
    function renderRepeatableList(

        row: TableRow,

        rowIndex: number,

        column: TableColumn

    ) {

        const list = getRowList(row, column.id);

        return (

            <div className="dynamic-table-repeatable-list">

                {list.map((entryValue, entryIndex) => (

                    <div className="dynamic-table-repeatable-item" key={entryIndex}>

                        <div className="dynamic-table-repeatable-item-control">

                            {renderValueControl(

                                column,

                                entryValue,

                                (next) => updateMethodEntry(rowIndex, column.id, entryIndex, String(next ?? "")),

                                `${rowIndex}-${entryIndex}`

                            )}

                        </div>

                        <button

                            type="button"

                            disabled={disabled}

                            className="dynamic-table-repeatable-remove"

                            aria-label={`Remove this ${column.title}`}

                            title={`Remove this ${column.title}`}

                            onClick={() => removeMethodEntry(rowIndex, column.id, entryIndex)}

                        >
                            −
                        </button>

                    </div>

                ))}

                <button

                    type="button"

                    disabled={disabled}

                    className="dynamic-table-repeatable-add"

                    aria-label={`Add another ${column.title}`}

                    title={`Add another ${column.title}`}

                    onClick={() => addMethodEntry(rowIndex, column.id)}

                >
                    + Add {column.title}
                </button>

            </div>

        );

    }

    // A `repeatableValue` column (e.g. Method Mix %) renders a
    // matching vertical list of entries, one per entry of its
    // paired `repeatable` driver column on the same row -- values
    // only, no controls of its own, since its list length always
    // follows the driver's (see addMethodEntry/removeMethodEntry).
    function renderRepeatableValueList(

        row: TableRow,

        rowIndex: number,

        column: TableColumn

    ) {

        const list = getRowList(row, column.id);

        return (

            <div className="dynamic-table-repeatable-value-list">

                {list.map((entryValue, entryIndex) => (

                    <div className="dynamic-table-repeatable-value-item" key={entryIndex}>

                        {renderValueControl(

                            column,

                            entryValue,

                            (next) => updateMethodEntry(rowIndex, column.id, entryIndex, String(next ?? "")),

                            `${rowIndex}-${entryIndex}`

                        )}

                    </div>

                ))}

            </div>

        );

    }

    function renderCell(

        row: TableRow,

        rowIndex: number,

        column: TableColumn

    ) {

        if (column.repeatable) {
            return renderRepeatableList(row, rowIndex, column);
        }

        if (column.repeatableValue) {
            return renderRepeatableValueList(row, rowIndex, column);
        }

        return renderValueControl(

            column,

            row[column.id],

            (next) => updateCell(rowIndex, column.id, next),

            String(rowIndex)

        );

    }

    // A column's rendered width: a fixed control width for
    // Date/Field columns, the user's own manual resize if
    // they've dragged this column, or -- deliberately NOT
    // "whatever the browser's auto layout feels like handing
    // it" -- a fixed default width otherwise. An empty column
    // therefore never balloons out to soak up a wide table's
    // unused space; it just sits at its default width until
    // the user actually drags it wider.
    // A Field/Date/Dynamic-Select column's own fixed control
    // width (TYPE_FIXED_WIDTH), widened up to that column's own
    // title's measured minimum when the title itself is longer
    // than the control needs -- a common rule so a column's
    // header text can never overflow its own column, no matter
    // which control type that column renders (item: "Make a
    // common rule, so the columns should always cover completely
    // their headers", filed against "Communication Frequency"'s
    // Frequency Field column, whose fixed 170px control width
    // was narrower than its own header text).
    function fixedColumnWidth(column: TableColumn): number | undefined {

        const fixed = TYPE_FIXED_WIDTH[column.type];

        if (fixed === undefined) {
            return undefined;
        }

        return Math.max(fixed, columnMinWidth(column));

    }

    function columnWidthPx(column: TableColumn): number {

        const extra = column.repeatable ? REPEATABLE_BUTTON_WIDTH : 0;

        const fixed = fixedColumnWidth(column);

        if (fixed !== undefined) {
            return fixed + extra;
        }

        if (colWidths[column.id] !== undefined) {
            return colWidths[column.id] + extra;
        }

        return Math.max(columnMinWidth(column), DEFAULT_COLUMN_WIDTH) + extra;

    }

    function fixedWidthStyle(column: TableColumn): React.CSSProperties | undefined {

        const fixed = fixedColumnWidth(column);

        if (fixed === undefined) {
            return undefined;
        }

        const width = fixed + (column.repeatable ? REPEATABLE_BUTTON_WIDTH : 0);

        return { width, minWidth: width, maxWidth: width };

    }

    // The data table's own width once columns have been
    // manually resized: the exact sum of every column's pixel
    // width (row-number + every data column -- the row-actions
    // column is a separate table entirely, see the return
    // statement below), not a vague "auto". With
    // table-layout:fixed, CSS resolves an "auto" table width
    // against its *containing block*, and if that container is
    // wider than the sum of the colgroup widths, the browser
    // stretches the table to fill it -- silently distributing
    // the leftover space across columns that were never
    // touched. Pinning the table's width to exactly this sum
    // makes the container width irrelevant: there is no
    // leftover to distribute, so every column keeps precisely
    // the width it was given.
    function totalTableWidth(): number {

        let total = rowNumberColumnWidth;

        columns.forEach(column => {
            total += columnWidthPx(column);
        });

        return total;

    }

    return (

        <div className="dynamic-table">

            {/* Only the data table (row-number + the actual
                columns) lives in the horizontally-scrolling,
                width-pinned wrapper. The Up/Down/Add/Remove
                controls render in a second, separate <table>
                further below that is never part of this scroll
                area and never part of this table's <colgroup> --
                so resizing or scrolling a data column can not
                move, resize, or otherwise touch it. */}
            <div className="dynamic-table-scroll" ref={scrollRef}>

                {/* The table always renders with an explicit column-
                    by-column width via <colgroup>, and its own width
                    pinned to the exact sum of those columns (see
                    totalTableWidth) -- never "auto" and never a
                    browser-computed natural layout. Two browser
                    behaviours made that unsafe: first, table-layout:
                    auto is free to hand an empty column all of a wide
                    table's left-over space (an empty cell could
                    stretch to fill hundreds of pixels of nothing);
                    second, even table-layout:fixed with an "auto"
                    table width resolves that width against the
                    table's *containing block*, so if the container is
                    wider than the colgroup's own total, the browser
                    still stretches the table and redistributes the
                    difference across columns that were never touched
                    -- which is what made resizing one column visibly
                    resize columns you never dragged, and made a
                    column next to a fixed-width Date/Field column
                    (which can't give an inch) seem unresponsive,
                    since it was quietly absorbing someone else's
                    slack instead. Pinning both the table's width and
                    every column's width removes all of that leftover
                    space to redistribute: every column keeps exactly
                    the width it was given (a fixed control width, a
                    manual resize, or its own default) from the
                    moment the table first renders, and widening one
                    only pushes the columns after it further along
                    the row -- with a horizontal scrollbar if the
                    table no longer fits -- never shrinking or
                    growing any of the others. */}
                <table style={{

                    tableLayout: "fixed",

                    width: `${totalTableWidth()}px`

                }}>

                    <colgroup>

                        <col style={{ width: `${rowNumberColumnWidth}px` }} />

                        {columns.map(column => (

                            <col

                                key={column.id}

                                style={{

                                    width: `${columnWidthPx(column)}px`

                                }}

                            />

                        ))}

                    </colgroup>

                    <thead>

                        <tr ref={(el) => { dataRowRefs.current.header = el; }}>

                            <th>{rowNumberLabel}</th>

                            {columns.map(column => (

                                <th

                                    key={column.id}

                                    ref={(el) => { headerRefs.current[column.id] = el; }}

                                    style={fixedWidthStyle(column)}

                                >

                                    <span className="dynamic-table-header-label">

                                        {column.title}

                                    </span>

                                    {!isFixedWidthColumn(column) && (

                                        <span

                                            className="col-resize-handle"

                                            onMouseDown={(event) => startResize(column.id, event)}

                                        />

                                    )}

                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {value.map((row, rowIndex) => (

                            <tr

                                key={rowIndex}

                                ref={(el) => { dataRowRefs.current[rowIndex] = el; }}

                                style={{ height: rowHeights[rowIndex] }}

                                className={
                                    rowSelection
                                        ? "dynamic-table-row-selectable" +
                                            (rowSelection.isSelected(row, rowIndex) ? " dynamic-table-row-selected" : "")
                                        : undefined
                                }

                                onClick={
                                    rowSelection
                                        ? () => rowSelection.onSelect(row, rowIndex)
                                        : undefined
                                }

                            >

                                <td className={rowSelection ? "dynamic-table-row-number-cell" : undefined}>

                                    {rowIndex + 1}

                                    {rowSelection && (
                                        <button
                                            type="button"
                                            className={
                                                "dynamic-table-row-select-bullet" +
                                                    (rowSelection.isSelected(row, rowIndex) ? " dynamic-table-row-select-bullet-selected" : "")
                                            }
                                            aria-label={
                                                rowSelection.isSelected(row, rowIndex)
                                                    ? `Row ${rowIndex + 1} selected`
                                                    : `Select row ${rowIndex + 1}`
                                            }
                                            title="Select this row"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                rowSelection.onSelect(row, rowIndex);
                                            }}
                                        >
                                            {rowSelection.isSelected(row, rowIndex) ? "●" : "○"}
                                        </button>
                                    )}

                                </td>

                                {columns.map(column => {

                                    // A `groupSumCheck` column (e.g. Method
                                    // Mix %) gets a small ✓/⚠ badge under its
                                    // own list, summing just THIS row's own
                                    // entries -- every Revenue Stream is a
                                    // single row now, so each one is checked
                                    // entirely independently of every other
                                    // Stream, unlike `sumCheck`'s single
                                    // whole-table totals row.
                                    const showGroupCheck = column.groupSumCheck;

                                    return (

                                        <td
                                            key={column.id}
                                            style={fixedWidthStyle(column)}
                                        >

                                            {

                                                renderCell(

                                                    row,

                                                    rowIndex,

                                                    column

                                                )

                                            }

                                            {showGroupCheck && (() => {

                                                const groupTotal = rowListTotal(column, row);
                                                const isBalanced = Math.abs(groupTotal - 100) < 0.5;

                                                return (

                                                    <span
                                                        className={
                                                            "dynamic-table-group-check " +
                                                            (isBalanced ? "dynamic-table-totals-ok" : "dynamic-table-totals-warn")
                                                        }
                                                        title={
                                                            isBalanced
                                                                ? "This Stream's Methods add up to 100%"
                                                                : `This Stream's Methods should add up to 100% -- currently ${groupTotal}%`
                                                        }
                                                    >
                                                        {isBalanced ? "✓" : "⚠"} {groupTotal}%
                                                    </span>

                                                );

                                            })()}

                                        </td>

                                    );

                                })}

                            </tr>

                        ))}

                        {sumCheckColumns.length > 0 && (

                            <tr className="dynamic-table-totals-row">

                                <td className="dynamic-table-totals-label">Total</td>

                                {columns.map(column => {

                                    if (!column.sumCheck) {
                                        return <td key={column.id} />;
                                    }

                                    const total = columnTotal(column);
                                    const isBalanced = Math.abs(total - 100) < 0.5;

                                    return (

                                        <td key={column.id} className="dynamic-table-totals-value-cell">

                                            <span
                                                className={
                                                    "dynamic-table-totals-value " +
                                                    (isBalanced ? "dynamic-table-totals-ok" : "dynamic-table-totals-warn")
                                                }
                                                title={
                                                    isBalanced
                                                        ? "Adds up to 100%"
                                                        : `Should add up to 100% -- currently ${total}%`
                                                }
                                            >
                                                {isBalanced ? "✓" : "⚠"} {total}%
                                            </span>

                                        </td>

                                    );

                                })}

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

            <table className="dynamic-table-actions-table" style={{ width: `${ACTIONS_COLUMN_WIDTH}px` }}>

                <thead>

                    <tr style={{ height: rowHeights.header }}>

                        <th className="dynamic-table-row-actions-cell"></th>

                    </tr>

                </thead>

                <tbody>

                    {value.map((_row, rowIndex) => (

                        <tr key={rowIndex} style={{ height: rowHeights[rowIndex] }}>

                            <td className="dynamic-table-row-actions-cell">

                                <div className="dynamic-table-row-actions">

                                    <div className="dynamic-table-row-move">

                                        <button

                                            type="button"

                                            disabled={disabled || rowIndex === 0}

                                            className="dynamic-table-row-move-up"

                                            aria-label="Move row up"

                                            title="Move row up"

                                            onClick={() => moveRow(rowIndex, -1)}

                                        >
                                            ▲
                                        </button>

                                        <button

                                            type="button"

                                            disabled={disabled || rowIndex === value.length - 1}

                                            className="dynamic-table-row-move-down"

                                            aria-label="Move row down"

                                            title="Move row down"

                                            onClick={() => moveRow(rowIndex, 1)}

                                        >
                                            ▼
                                        </button>

                                    </div>

                                    <div className="dynamic-table-row-delete-add">

                                        <button

                                            type="button"

                                            disabled={disabled}

                                            className="dynamic-table-row-remove"

                                            aria-label={value.length <= 1 ? "Clear row" : "Delete row"}

                                            title={value.length <= 1 ? "Clear row" : "Delete row"}

                                            onClick={() =>

                                                deleteRow(

                                                    rowIndex

                                                )

                                            }

                                        >
                                            −
                                        </button>

                                        <button

                                            type="button"

                                            disabled={disabled}

                                            className="dynamic-table-row-add"

                                            aria-label="Add row"

                                            title="Add row"

                                            onClick={() => addRow(rowIndex)}

                                        >
                                            +
                                        </button>

                                    </div>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

// Wrapped in React.memo: DynamicTable is used by nearly every
// interview Section (~15 Tables across the app), and without this a
// keystroke in ANY field on the page re-renders every mounted Table,
// including its full row/column measurement work. React.memo's
// default shallow prop comparison only pays off because every prop
// that actually varies is now kept referentially stable across an
// unrelated re-render: `columns` (memoized in AnswerRenderer.tsx),
// `onChange`/`resolveDynamicOptions`-derived callbacks (memoized in
// Conversation.tsx), and `value`/`disabled`/`rowNumberLabel` (either
// primitives or, for `value`, the same array reference unless this
// exact Table's own data changed). `rowSelection` is the one
// intentional exception -- see productRegisterRowSelection's comment
// in Conversation.tsx for why leaving it unmemoized there is an
// accepted, low-risk tradeoff for the single Product Register table.
export default memo(DynamicTable);
