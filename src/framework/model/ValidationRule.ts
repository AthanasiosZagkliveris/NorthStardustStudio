import { ValidationType } from "../enums/ValidationType.ts";

/**
 * Validation rule applied to a Framework answer.
 */
export interface ValidationRule {

    /**
     * Validation type.
     */
    type: ValidationType;

    /**
     * Optional comparison value.
     */
    value?: string | number;

    /**
     * Validation message.
     */
    message?: string;

}