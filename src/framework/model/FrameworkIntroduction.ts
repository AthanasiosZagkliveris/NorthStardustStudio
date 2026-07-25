import { Section } from "./Section";

/**
 * Represents the information shown
 * before the interview begins.
 */
export interface FrameworkIntroduction {

    /**
     * Framework title.
     */
    title: string;

    /**
     * Organizational capability.
     */
    capability: string;

    /**
     * Primary guiding question.
     */
    guidingQuestion: string;

    /**
     * Official Framework scope.
     */
    systemScope: string;

    /**
     * Informational sections displayed
     * before the interview.
     */
    sections: Section[];

}