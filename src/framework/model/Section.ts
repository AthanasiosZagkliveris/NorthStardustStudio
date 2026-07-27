import { SectionBlock } from "./SectionBlock";
import { AnswerDefinition } from "./AnswerDefinition";

/**
 * Represents one Framework Section.
 *
 * A Section may be informational
 * or interviewable.
 */
export interface Section {

    /**
     * Interview order.
     *
     * Starts from 1.
     */
    number: number;

    /**
     * Section title.
     */
    title: string;

    /**
     * True when this Section expects
     * a user response.
     */
    interview: boolean;

    /**
     * Read-only Framework content.
     */
    blocks: SectionBlock[];

    /**
     * Describes how the response to
     * this Section should be structured.
     *
     * Defaults to Free Text when no
     * Answer Definition Resource entry
     * exists for this Section.
     */
    answer: AnswerDefinition;

}