import InterviewInput from "./InterviewInput";
import FieldRenderer from "./FieldRenderer";

import { FieldDefinition } from "../../framework/model/FieldDefinition.ts";

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
        | "field";

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

export default function DynamicTable({

    columns,

    value,

    onChange,

    disabled = false

}: DynamicTableProps) {

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

                    <InterviewInput

                        mode="input"

                        disabled={disabled}

                        value={String(cellValue ?? "")}

                        onChange={(value) =>

                            updateCell(

                                rowIndex,

                                column.id,

                                value

                            )

                        }

                    />

                );

        }

    }

    return (

        <div className="dynamic-table">

            <table>

                <thead>

                    <tr>

                        <th>#</th>

                        {columns.map(column => (

                            <th

                                key={column.id}

                                style={{

                                    width: column.width

                                }}

                            >

                                {column.title}

                            </th>

                        ))}

                        <th></th>

                    </tr>

                </thead>

                <tbody>

                    {value.length === 0 && (

                        <tr>

                            <td

                                colSpan={columns.length + 2}

                                className="dynamic-table-empty"

                            >

                                No rows yet.

                            </td>

                        </tr>

                    )}

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

                            <td>

                                <button

                                    type="button"

                                    disabled={disabled}

                                    className="dynamic-table-delete"

                                    onClick={() =>

                                        deleteRow(

                                            rowIndex

                                        )

                                    }

                                >

                                    Delete

                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            <div className="dynamic-table-actions">

                <button

                    type="button"

                    disabled={disabled}

                    className="dynamic-table-add"

                    onClick={addRow}

                >

                    + Add Row

                </button>

            </div>

        </div>

    );

}