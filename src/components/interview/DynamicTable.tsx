import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import FieldRenderer from "./FieldRenderer";
import DateCellInput from "./DateCellInput.tsx";

import { FieldDefinition } from "../../framework/model/FieldDefinition.ts";
import { DateFormat, PreferencesService } from "../../services/PreferencesService.ts";

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
     * row gets a small inline "+" next to
     * this column's cell that inserts a new
     * row directly below, copying over every
     * `groupAnchor` column's value from the
     * row it was inserted from.
     */
    repeatable?: boolean;

    /**
     * Marks this column's value as one that
     * should carry over into a new row
     * inserted via a `repeatable` column's
     * inline "+" (see above).
     */
    groupAnchor?: boolean;

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

}

// Fallback/minimum width for the automatic row-number
// column when its label is the default "#" -- a Table
// declaring a longer label (e.g. "Phase") measures its
// actual text width instead (see rowNumberColumnWidth
// below), so the label is never clipped.
const ROW_NUMBER_COLUMN_MIN_WIDTH = 48;

// A small inline "+" sits next to a repeatable column's
// cell content (see the "dynamic-select" case in
// renderCell) -- this is its fixed footprint, added on
// top of that column's own width so the button never
// squeezes the select control itself.
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

/**
 * Measures the pixel width of the longest line in
 * some text, using the same font as a table cell's
 * text input. Used to cap column resize at "wide
 * enough to show the longest line with no wrapping",
 * rather than leaving the column unbounded.
 */
function measureTextWidth(text: string, font: string): number {

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

    return max;

}

// Matches the font declared on .dynamic-table-textarea /
// .interview-input (font-size:15px, inherited font-family
// "Inter", normal weight) in conversation.css.
const CELL_FONT = "400 15px Inter, sans-serif";

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

    value,

    disabled,

    onChange

}: {

    value: string;

    disabled?: boolean;

    onChange: (value: string) => void;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

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

            ref={ref}

            className="dynamic-table-textarea"

            rows={1}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                onChange(event.target.value);

                resize(event.target);

            }}

        />

    );

}

