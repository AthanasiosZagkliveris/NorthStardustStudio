import { Metadata } from "./Metadata";
import { FrameworkIntroduction } from "./FrameworkIntroduction";
import { Section } from "./Section";

/**
 * Represents one fully interpreted
 * Framework System, ready to drive
 * an Interview Session.
 */
export interface FrameworkDocument {

    /**
     * Framework System metadata.
     */
    metadata: Metadata;

    /**
     * Read-only information displayed
     * before the interview begins.
     */
    introduction: FrameworkIntroduction;

    /**
     * Interview Sections.
     */
    sections: Section[];

}
