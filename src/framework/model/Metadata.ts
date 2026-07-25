/**
 * Framework metadata extracted from the
 * Markdown document front matter.
 */
export interface Metadata {

    /**
     * Framework System number.
     *
     * Example:
     * 1
     */
    systemNumber: number;

    /**
     * Framework System name.
     *
     * Example:
     * Identity System
     */
    systemName: string;

    /**
     * Original organizational capability.
     *
     * Example:
     * Foundation
     */
    capability: string;

    /**
     * Organizational question answered
     * by this Framework.
     */
    question: string;

    /**
     * Scope of the Framework.
     */
    scope: string;

    /**
     * Framework version.
     */
    version: number;

}