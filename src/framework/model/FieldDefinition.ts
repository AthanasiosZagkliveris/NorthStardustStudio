import { FieldOption } from "./FieldOption.ts";

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
     * Rendering type.
     *
     * Every Shared Field currently
     * defined by the Framework
     * (Status, Scale, Frequency) is
     * rendered as a dropdown.
     */
    type: "select" | "input" | "textarea" | "number" | "date";

    /**
     * Optional placeholder text.
     */
    placeholder?: string;

    /**
     * Available selectable options.
     */
    options: FieldOption[];

}