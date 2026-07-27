import {
    AnswerDefinition,
    Metadata,
} from "./index.ts";

/**
 * Defines a single question within
 * a Framework System.
 */
export interface QuestionDefinition {

    /**
     * Question number.
     *
     * Example:
     * 1
     */
    number: number;

    /**
     * Question title.
     *
     * Example:
     * Mission
     */
    title: string;

    /**
     * Defines how the question
     * should be answered.
     */
    answer: AnswerDefinition;

    /**
     * Optional metadata
     * associated with the question.
     */
    metadata?: Metadata[];

}