/**
 * Framework metadata extracted from the
 * Framework package.
 *
 * This information identifies and describes
 * the Framework System, but is not intended
 * to be rendered directly by the Interview UI.
 */
export interface Metadata {

    /**
     * Framework System number.
     *
     * Example:
     * 13
     */
    systemNumber: number;

    /**
     * Framework System name.
     *
     * Example:
     * Asset System
     */
    systemName: string;

    /**
     * Original organizational capability.
     *
     * Used for Framework organization,
     * recommendations and capability mapping.
     *
     * Example:
     * Deliver Value
     */
    capability: string;

    /**
     * Primary organizational question
     * answered by this Framework.
     *
     * Used for Framework metadata and
     * recommendation purposes.
     */
    question: string;

    /**
     * Official Framework System scope.
     *
     * Used for Framework metadata and
     * capability matching.
     */
    scope: string;

    /**
     * What the System draws from Systems answered before it, in one
     * short line ("Uses From Earlier:" in the Questions header).
     * Shown on the System's opening screen; absent when not authored.
     */
    usesFromEarlier?: string;

    /**
     * How long answering the System takes, roughly ("Thinking
     * Time:" in the Questions header, e.g. "About 1–1½ hours.").
     * Shown on the System's opening screen; absent when not authored.
     */
    thinkingTime?: string;

    /**
     * Framework version.
     */
    version: number;

}