import { AnswerDefinition } from "./AnswerDefinition";

/**
 * One independent sub-answer inside a Multi-Part Answer
 * Definition (see AnswerType.MultiPart).
 *
 * `id` is the key this part's own value is stored under
 * inside the Section's composite response object -- a slug
 * of `label`, or "primary" for a Section's own unlabeled
 * leading part (a Structure declared before any "**Label**"
 * marker, e.g. Brand System's Color System table).
 */
export interface AnswerPartDefinition {

    id: string;

    /**
     * Shown as a small heading above this part's own
     * rendered answer -- omitted entirely when blank (the
     * unlabeled leading part described above).
     */
    label: string;

    answer: AnswerDefinition;

    /**
     * This part's OWN question text, shown directly above its
     * editor rather than with the rest of the Section's questions
     * above the progress line.
     *
     * Sourced from a "### <Part Label>" sub-heading inside the
     * Section's own block in the Questions Resource, matched to
     * this part by label (see FrameworkInterpreter's
     * attachPartQuestions). Undefined for every part whose Section
     * declares no such sub-heading -- which is every Section in
     * every System that hasn't opted into it, so the Section-level
     * question block keeps behaving exactly as before.
     */
    questions?: string;

}
