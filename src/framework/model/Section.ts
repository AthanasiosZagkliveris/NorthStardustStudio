import { SectionBlock } from "./SectionBlock";

/**
 * Represents one Framework Section.
 *
 * Each Section is presented as a
 * single Interview page.
 */
export interface Section {

    /**
     * Section number.
     */
    number: number;

    /**
     * Section title.
     */
    title: string;

    /**
     * Read-only Framework content.
     */
    blocks: SectionBlock[];



}