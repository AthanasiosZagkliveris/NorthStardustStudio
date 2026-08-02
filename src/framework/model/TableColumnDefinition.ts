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
         * Title of the System the source Section
         * belongs to, when it's a DIFFERENT System
         * than the one this column's own Section
         * lives in (matched the same normalized-
         * text way as `sectionTitle`/`cardTitle`).
         *
         * Omitted when the source Section is
         * another Section of the SAME System (the
         * original, most common case).
         *
         * Example: Finance System's Revenue Streams
         * column sourcing its options from the
         * Business System's Revenue Model Section.
         */
        systemTitle?: string;

        /**
         * Title of the Section whose
         * response supplies the options
         * (matched the same way Questions/
         * Answers Sections are matched --
         * normalized title text).
         */
        sectionTitle: string;

        /**
         * Title of the Card List card, or Table
         * column, within that Section whose
         * entries become this column's options
         * (or, for a Multi-Part Section, the same
         * title matched recursively across every
         * part until one yields options).
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
     * row's cell for this column holds a
     * *list* of values (rather than a single
     * value), rendered as a vertical list of
     * entries with a per-entry remove control
     * and a single "add another" control for
     * the row.
     *
     * Example: a "Revenue Method" column, so
     * a single Revenue Stream row can list
     * more than one method without needing
     * an extra table row per method.
     */
    repeatable?: boolean;

    /**
     * Marks this column's value as a list of
     * values kept in lock-step with the
     * nearest preceding `repeatable` column
     * on the same row -- one entry per entry
     * of that column, with no add/remove
     * controls of its own (its entries are
     * added/removed automatically alongside
     * the driving `repeatable` column's).
     *
     * Example: "Method Mix (%)" paired with
     * the "Revenue Method" repeatable column.
     */
    repeatableValue?: boolean;

    /**
     * Marks this numeric column as one whose
     * values should sum to 100 across the
     * whole table -- the table renders a
     * totals row beneath the data summing
     * every row's value, flagging whether the
     * sum actually reaches 100.
     */
    sumCheck?: boolean;

    /**
     * Marks this `repeatable`/`repeatableValue`
     * numeric column as one whose *own list of
     * values, within a single row,* should sum
     * to 100 -- e.g. a Revenue Stream's Method
     * Mix % entries should add up to 100,
     * entirely independently of every other
     * Stream's own methods. A small check
     * appears once per row.
     */
    groupSumCheck?: boolean;

}