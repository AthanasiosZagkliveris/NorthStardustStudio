/**
 * The one line a folded item card shows next to its name, e.g.
 * "Costs · $35 monthly". Empty parts are skipped, so a half-filled
 * card still reads cleanly.
 */
export function summaryText(...parts: (string | null | undefined | false)[]): string {

    return parts
        .map(part => (typeof part === "string" ? part.trim() : ""))
        .filter(part => part.length > 0)
        .join(" · ");

}
