import { FieldDefinition } from "./FieldDefinition";

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
     * Optional reusable Framework Field
     * identifier, as referenced inline
     * in the Answer Definition Resource.
     *
     * Examples:
     * status
     * frequency
     * scale
     */
    fieldId?: string;

    /**
     * Resolved Framework Field.
     *
     * Populated by the Framework Runtime
     * Engine when `fieldId` matches a
     * registered Shared Field Resource.
     */
    field?: FieldDefinition;

}