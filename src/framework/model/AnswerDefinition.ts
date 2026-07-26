import { AnswerType } from "../enums/AnswerType.ts";
import { TableDefinition } from "./TableDefinition.ts";
import { ValidationRule } from "./ValidationRule.ts";

/**
 * Defines how a Framework question
 * should be answered.
 */
export interface AnswerDefinition {

    /**
     * Answer type.
     */
    type: AnswerType;

    /**
     * Reusable Framework Field identifier.
     *
     * Example:
     * status
     * frequency
     * scale
     */
    fieldId?: string;

    /**
     * Dynamic table definition.
     */
    table?: TableDefinition;

    /**
     * Validation rules.
     */
    validation?: ValidationRule[];

}