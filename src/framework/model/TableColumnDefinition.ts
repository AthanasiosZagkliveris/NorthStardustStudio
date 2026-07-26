import { TableColumnType } from "../enums/TableColumnType.ts";

/**
 * Defines a single column within a
 * Framework dynamic table.
 */
export interface TableColumnDefinition {

    /**
     * Unique column identifier.
     */
    id: string;

    /**
     * Display title.
     */
    title: string;

    /**
     * Column type.
     */
    type: TableColumnType;

    /**
     * Optional reusable Framework Field.
     */
    fieldId?: string;

    /**
     * Required column.
     */
    required?: boolean;

}