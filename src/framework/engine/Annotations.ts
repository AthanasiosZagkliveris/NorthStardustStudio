import type { FieldKey } from "./FieldKeys";

/**
 * What a person can say ABOUT an answer, beside the answer itself:
 * how sure it is (a flag) and why it is what it is (a note). Kept
 * with the Organization's answers, keyed by FieldKey, so it exports
 * and imports with them.
 */

/** How sure an answer is: the three flags the field menu offers. */
export type FieldFlag = "not-sure" | "research" | "not-applicable";

/** The flags in words, as the menu offers them and the status line says them. */
export const FIELD_FLAG_WORDS: Record<FieldFlag, string> = {
    "not-sure": "Not sure yet",
    "research": "Needs research",
    "not-applicable": "Doesn't apply"
};

export interface FieldAnnotation {

    flag?: FieldFlag;

    /** With "research": what there is to find out (optional). */
    research?: string;

    /** A note on the field (optional). */
    note?: string;

    /** The note still asks for an answer: it goes on the Review page. */
    needsAnswer?: boolean;

    /** The field as its label names it, when the annotation was made. */
    label: string;

    /** The page as its title names it ("3. Legal Entity"). */
    pageTitle: string;

    /**
     * The cards to unfold to reach the field, innermost first (the
     * `data-anchor` tokens around it), for opening it again.
     */
    anchors?: string[];

    /** The page section it sits in (its rail id), for that section's status. */
    section?: string;

}

export type Annotations = Record<FieldKey, FieldAnnotation>;

/** Whether an annotation still says anything (a flag, or a note). */
export function annotationIsEmpty(annotation: FieldAnnotation): boolean {
    return !annotation.flag && !(annotation.note ?? "").trim() && !annotation.needsAnswer;
}

/** Whether a flag leaves the answer open: not sure, or to be researched. */
export function flagIsOpen(flag: FieldFlag | undefined): boolean {
    return flag === "not-sure" || flag === "research";
}
