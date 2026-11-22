/*
    THE TABLE'S COLUMNS AND ROWS (DynamicTable.tsx): the shape of a column and of a row. Moved out of DynamicTable.tsx as they were
    (2026-11-22, the review of 2026-11-21, C1: one topic per file); DynamicTable.tsx re-exports them, so every import stays as it was.
*/
import { FieldDefinition } from "../../../framework/model/FieldDefinition.ts";

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
