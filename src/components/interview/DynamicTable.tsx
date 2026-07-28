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
        | "date";

    /**
     * Optional Framework Field.
     */
    field?: FieldDefinition;

    /**
     * Optional width.
     */
    width?: string;

}

export type TableRow =
    Record<string, unknown>;

interface DynamicTableProps {

    columns: TableColumn[];

    value: TableRow[];

    onChange: (rows: TableRow[]) => void;

    disabled?: boolean;

}

const ROW_NUMBER_COLUMN_WIDTH = 48;
const ACTIONS_COLUMN_WIDTH = 92;
const HEADER_CELL_PADDING = 26;
const MIN_COLUMN_WIDTH = 90;

// A Field (dropdown) or Date column holds a fixed
// control -- a select, or a text field + calendar
// button -- that doesn't benefit from being resized
// and looks broken if squeezed. These columns keep a
// constant width instead of participating in manual
// column resize at all.
const TYPE_FIXED_WIDTH: Partial<Record<TableColumn["type"], number>> = {

    date: 190,

    field: 170

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

    disabled = false

}: DynamicTableProps) {

    const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

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

    function columnMinWidth(column: TableColumn): number {

        const titleMin = minWidths[column.id] ?? MIN_COLUMN_WIDTH;

        return Math.max(MIN_COLUMN_WIDTH, titleMin);

    }

    // The widest single line currently held by each
    // resizable (text/number) column, so a column can
    // never be dragged wider than its own content
    // actually needs.
    const contentMaxWidths = useMemo(() => {

        const result: Record<string, number> = {};

        columns.forEach(column => {

            if (isFixedWidthColumn(column)) {
                return;
            }

            let max = 0;

            value.forEach(row => {

                const text = String(row[column.id] ?? "");

                const width = measureTextWidth(text, CELL_FONT);

                if (width > max) {
                    max = width;
                }

            });

            result[column.id] = Math.ceil(max) + CONTENT_WIDTH_PADDING;

        });

        return result;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, value]);

    function columnMaxWidth(column: TableColumn): number {

        const min = columnMinWidth(column);
        const contentMax = contentMaxWidths[column.id] ?? min;

        return Math.max(min, contentMax);

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

        // First manual resize in this table: snapshot every
        // column's current rendered width so the layout does
        // not jump when it switches from natural sizing to a
        // fixed layout.
        let baseWidths = colWidths;

        if (Object.keys(colWidths).length === 0) {

            const snapshot: Record<string, number> = {};

            columns.forEach(column => {

                const el = headerRefs.current[column.id];

                if (el) {
                    snapshot[column.id] = Math.round(el.getBoundingClientRect().width);
                }

            });

            baseWidths = snapshot;

            setColWidths(snapshot);

        }

        const startWidth =
            baseWidths[columnId] ??
            headerRefs.current[columnId]?.getBoundingClientRect().width ??
            MIN_COLUMN_WIDTH;

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

    function addRow() {

        onChange([

            ...value,

            createRow()

        ]);

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

    const hasCustomWidths = Object.keys(colWidths).length > 0;

    function columnWidthPx(column: TableColumn): number {

        const fixed = TYPE_FIXED_WIDTH[column.type];

        if (fixed !== undefined) {
            return fixed;
        }

        return colWidths[column.id] ?? minWidths[column.id] ?? MIN_COLUMN_WIDTH;

    }

    function fixedWidthStyle(column: TableColumn): React.CSSProperties | undefined {

        const fixed = TYPE_FIXED_WIDTH[column.type];

        if (fixed === undefined) {
            return undefined;
        }

        return { width: fixed, minWidth: fixed, maxWidth: fixed };

    }

    return (

        <div className="dynamic-table">

            <table style={{ tableLayout: hasCustomWidths ? "fixed" : "auto" }}>

                {hasCustomWidths && (

                    <colgroup>

                        <col style={{ width: `${ROW_NUMBER_COLUMN_WIDTH}px` }} />

                        {columns.map(column => (

                            <col

                                key={column.id}

                                style={{

                                    width: `${columnWidthPx(column)}px`

                                }}

                            />

                        ))}

                        <col style={{ width: `${ACTIONS_COLUMN_WIDTH}px` }} />

                    </colgroup>

                )}

                <thead>

                    <tr>

                        <th>#</th>

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

                        <th className="dynamic-table-row-actions-cell"></th>

                    </tr>

                </thead>

                <tbody>

                    {value.map((row, rowIndex) => (

                        <tr key={rowIndex}>

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

                                            onClick={addRow}

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
