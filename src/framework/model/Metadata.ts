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
     * Framework version.
     */
    version: number;

}