import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
const ACTIONS_COLUMN_WIDTH = 56;
const HEADER_CELL_PADDING = 20;
const MIN_COLUMN_WIDTH = 90;

// Columns holding richer controls (a calendar-backed
// date field, or a Framework Field like a dropdown)
// need more room than their title alone to stay usable,
// so their resize floor is never allowed below this,
// even if the title text itself is short.
const TYPE_MIN_WIDTH: Partial<Record<TableColumn["type"], number>> = {

    date: 170,

    field: 150

};

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
        const typeMin = TYPE_MIN_WIDTH[column.type] ?? MIN_COLUMN_WIDTH;

        return Math.max(MIN_COLUMN_WIDTH, titleMin, typeMin);

    }

    // Measure each header's natural (un-wrapped) width once
    // rendered, so a column can never be resized narrower
    // than its own title (or, for date/field columns, the
    // controls they hold -- see TYPE_MIN_WIDTH above).
    useLayoutEffect(() => {

        const next: Record<string, number> = {};

        columns.forEach(column => {

            const el = headerRefs.current[column.id];

            if (el) {

                next[column.id] = Math.ceil(el.scrollWidth) + HEADER_CELL_PADDING;

            }

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

        const min = column ? columnMinWidth(column) : MIN_COLUMN_WIDTH;

        const next = Math.max(min, Math.round(drag.startWidth + (event.clientX - drag.startX)));

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

    function deleteRow(index: number) {

        // A table always keeps at least one row.
        if (value.length <= 1) {
            return;
        }

        const rows = value.filter((_, i) => i !== index);

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

                                    width: `${colWidths[column.id] ?? minWidths[column.id] ?? MIN_COLUMN_WIDTH}px`

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

                                <span

                                    className="col-resize-handle"

                                    onMouseDown={(event) => startResize(column.id, event)}

                                />

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

                                <td key={column.id}>

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

                                    <button

                                        type="button"

                                        disabled={disabled || value.length <= 1}

                                        className="dynamic-table-row-remove"

                                        aria-label="Delete row"

                                        title="Delete row"

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

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}
