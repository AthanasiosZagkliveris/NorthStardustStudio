import { Section } from "./Section";

/**
 * Information displayed before the interview begins.
 */
export interface FrameworkIntroduction {

    /**
     * Framework System title.
     */
    title: string;

    /**
     * Introduction content.
     */
    sections: Section[];

}