export default function DynamicTable({

    columns,

    value,

    onChange,

    disabled = false,

    rowNumberLabel = "#"

}: DynamicTableProps) {

    const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

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

    // The date format preference (US/EU) is shown and
    // toggled once, on the column header -- repeating it
    // on every row would be noisy and confusing. All date
    // cells in the table (and every date cell anywhere
    // else in the app) still update together, since this
    // is the same shared preference.
    const [dateFormat, setDateFormat] = useState<DateFormat>(PreferencesService.getDateFormat());

    const dragState = useRef<{

        columnId: string;

        startX: number;

        startWidth: number;

    } | null>(null);

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setDateFormat(PreferencesService.getDateFormat());
        });

    }, []);

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

        return Math.max(ROW_NUMBER_COLUMN_MIN_WIDTH, Math.ceil(textWidth) + HEADER_CELL_PADDING);

    }, [rowNumberLabel]);

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

                const text = String(row[column.id] ?? "");

                if (text.trim().length === 0) {
                    return;
                }

                hasContent = true;

                const width = measureTextWidth(text, CELL_FONT);

                if (width > max) {
                    max = width;
                }

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

    // Re-measure every data row's rendered height whenever
    // anything that could change it changes -- the row's own
    // content (typing can wrap an AutoGrowTextarea onto more
    // lines), or a column width (narrowing a column can force
    // the same wrap). This runs as a layout effect so it reads
    // heights *after* AutoGrowTextarea's own layout effect has
    // already resized its textarea in the same commit (React
    // runs child layout effects before parent ones), and
    // completes before the browser paints, so the actions
    // table's rows never visibly lag a frame behind.
    //
    // Every body row's height is floored at
    // ACTIONS_MIN_ROW_HEIGHT and that floored value is applied
    // to *both* tables' rows (not just the actions table's) --
    // a short row (e.g. a single blank line of text) would
    // otherwise be shorter than the Up/Down/Remove/Add
    // controls actually need, and forcing only the actions
    // table's row taller would leave the two tables' rows out
    // of step for every row after it.
    useLayoutEffect(() => {

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

            row[column.id] = "";

        });

        return row;

    }

    // Inserts a new row directly after `afterIndex` (each row's
    // own "+" calls this with its own index), rather than always
    // appending to the very end of the table -- a "+" pressed next
    // to row 2 of 6 should add a row near row 2, not somewhere the
    // user has to scroll down to find. Omitting afterIndex appends
    // a blank row to the end, used only as a fallback.
    //
    // Every `groupAnchor` column's value is copied from the row at
    // `afterIndex` into the new row -- e.g. a Revenue Stream that
    // uses more than one Revenue Method can add another Method row
    // for the SAME stream, without re-picking the stream each time
    // and without a blank row breaking the group up. This applies
    // regardless of which "+" the user presses: the small inline
    // one next to a `repeatable` column's own select, or this
    // table's own row-actions "+" -- both call this same function,
    // so both behave identically.
    function addRow(afterIndex?: number) {

        const newRow = createRow();

        if (afterIndex === undefined) {

            onChange([...value, newRow]);

            return;

        }

        const sourceRow = value[afterIndex];

        columns.forEach(column => {

            if (column.groupAnchor) {
                newRow[column.id] = sourceRow[column.id];
            }

        });

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

    function renderCell(

        row: TableRow,

        rowIndex: number,

        column: TableColumn

    ) {

        const cellValue = row[column.id];

        switch (column.type) {

            case "field":

                if (!column.field) {

                    return null;

                }

                return (

                    <FieldRenderer

                        field={column.field}

                        value={cellValue}

                        disabled={disabled}

                        onChange={(value) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                value

                            )

                        }

                    />

                );

            case "date":

                return (

                    <DateCellInput

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(next) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                next

                            )

                        }

                    />

                );

            case "number":

                return (

                    <input

                        type="number"

                        className="interview-input"

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(event) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                event.target.value

                            )

                        }

                    />

                );

            case "dynamic-select": {

                const options = column.options ?? [];

                const select = (

                    <select

                        className="interview-input"

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(event) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                event.target.value

                            )

                        }

                    >

                        <option value="">

                            {options.length > 0 ? "Select..." : "No options entered yet"}

                        </option>

                        {options.map(option => (

                            <option key={option} value={option}>

                                {option}

                            </option>

                        ))}

                    </select>

                );

                if (!column.repeatable) {
                    return select;
                }

                // A repeatable column gets a small inline "+"
                // next to its own select -- e.g. a Revenue
                // Stream that uses more than one Revenue
                // Method can add another row for it right
                // here, without re-picking the stream (that
                // value carries over automatically via this
                // Table's `groupAnchor` column(s)).
                return (

                    <div className="dynamic-table-repeatable-cell">

                        {select}

                        <button

                            type="button"

                            disabled={disabled}

                            className="dynamic-table-repeatable-add"

                            aria-label={`Add another ${column.title}`}

                            title={`Add another ${column.title}`}

                            onClick={() => addRow(rowIndex)}

                        >
                            +
                        </button>

                    </div>

                );

            }

            case "autofill": {

                // Excel-style autofill: every distinct value
                // already entered anywhere else in this same
                // column becomes a suggestion, so a repeated
                // Category (or similar) can be picked instead
                // of retyped. Each row gets its own <datalist>
                // (same suggestion set, row-scoped id) rather
                // than one shared element, so ids stay unique
                // per row without any extra plumbing.
                const columnId = column.id;

                const suggestions = Array.from(new Set(

                    value

                        .map(candidateRow => String(candidateRow[columnId] ?? "").trim())

                        .filter(text => text.length > 0)

                ));

                const datalistId = `autofill-${columnId}-${rowIndex}`;

                return (

                    <>

                        <input

                            type="text"

                            list={datalistId}

                            className="interview-input"

                            disabled={disabled}

                            value={String(cellValue ?? "")}

                            onChange={(event) =>

                                updateCell(

                                    rowIndex,

                                    column.id,

                                    event.target.value

                                )

                            }

                        />

                        <datalist id={datalistId}>

                            {suggestions.map(option => (
                                <option key={option} value={option} />
                            ))}

                        </datalist>

                    </>

                );

            }

            case "text":

            default:

                return (

                    <AutoGrowTextarea

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(next) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                next

                            )

                        }

                    />

                );

        }

    }

    // A column's rendered width: a fixed control width for
    // Date/Field columns, the user's own manual resize if
    // they've dragged this column, or -- deliberately NOT
    // "whatever the browser's auto layout feels like handing
    // it" -- a fixed default width otherwise. An empty column
    // therefore never balloons out to soak up a wide table's
    // unused space; it just sits at its default width until
    // the user actually drags it wider.
    function columnWidthPx(column: TableColumn): number {

        const extra = column.repeatable ? REPEATABLE_BUTTON_WIDTH : 0;

        const fixed = TYPE_FIXED_WIDTH[column.type];

        if (fixed !== undefined) {
            return fixed + extra;
        }

        if (colWidths[column.id] !== undefined) {
            return colWidths[column.id] + extra;
        }

        return Math.max(columnMinWidth(column), DEFAULT_COLUMN_WIDTH) + extra;

    }

    function fixedWidthStyle(column: TableColumn): React.CSSProperties | undefined {

        const fixed = TYPE_FIXED_WIDTH[column.type];

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
            <div className="dynamic-table-scroll">

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

                                    {column.type === "date" && (

                                        <button

                                            type="button"

                                            className="dynamic-table-header-date-toggle"

                                            disabled={disabled}

                                            title={
                                                dateFormat === "US"
                                                    ? "Showing MM/DD/YYYY -- click to switch to DD/MM/YYYY"
                                                    : "Showing DD/MM/YYYY -- click to switch to MM/DD/YYYY"
                                            }

                                            onClick={() => PreferencesService.toggleDateFormat()}

                                        >

                                            {dateFormat === "US" ? "MM/DD" : "DD/MM"}

                                        </button>

                                    )}

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

                            >

                                <td>

                                    {rowIndex + 1}

                                </td>

                                {columns.map(column => (

                                    <td key={column.id} style={fixedWidthStyle(column)}>

                                        {

                                            renderCell(

                                                row,

                                                rowIndex,

                                                column

                                            )

                                        }

                                    </td>

                                ))}

                            </tr>

                        ))}

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
