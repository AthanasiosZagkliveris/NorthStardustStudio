import { ValidationIssue } from "./ValidationIssue";

/**
 * Result returned after validating
 * an Interview Session.
 */
export interface ValidationResult {

    /**
     * Indicates whether the Interview
     * is ready for export.
     */
    valid: boolean;

    /**
     * Sections requiring user attention.
     *
     * Empty when the Interview
     * is valid.
     */
    issues: ValidationIssue[];

}