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

}
