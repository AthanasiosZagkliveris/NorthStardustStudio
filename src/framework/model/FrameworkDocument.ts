import { Metadata } from "./Metadata";
import { FrameworkIntroduction } from "./FrameworkIntroduction";
import { Section } from "./Section";

/**
 * Runtime representation of a
 * Framework Markdown document.
 *
 * This object is the primary model
 * used throughout the Framework Engine.
 */
export interface FrameworkDocument {

    /**
     * Framework metadata.
     */
    metadata: Metadata;

    /**
     * Read-only Framework introduction.
     *
     * Displayed before the interview.
     */
    introduction: FrameworkIntroduction;

    /**
     * Interview sections.
     *
     * The Overview section is excluded.
     */
    sections: Section[];

}