import { AnswerType } from "../enums/AnswerType.ts";
import {
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

}