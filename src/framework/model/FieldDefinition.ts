import { FieldOption } from "./FieldOption";

/**
 * Represents a reusable Framework Field.
 *
 * Examples:
 * - Status
 * - Scale
 * - Frequency
 */
export interface FieldDefinition {

    /**
     * Unique Framework identifier.
     */
    id: string;

    /**
     * Human-readable field name.
     */
    name: string;

    /**
     * Available selectable options.
     */
    options: FieldOption[];

}