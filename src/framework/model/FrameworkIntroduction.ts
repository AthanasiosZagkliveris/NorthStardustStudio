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
     * Informational sections displayed
     * before the interview.
     */
    sections: Section[];

}