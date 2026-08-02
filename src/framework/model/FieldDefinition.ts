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

    /**
     * When true, a "select"-type Field offers an extra "Other"
     * choice alongside its own preset `options` -- picking it
     * reveals a free-text input so the user can type any value not
     * already on the preset list (see FieldRenderer.tsx). Used by
     * the Platform Field ("Make a Platform Field, with variants the
     * most popular platforms... Give also the option to the user to
     * type any extra"); omitted (or false) for every other Field,
     * whose preset list is meant to be exhaustive.
     */
    allowCustom?: boolean;

}