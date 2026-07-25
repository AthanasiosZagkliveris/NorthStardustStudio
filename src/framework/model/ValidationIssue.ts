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

}