import { Metadata } from "./Metadata";
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
     * Ordered Framework Sections.
     */
    sections: Section[];

}