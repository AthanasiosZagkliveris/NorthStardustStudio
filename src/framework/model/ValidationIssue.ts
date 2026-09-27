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
     * being reported is not numbered with a plain integer -- the
     * Strategy System's nested Themes, Goals and Objectives are
     * numbered by their position in the nesting ("4.1.1.1"), and
     * flattening that to an integer would name a different unit
     * than the page shows.
     *
     * `sectionNumber` stays populated either way, so ordering and
     * de-duplication keep working; this only changes what the user
     * reads.
     */
    label?: string;

}