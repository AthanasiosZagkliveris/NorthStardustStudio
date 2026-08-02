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

}