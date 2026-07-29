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

    /**
     * References another Section's Card
     * List answer as this column's live
     * dropdown options.
     *
     * Example: a "Revenue Stream" column
     * whose choices should always match
     * whatever the user has entered under
     * the Revenue Model Section's "Revenue
     * Stream" card.
     */
    dynamicSource?: {

        /**
         * Title of the Section whose
         * response supplies the options
         * (matched the same way Questions/
         * Answers Sections are matched --
         * normalized title text).
         */
        sectionTitle: string;

        /**
         * Title of the Card List card
         * within that Section whose
         * entries become this column's
         * options.
         */
        cardTitle: string;

    };

    /**
     * Marks this column as an Excel-style
     * autofill column: as the user types,
     * distinct values already entered
     * elsewhere in this same column are
     * offered as suggestions.
     */
    autofill?: boolean;

    /**
     * Marks this column as repeatable: each
     * row gets a small inline "+" next to
     * this column's cell that inserts a new
     * row directly below, copying over every
     * `groupAnchor` column's value from the
     * row it was inserted from.
     *
     * Example: a "Revenue Method" column,
     * so a Revenue Stream that uses more
     * than one method can add another row
     * for it without re-picking the stream.
     */
    repeatable?: boolean;

    /**
     * Marks this column's value as one that
     * should carry over into a new row
     * inserted via a `repeatable` column's
     * "+" (see above).
     */
    groupAnchor?: boolean;

}