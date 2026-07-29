import { TableColumnDefinition } from "./TableColumnDefinition.ts";

/**
 * Defines a Framework dynamic table.
 */
export interface TableDefinition {

    /**
     * Table columns.
     */
    columns: TableColumnDefinition[];

    /**
     * Minimum number of rows.
     */
    minRows?: number;

    /**
     * Maximum number of rows.
     */
    maxRows?: number;

    /**
     * Allows users to add rows.
     */
    allowAddRows?: boolean;

    /**
     * Allows users to remove rows.
     */
    allowRemoveRows?: boolean;

    /**
     * Overrides the header label shown
     * above the automatic row-number
     * column (normally "#").
     *
     * Populated when the Answer Definition
     * Resource's Column 1 placeholder uses
     * a title other than "#" (e.g. "Phase").
     */
    rowNumberLabel?: string;

}