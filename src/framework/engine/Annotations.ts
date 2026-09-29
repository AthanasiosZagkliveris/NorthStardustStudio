import { fieldKey, isWithin, pageKeyPrefix, type FieldKey, type FieldKind } from "./FieldKeys";

/**
 * What a person can say ABOUT an answer, beside the answer itself:
 * how sure it is (a flag) and why it is what it is (a note). Kept
 * with the Organization's answers, keyed by FieldKey, so it exports
 * and imports with them.
 */

/**
 * What is said about an answer by its flag: it needs investigation
 * (with, optionally, what to find out), or -- for a field required
 * only where it applies -- it does not apply. ONE word for the first
 * everywhere, the flag and the built-in statuses that mean the same
 * (a Resource's "Needs Investigation", see BuiltInFlags.ts).
 *
 * The id "research" is what is stored; an older "not-sure" reads as
 * it (normalizeAnnotations).
 */
export type FieldFlag = "research" | "not-applicable";

/** The flags in words, as the buttons offer them and the status line says them. */
export const FIELD_FLAG_WORDS: Record<FieldFlag, string> = {
    "research": "Needs investigation",
    "not-applicable": "Doesn't apply"
};

/** The one line a flag of investigation can carry. */
export const INVESTIGATION_QUESTION = "What do I need to find out?";

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

    /** The field's kind when the annotation was made (FieldKinds.ts). */
    kind?: FieldKind;

    /**
     * Said by the answer itself rather than by a flag: a built-in
     * status that means the same (BuiltInFlags.ts). Never stored.
     */
    builtIn?: boolean;

}

export type Annotations = Record<FieldKey, FieldAnnotation>;

/** Whether an annotation still says anything (a flag, or a note). */
export function annotationIsEmpty(annotation: FieldAnnotation): boolean {
    return !annotation.flag && !(annotation.note ?? "").trim() && !annotation.needsAnswer;
}

/** Whether a flag leaves the answer open: it needs investigation. */
export function flagIsOpen(flag: FieldFlag | undefined): boolean {
    return flag === "research";
}

/**
 * Annotations as stored, read into today's words: the retired "Not
 * sure yet" meant the answer needed investigating, so it reads as
 * Needs investigation.
 */
export function normalizeAnnotations(stored: Record<string, FieldAnnotation>): Annotations {
    let changed = false;
    const out: Annotations = {};
    for (const [key, annotation] of Object.entries(stored)) {
        if ((annotation.flag as string) === "not-sure") {
            changed = true;
            out[key] = { ...annotation, flag: "research" };
        } else {
            out[key] = annotation;
        }
    }
    return changed ? out : stored;
}

/**
 * What marks an Organization's pages for another look, handed to the
 * page and section statuses and the validator: its annotations (flags
 * and notes), and the pages an upstream change has left to check
 * (see UpstreamChanges.ts). `systemNumber` is the System being judged.
 */
export interface ReviewMarks {
    systemNumber: number;
    annotations: Annotations;
    /** Pages (Section numbers) of this System to check again. */
    staleSections?: ReadonlySet<number>;
}

/** Whether a page, a column or a section of it was marked "Doesn't apply". */
export function isNotApplicable(marks: ReviewMarks | undefined, sectionNumber: number, segment: string): boolean {
    return marks?.annotations[fieldKey({ systemNumber: marks.systemNumber, sectionNumber, path: [segment] })]?.flag === "not-applicable";
}

/** Whether anything on a page (or, with `segment`, in one of its sections) is flagged as not settled. */
export function hasOpenFlag(marks: ReviewMarks | undefined, sectionNumber: number, segment?: string): boolean {
    if (!marks) {
        return false;
    }
    const prefix = pageKeyPrefix(marks.systemNumber, sectionNumber);
    const scope = segment ? fieldKey({ systemNumber: marks.systemNumber, sectionNumber, path: [segment] }) : prefix;
    return Object.entries(marks.annotations).some(([key, annotation]) =>
        flagIsOpen(annotation.flag) && (isWithin(key, scope) || (segment !== undefined && key.startsWith(prefix) && annotation.section === segment)));
}
