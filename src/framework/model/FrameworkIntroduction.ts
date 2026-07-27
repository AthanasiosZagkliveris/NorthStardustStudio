import { Section } from "./Section";

/**
 * Read-only information displayed
 * before the interview begins.
 *
 * The interview introduction contains only
 * informational content required to introduce
 * the Framework System.
 *
 * System identification (number and name) is
 * provided by the Framework Metadata.
 */
export interface FrameworkIntroduction {

    /**
     * Framework System title.
     */
    title: string;

    /**
     * Organizational capability
     * this Framework System belongs to.
     */
    capability: string;

    /**
     * Primary organizational question
     * answered by this Framework System.
     */
    guidingQuestion: string;

    /**
     * Official Framework System scope.
     */
    systemScope: string;

    /**
     * The Framework System's introductory
     * text, shown before the interview
     * begins.
     */
    introductionText: string;

    /**
     * Informational sections displayed
     * before the interview.
     *
     * Retained for backward compatibility;
     * the Interview page renders
     * `introductionText` directly instead.
     */
    sections: Section[];

}