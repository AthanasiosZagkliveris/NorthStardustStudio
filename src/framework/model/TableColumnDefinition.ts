/**
 * Defines a single column within a
 * Framework table.
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
     * Optional reusable Framework Field.
     *
     * Examples:
     * status
     * frequency
     * scale
     */
    fieldId?: string;

}