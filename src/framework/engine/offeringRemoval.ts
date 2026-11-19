/*
    AN OFFERING REMOVED LEAVES NO CARD POINTING AT IT (owner, Thanos, 2026-11-19: removing an Offering clears it from every card that points to it). When an
    Offering goes from the Business System's Foundation -- its card removed, or the Segment that held it --, its id is unticked on every card that stores
    Offering ids: Infrastructure & Capability's resources, activities, partners and suppliers (`offeringIds`, `offeringShares`), Customer Engagement's channels
    (`offerings`, a list of ids) and the Legal Entity's expenses (`offeringIds`, `offeringShares`). The fields are found by their NAME wherever they stand
    in an answer, never by a card's place (ai-collaboration-rules.md, "Read the app's structure by what a thing is"), so a card kind added later is cleared
    too. What is keyed by an Offering rather than ticked -- its demand, its relationships, its revenue stream (shown "Offering removed" on purpose) -- stays.
    The shared basis key of a split (OFFERING_BASIS_KEY) stays; a share of the removed Offering goes with it.
*/

/** The Offering ids an answer held before and holds now that it no longer does: the Offerings removed. */
export function removedOfferingIds(before: readonly string[], now: readonly string[]): string[] {
    const kept = new Set(now);
    return [...new Set(before)].filter(id => id && !kept.has(id));
}

/** An answer with the removed Offerings unticked on every card in it: a list named `offeringIds` or `offerings` (of ids) loses them, and so does a map named `offeringShares`. */
export function withoutOfferings<T>(value: T, removed: readonly string[]): T {
    if (removed.length === 0) {
        return value;
    }
    const gone = new Set(removed);
    const walk = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            return node.map(walk);
        }
        if (!node || typeof node !== "object") {
            return node;
        }
        const out: Record<string, unknown> = {};
        for (const [key, field] of Object.entries(node as Record<string, unknown>)) {
            if ((key === "offeringIds" || key === "offerings") && Array.isArray(field) && field.every(entry => typeof entry === "string")) {
                out[key] = field.filter(id => !gone.has(id as string));
            } else if (key === "offeringShares" && field && typeof field === "object" && !Array.isArray(field)) {
                out[key] = Object.fromEntries(Object.entries(field as Record<string, unknown>).filter(([id]) => !gone.has(id)));
            } else {
                out[key] = walk(field);
            }
        }
        return out;
    };
    return walk(value) as T;
}

/** Whether an answer holds any of the removed Offerings on a card (so it needs saving again). */
export function holdsOfferings(value: unknown, removed: readonly string[]): boolean {
    return removed.length > 0 && JSON.stringify(withoutOfferings(value, removed)) !== JSON.stringify(value);
}
