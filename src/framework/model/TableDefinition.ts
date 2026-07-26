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

}