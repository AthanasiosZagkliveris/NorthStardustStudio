/**
 * Represents one read-only block
 * inside a Framework Section.
 *
 * The Interview renders these blocks
 * before presenting the response area.
 */
export interface SectionBlock {

    /**
     * Block heading.
     *
     * Example:
     * Description
     * Guidance
     * Questions
     * Example
     */
    heading: string;

    /**
     * Block body.
     */
    content: string;

}