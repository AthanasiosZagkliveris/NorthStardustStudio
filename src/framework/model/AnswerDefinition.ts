import { AnswerType } from "../enums/AnswerType.ts";
import {
    AnswerPartDefinition,
    ProfileCardsDefinition,
    TableDefinition,
    VariantDefinition
} from "./index.ts";

/**
 * Defines how a Framework question
 * should be answered.
 */
export interface AnswerDefinition {

    /**
     * Framework answer structure.
     */
    type: AnswerType;

    /**
     * Fixed variants.
     *
     * Used only when the answer
     * structure is Fixed Variant Text.
     */
    variants?: VariantDefinition[];

    /**
     * Dynamic table definition.
     *
     * Used only when the answer
     * structure is Table.
     */
    table?: TableDefinition;

    /**
     * Named cards, each holding its own
     * reorderable list of free-text
     * entries.
     *
     * Used only when the answer
     * structure is Card List.
     */
    cards?: VariantDefinition[];

    /**
     * Profile Cards definition.
     *
     * Used only when the answer
     * structure is Profile Cards.
     */
    profile?: ProfileCardsDefinition;

    /**
     * Ordered sub-answers.
     *
     * Used only when the answer
     * structure is Multi-Part -- see
     * AnswerType.MultiPart's own doc
     * comment.
     */
    parts?: AnswerPartDefinition[];

    /**
     * When true, a Multi-Part answer renders its parts as ONE flat
     * tab bar (each part's own `label` becomes a tab title, exactly
     * one part shown at a time) instead of the default stacked
     * layout (every part shown at once, each under its own heading).
     * Used only when the answer structure is Multi-Part.
     *
     * Example: Finance System's Financial Model -- "Revenue Streams"
     * (a Table), "Funding Sources", "Financial Objectives" and
     * "Financial Principles" (each Free Text) all live as sibling
     * tabs of one card-style tab group, the same look Fixed Variant
     * Text's own tabs already have, even though the FIRST tab holds
     * a completely different Answer Structure than the rest.
     */
    tabbed?: boolean;

    /**
     * When true, a Multi-Part answer renders its parts SIDE BY SIDE
     * as equal-width columns (every part visible at once, each in
     * its own column under its own label) instead of the default
     * stacked layout or the `tabbed` tab bar. Every column is given
     * exactly the same width regardless of how much its own editor
     * or question text needs. Used only when the answer structure is
     * Multi-Part, and mutually exclusive with `tabbed` in practice --
     * `tabbed` is checked first, so a Section declaring both renders
     * as tabs.
     *
     * Example: Identity System's three pages (Definition, Expression,
     * Ethics), each holding four Free Text parts meant to be read and
     * filled in together rather than one at a time.
     */
    columns?: boolean;

    /**
     * When true, this Section's own units count on their own --
     * 1, 2, 3 on every page, under a page title that carries the
     * Section's number ("1. Definition") -- instead of continuing
     * one running count across the whole System.
     *
     * Declared as "**Numbering:** Nested" beside the Section's
     * Layout line. The two conventions answer different questions:
     * a running count says how far through the System a column is,
     * a nested one says where on its page it is. A System picks
     * one and every Section in it declares the same thing.
     *
     * Example: the Identity System, whose Definition, Ethics and
     * Legal Entity pages read 1-4, 1-4 and 1-6 rather than 1-4,
     * 5-8 and 9.
     */
    nestedNumbering?: boolean;

    /**
     * Which System's Section this one mirrors. Used only when the
     * answer structure is Shared Answer -- see
     * AnswerType.SharedAnswer.
     *
     * Undefined when the `Source:` line was missing or malformed,
     * which the renderer surfaces rather than rendering an empty
     * page that looks like a Section with nothing in it.
     */
    sharedSource?: {
        systemTitle: string;
        sectionTitle: string;
    };

}