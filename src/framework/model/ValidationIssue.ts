/**
 * Represents a single Interview
 * validation issue.
 *
 * Each issue identifies one Framework
 * Section that has not yet been completed.
 */
export interface ValidationIssue {

    /**
     * Framework Section number.
     */
    sectionNumber: number;

    /**
     * Framework Section title.
     */
    sectionTitle: string;

    /**
     * What to show in place of `sectionNumber` when the thing
     * being reported is a unit inside a page, named the way that
     * page names it -- "2." for a subsection of a page that numbers
     * its own (see AnswerDefinition.nestedNumbering), or words for
     * the Strategy System's Goals and Objectives ("Theme 1, Goal
     * 2") -- rather than by a running count the page never shows.
     *
     * `sectionNumber` stays populated either way, so ordering and
     * de-duplication keep working; this only changes what the user
     * reads.
     */
    label?: string;

    /**
     * The page (Framework Section number) a labelled unit is on,
     * where `sectionNumber` is a running count of units across the
     * System instead. Absent when `sectionNumber` is the page.
     */
    pageNumber?: number;

}