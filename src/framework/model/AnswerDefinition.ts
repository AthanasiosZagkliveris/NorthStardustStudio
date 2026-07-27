import { AnswerType } from "../enums/AnswerType.ts";
import {
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

}