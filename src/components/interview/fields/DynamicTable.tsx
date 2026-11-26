import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import NavArrow from "../../controls/NavArrow.tsx";
import AddButton from "../../controls/AddButton.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import TextBox from "../../controls/TextBox.tsx";
import TextField from "../../controls/TextField.tsx";
import FieldRenderer from "./FieldRenderer";
import OptionPicker from "./OptionPicker.tsx";
import DateCellInput from "./DateCellInput.tsx";
import NotesField from "./NotesField.tsx";

import { useDragToScroll } from "../../../hooks/useDragToScroll.ts";
import { ROW_NUMBER_COLUMN_MIN_WIDTH, ACTIONS_COLUMN_WIDTH, ACTIONS_MIN_ROW_HEIGHT, HEADER_CELL_PADDING, isFixedWidthColumn, measureTextWidth, HEADER_FONT_FALLBACK } from "./dynamicTableWidths.ts";

import type { TableColumn, TableRow } from "./dynamicTableTypes.ts";
import * as tableRows from "./dynamicTableRows.ts";
import { useColumnWidths } from "./useColumnWidths.ts";

export type { TableColumn, TableRow };

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
     * Product System's Product Register (item 7) so
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

function DynamicTable({

    columns,

    value,

    onChange,

    disabled = false,

    rowNumberLabel = "#",

    rowSelection

}: DynamicTableProps) {

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

    // The column pairs of a `repeatable` column and its `repeatableValue` columns, both ways (dynamicTableRows.ts).
    const pairedValueColumnsByDriver = useMemo(() => tableRows.pairedValueColumns(columns), [columns]);

    const driverIdForValueColumn = useMemo(() => tableRows.driverIdsForValueColumns(pairedValueColumnsByDriver), [pairedValueColumnsByDriver]);

    // Every column marked `sumCheck` gets a totals row beneath
    // the data, summing every row's value and flagging whether
    // that sum reaches 100.
    const sumCheckColumns = useMemo(
        () => columns.filter(column => column.sumCheck),
        [columns]
    );

    // The rows and their changes (dynamicTableRows.ts): each change gives the new rows, handed to onChange here.
    const createRow = () => tableRows.createRow(columns);
    const getRowList = (row: TableRow, columnId: string) => tableRows.getRowList(row, columnId, driverIdForValueColumn);
    const columnTotal = (column: TableColumn) => tableRows.columnTotal(value, column);
    const rowListTotal = (column: TableColumn, row: TableRow) => tableRows.rowListTotal(column, row, driverIdForValueColumn);
    const addRow = (afterIndex?: number) => onChange(tableRows.addRow(value, columns, afterIndex));
    const deleteRow = (index: number) => onChange(tableRows.deleteRow(value, columns, index));
    const moveRow = (index: number, direction: -1 | 1) => {
        const rows = tableRows.moveRow(value, index, direction);
        if (rows) {
            onChange(rows);
        }
    };
    const updateCell = (rowIndex: number, columnId: string, cellValue: unknown) => onChange(tableRows.updateCell(value, rowIndex, columnId, cellValue));
    const addMethodEntry = (rowIndex: number, driverColumnId: string) => onChange(tableRows.addMethodEntry(value, driverIdForValueColumn, rowIndex, driverColumnId));
    const removeMethodEntry = (rowIndex: number, driverColumnId: string, entryIndex: number) => onChange(tableRows.removeMethodEntry(value, pairedValueColumnsByDriver, driverIdForValueColumn, rowIndex, driverColumnId, entryIndex));
    const updateMethodEntry = (rowIndex: number, columnId: string, entryIndex: number, entryValue: string) => onChange(tableRows.updateMethodEntry(value, driverIdForValueColumn, rowIndex, columnId, entryIndex, entryValue));

    // The column widths (useColumnWidths.ts): the least and greatest widths, the drag, and the width each column is drawn at.
    const { headerRefs, minWidths, colWidths, columnWidthPx, fixedWidthStyle, startResize } = useColumnWidths(columns, value, getRowList);

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

                    <OptionPicker
                        label={cellLabel}
                        placeholder={options.length > 0 ? "Select" : "No options entered yet"}
                        options={options}
                        disabled={disabled}
                        value={String(cellValue ?? "")}
                        onChange={onValueChange}
                    />

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

                        <TextBox

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
                // The placeholder tells the two apart: "Add a description"
                // for a Description column, nothing for an actual Notes
                // column (a Notes box says nothing, owner 2026-11-12).
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

                    <TextField className="dynamic-table-textarea"

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

                        <RemoveButton
                            disabled={disabled}
                            aria-label={`Remove this ${column.title}`}
                            onClick={() => removeMethodEntry(rowIndex, column.id, entryIndex)} />

                    </div>

                ))}

                <AddButton
                    disabled={disabled}
                    aria-label={`Add another ${column.title}`}
                    onClick={() => addMethodEntry(rowIndex, column.id)}>
                    + Add {column.title}
                </AddButton>

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

                                        <NavArrow vertical direction="previous" label="Move row up"
                                            disabled={disabled || rowIndex === 0}
                                            onClick={() => moveRow(rowIndex, -1)} />

                                        <NavArrow vertical direction="next" label="Move row down"
                                            disabled={disabled || rowIndex === value.length - 1}
                                            onClick={() => moveRow(rowIndex, 1)} />

                                    </div>

                                    <div className="dynamic-table-row-delete-add">

                                        <RemoveButton
                                            disabled={disabled}
                                            aria-label={value.length <= 1 ? "Clear row" : "Delete row"}
                                            onClick={() =>

                                                deleteRow(

                                                    rowIndex

                                                )

                                            } />

                                        <AddButton shape="box" small
                                            disabled={disabled}
                                            aria-label="Add row"
                                            onClick={() => addRow(rowIndex)} />

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
